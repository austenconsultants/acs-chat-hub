-- Critical improvements for Claude-like chat agent
-- Apply these changes to make the schema production-ready for AI chat

-- 1. Fix Messages table with proper structure
DROP TABLE IF EXISTS public.messages CASCADE;
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  parent_message_id UUID,
  
  -- Content
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'function')),
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text',
  
  -- Model & tokens (CRITICAL)
  model VARCHAR(50),
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,
  estimated_cost DECIMAL(10,6) DEFAULT 0,
  
  -- Performance
  time_to_first_token_ms INT,
  total_generation_time_ms INT,
  
  -- Streaming
  is_complete BOOLEAN DEFAULT true,
  stream_id VARCHAR(100),
  
  -- Safety
  flagged_for_safety BOOLEAN DEFAULT false,
  safety_scores JSONB,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Token usage tracking (CRITICAL for cost management)
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily tracking
  daily_prompt_tokens INT DEFAULT 0,
  daily_completion_tokens INT DEFAULT 0,
  daily_total_tokens INT GENERATED ALWAYS AS (daily_prompt_tokens + daily_completion_tokens) STORED,
  daily_cost DECIMAL(10,4) DEFAULT 0,
  
  -- Model breakdown
  usage_by_model JSONB DEFAULT '{}',
  
  -- Limits
  daily_limit INT DEFAULT 100000,
  is_over_limit BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- 3. Rate limiting (CRITICAL for abuse prevention)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Request buckets
  requests_per_minute INT DEFAULT 0,
  requests_per_hour INT DEFAULT 0,
  tokens_per_minute INT DEFAULT 0,
  tokens_per_hour INT DEFAULT 0,
  
  -- Reset times
  minute_reset_at TIMESTAMP,
  hour_reset_at TIMESTAMP,
  
  -- Throttling
  is_throttled BOOLEAN DEFAULT false,
  throttled_until TIMESTAMP,
  throttle_reason VARCHAR(100),
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Model configurations for routing
CREATE TABLE IF NOT EXISTS public.model_configs (
  id SERIAL PRIMARY KEY,
  model_name VARCHAR(100) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  
  -- Capabilities
  max_tokens INT NOT NULL,
  max_input_tokens INT,
  supports_streaming BOOLEAN DEFAULT true,
  supports_functions BOOLEAN DEFAULT false,
  supports_vision BOOLEAN DEFAULT false,
  
  -- Costs (per 1K tokens)
  input_cost_per_1k DECIMAL(10,6),
  output_cost_per_1k DECIMAL(10,6),
  
  -- Performance
  avg_latency_ms INT,
  p99_latency_ms INT,
  error_rate FLOAT DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Conversation context management
CREATE TABLE IF NOT EXISTS public.conversation_context (
  chat_id UUID PRIMARY KEY,
  
  -- Context window
  total_tokens_in_context INT DEFAULT 0,
  messages_in_context INT DEFAULT 0,
  context_window_size INT DEFAULT 128000,
  
  -- Summarization
  summary TEXT,
  summary_tokens INT DEFAULT 0,
  summary_updated_at TIMESTAMP,
  key_topics TEXT[],
  
  -- Memory
  important_facts JSONB DEFAULT '[]',
  user_preferences JSONB DEFAULT '{}',
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create all necessary indexes
CREATE INDEX idx_messages_chat_created ON public.messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_parent ON public.messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
CREATE INDEX idx_messages_model ON public.messages(model);
CREATE INDEX idx_messages_streaming ON public.messages(stream_id) WHERE stream_id IS NOT NULL;
CREATE INDEX idx_messages_safety ON public.messages(flagged_for_safety) WHERE flagged_for_safety = true;

CREATE INDEX idx_token_usage_user_date ON public.token_usage(user_id, date DESC);
CREATE INDEX idx_token_usage_over_limit ON public.token_usage(is_over_limit) WHERE is_over_limit = true;

CREATE INDEX idx_rate_limits_throttled ON public.rate_limits(is_throttled) WHERE is_throttled = true;

-- Insert default model configurations
INSERT INTO public.model_configs (model_name, provider, max_tokens, max_input_tokens, supports_streaming, supports_functions, supports_vision, input_cost_per_1k, output_cost_per_1k) VALUES
('gpt-4-turbo', 'openai', 4096, 128000, true, true, true, 0.01, 0.03),
('gpt-4o', 'openai', 4096, 128000, true, true, true, 0.005, 0.015),
('gpt-3.5-turbo', 'openai', 4096, 16385, true, true, false, 0.0005, 0.0015),
('claude-3-opus', 'anthropic', 4096, 200000, true, true, true, 0.015, 0.075),
('claude-3-sonnet', 'anthropic', 4096, 200000, true, true, true, 0.003, 0.015),
('claude-3-haiku', 'anthropic', 4096, 200000, true, true, true, 0.00025, 0.00125)
ON CONFLICT (model_name) DO NOTHING;

-- Add FK constraint for messages after we have the table
ALTER TABLE public.messages ADD CONSTRAINT fk_messages_chat 
  FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;

-- Create update triggers
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_usage_updated_at BEFORE UPDATE ON public.token_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON public.rate_limits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO acs_chat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO acs_chat_user;

-- Verify the improvements
SELECT 
  'Messages' as feature,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'prompt_tokens') 
    THEN '✅ Ready' ELSE '❌ Missing' END as status
UNION ALL
SELECT 'Token Tracking', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'token_usage') 
    THEN '✅ Ready' ELSE '❌ Missing' END
UNION ALL  
SELECT 'Rate Limiting',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') 
    THEN '✅ Ready' ELSE '❌ Missing' END
UNION ALL
SELECT 'Model Configs',
  CASE WHEN EXISTS (SELECT 1 FROM public.model_configs) 
    THEN '✅ Ready' ELSE '❌ Missing' END
UNION ALL
SELECT 'Context Management',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversation_context') 
    THEN '✅ Ready' ELSE '❌ Missing' END;
