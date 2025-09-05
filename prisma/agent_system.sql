-- Multi-Agent System Schema for ACS
-- Best practices implementation for agent management with GitHub integration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for RAG (if available)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ==================== AGENT MANAGEMENT ====================

-- 1. Core Agent Definitions
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url VARCHAR(500),
  
  -- Personality & Behavior
  persona_type VARCHAR(50) DEFAULT 'professional',
  personality_traits JSONB DEFAULT '[]',
  communication_style TEXT,
  
  -- Capabilities
  capabilities JSONB DEFAULT '[]',
  supported_models TEXT[] DEFAULT ARRAY['gpt-4'],
  preferred_model VARCHAR(100) DEFAULT 'gpt-4',
  
  -- Configuration
  temperature FLOAT DEFAULT 0.7,
  max_tokens INT DEFAULT 4096,
  response_format VARCHAR(20) DEFAULT 'text',
  
  -- GitHub Integration
  github_repo_url VARCHAR(500),
  github_branch VARCHAR(100) DEFAULT 'main',
  github_config_path VARCHAR(255) DEFAULT '/agent-config',
  last_github_sync TIMESTAMP,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  avg_rating FLOAT DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_active ON agents(is_active, is_public);

-- 2. Versioned Agent Prompts
CREATE TABLE IF NOT EXISTS agent_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Prompt Content
  system_prompt TEXT NOT NULL,
  initial_message TEXT,
  context_prompt TEXT,
  
  -- Examples & Templates
  example_conversations JSONB DEFAULT '[]',
  response_templates JSONB DEFAULT '{}',
  
  -- Version Control
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  is_current BOOLEAN DEFAULT true,
  changelog TEXT,
  
  -- GitHub Sync
  github_commit_sha VARCHAR(40),
  github_sync_status VARCHAR(20) DEFAULT 'synced',
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(agent_id, version)
);

CREATE INDEX idx_agent_prompts_current ON agent_prompts(agent_id, is_current);

-- 3. Agent Tools & Functions
CREATE TABLE IF NOT EXISTS agent_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Tool Definition
  tool_name VARCHAR(100) NOT NULL,
  tool_type VARCHAR(50),
  description TEXT,
  
  -- Implementation
  function_schema JSONB NOT NULL,
  implementation_url VARCHAR(500),
  
  -- GitHub Integration
  github_workflow_path VARCHAR(255),
  github_script_path VARCHAR(255),
  
  -- Configuration
  requires_auth BOOLEAN DEFAULT false,
  auth_config JSONB,
  rate_limit INT DEFAULT 100,
  
  -- Usage
  usage_count INT DEFAULT 0,
  last_used TIMESTAMP,
  avg_execution_time_ms INT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(agent_id, tool_name)
);

CREATE INDEX idx_agent_tools_active ON agent_tools(agent_id, is_active);

-- 4. Agent Knowledge Base (for RAG)
CREATE TABLE IF NOT EXISTS agent_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Source
  source_type VARCHAR(50),
  source_url VARCHAR(500),
  
  -- Content
  title VARCHAR(255),
  content TEXT,
  content_hash VARCHAR(64),
  
  -- For vector search (if pgvector installed)
  -- embedding vector(1536),
  embedding_json JSONB, -- Fallback if pgvector not available
  chunk_index INT DEFAULT 0,
  
  -- Metadata
  last_updated TIMESTAMP DEFAULT NOW(),
  update_frequency VARCHAR(20) DEFAULT 'weekly',
  
  UNIQUE(agent_id, content_hash)
);

CREATE INDEX idx_agent_knowledge_agent ON agent_knowledge(agent_id);

-- 5. Agent Sessions
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  chat_id UUID,
  
  -- Session State
  status VARCHAR(20) DEFAULT 'active',
  context JSONB DEFAULT '{}',
  memory JSONB DEFAULT '[]',
  
  -- Metrics
  total_messages INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0,
  
  -- Feedback
  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  last_activity TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_sessions_user ON agent_sessions(user_id, started_at DESC);
CREATE INDEX idx_agent_sessions_agent ON agent_sessions(agent_id, started_at DESC);
CREATE INDEX idx_agent_sessions_active ON agent_sessions(status, last_activity);

-- 6. Agent Templates
CREATE TABLE IF NOT EXISTS agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  
  -- Template
  base_config JSONB NOT NULL,
  required_tools TEXT[],
  required_env_vars TEXT[],
  
  -- GitHub
  github_template_repo VARCHAR(500),
  setup_instructions TEXT,
  
  -- Marketplace
  is_official BOOLEAN DEFAULT false,
  downloads INT DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_templates_category ON agent_templates(category);

-- ==================== DEFAULT AGENTS ====================

-- Insert default ACS agents
INSERT INTO agents (slug, name, description, persona_type, personality_traits, capabilities, github_repo_url) VALUES
('acs-voice', 
 'ACS Voice Expert', 
 'Specialized in voice systems, telephony, and call center operations',
 'technical',
 '["expert", "precise", "solution-oriented"]',
 '["freeswitch_config", "sip_analysis", "call_routing", "ivr_design"]',
 'https://github.com/austentel/agent-acs-voice'),
 
('acs-agent', 
 'ACS General Assistant', 
 'General-purpose assistant for routing and basic support',
 'friendly',
 '["helpful", "patient", "clear"]',
 '["general_support", "routing", "documentation", "troubleshooting"]',
 'https://github.com/austentel/agent-acs-general'),
 
('acs-voice-assistant', 
 'ACS Voice Assistant', 
 'Voice interaction specialist for IVR and speech systems',
 'conversational',
 '["warm", "clear_speaker", "patient", "engaging"]',
 '["tts_generation", "speech_recognition", "ivr_flow", "voice_ux"]',
 'https://github.com/austentel/agent-acs-voice-assistant')
ON CONFLICT (slug) DO NOTHING;

-- Insert default prompts for each agent
INSERT INTO agent_prompts (agent_id, system_prompt, initial_message, version) 
SELECT 
  id,
  CASE slug
    WHEN 'acs-voice' THEN 'You are ACS Voice Expert, a specialized AI assistant with deep expertise in telecommunications, voice systems, and call center operations. You have extensive knowledge of FreeSWITCH, Asterisk, SIP protocol, and VoIP technologies. Always provide practical, implementable solutions with configuration examples and code snippets when relevant.'
    WHEN 'acs-agent' THEN 'You are ACS General Assistant, a helpful and friendly AI assistant. You help users with general inquiries and route them to specialized agents when needed. You maintain a professional yet approachable tone and ensure users feel heard and supported.'
    WHEN 'acs-voice-assistant' THEN 'You are ACS Voice Assistant, specialized in voice user interfaces and conversational AI. You excel at designing IVR flows, optimizing voice interactions, and creating natural conversational experiences. You understand speech synthesis, recognition, and the nuances of voice-based communication.'
  END as system_prompt,
  CASE slug
    WHEN 'acs-voice' THEN 'Hello! I''m your ACS Voice Expert. I specialize in telecommunications, VoIP systems, and call center solutions. How can I help optimize your voice infrastructure today?'
    WHEN 'acs-agent' THEN 'Welcome! I''m your ACS Assistant. I''m here to help with any questions or direct you to the right specialist. What can I assist you with today?'
    WHEN 'acs-voice-assistant' THEN 'Hi there! I''m your Voice Assistant specialist. I can help design IVR flows, optimize voice interactions, and create engaging voice experiences. What would you like to explore?'
  END as initial_message,
  '1.0.0' as version
FROM agents 
WHERE slug IN ('acs-voice', 'acs-agent', 'acs-voice-assistant')
ON CONFLICT (agent_id, version) DO NOTHING;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_agent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agents_updated_at 
  BEFORE UPDATE ON agents 
  FOR EACH ROW EXECUTE FUNCTION update_agent_updated_at();

CREATE TRIGGER trigger_update_agent_sessions_activity 
  BEFORE UPDATE ON agent_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_agent_updated_at();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO acs_chat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO acs_chat_user;

-- Verification query
SELECT 
  'Agents' as component,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 3 THEN '✅ Ready' ELSE '⚠️ Check' END as status
FROM agents
UNION ALL
SELECT 'Agent Prompts', COUNT(*), 
  CASE WHEN COUNT(*) >= 3 THEN '✅ Ready' ELSE '⚠️ Check' END
FROM agent_prompts
UNION ALL
SELECT 'Total Tables', COUNT(*), '✅ Ready'
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'agent%';
