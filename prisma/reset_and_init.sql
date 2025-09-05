-- Production-ready schema initialization for ACS Chat Hub
-- This script creates all necessary tables with proper indexes

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in public schema if they exist
DROP TABLE IF EXISTS public.error_logs CASCADE;
DROP TABLE IF EXISTS public.feature_flags CASCADE;
DROP TABLE IF EXISTS public.system_config CASCADE;
DROP TABLE IF EXISTS public.cache_entries CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.shared_chat_links CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.ui_preferences CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.mcp_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_active_login ON public.users(is_active, last_login_at);

-- Create MCP Settings table
CREATE TABLE public.mcp_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  server_url VARCHAR(500) DEFAULT 'http://10.152.0.70:8083',
  timeout INTEGER DEFAULT 30000,
  max_retries INTEGER DEFAULT 3,
  custom_headers JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mcp_settings_user_enabled ON public.mcp_settings(user_id, enabled);
CREATE INDEX idx_mcp_settings_enabled ON public.mcp_settings(enabled);

-- Create API Keys table
CREATE TABLE public.api_keys (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  base_url TEXT,
  model VARCHAR(100),
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  rate_limit_requests INTEGER,
  rate_limit_tokens INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_api_keys_provider_enabled ON public.api_keys(provider, enabled);
CREATE INDEX idx_api_keys_user_enabled ON public.api_keys(user_id, enabled);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);

-- Create UI Preferences table
CREATE TABLE public.ui_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  primary_color VARCHAR(20) DEFAULT '#E53E3E',
  font_size VARCHAR(20) DEFAULT 'medium',
  font_family VARCHAR(50) DEFAULT 'Inter',
  avatar_url TEXT,
  display_name VARCHAR(255) DEFAULT 'User',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  emoji_enabled BOOLEAN DEFAULT true,
  emoji_style VARCHAR(20) DEFAULT 'native',
  sidebar_collapsed BOOLEAN DEFAULT false,
  compact_mode BOOLEAN DEFAULT false,
  show_timestamps BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  code_theme VARCHAR(50) DEFAULT 'github-dark',
  line_numbers BOOLEAN DEFAULT true,
  word_wrap BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ui_preferences_user ON public.ui_preferences(user_id);

-- Create Chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  description TEXT,
  model VARCHAR(100) DEFAULT 'gpt-4',
  system_prompt TEXT,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  token_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

CREATE INDEX idx_chats_user_archived ON public.chats(user_id, is_archived, updated_at);
CREATE INDEX idx_chats_user_pinned ON public.chats(user_id, is_pinned, updated_at);
CREATE INDEX idx_chats_user_created ON public.chats(user_id, created_at);
CREATE INDEX idx_chats_user_last_message ON public.chats(user_id, last_message_at);

-- Create Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  function_name VARCHAR(100),
  function_args JSONB,
  model VARCHAR(100),
  tokens INTEGER DEFAULT 0,
  cost DECIMAL(10, 6),
  latency_ms INTEGER,
  error TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  mcp_tool_used VARCHAR(100),
  mcp_result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP
);

CREATE INDEX idx_messages_chat_created ON public.messages(chat_id, created_at);
CREATE INDEX idx_messages_chat_role ON public.messages(chat_id, role);

-- Create Shared Chat Links table
CREATE TABLE public.shared_chat_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  share_code UUID UNIQUE DEFAULT uuid_generate_v4(),
  password TEXT,
  expires_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  max_views INTEGER,
  is_active BOOLEAN DEFAULT true,
  allow_copy BOOLEAN DEFAULT false,
  allow_continue BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_viewed_at TIMESTAMP
);

CREATE INDEX idx_shared_links_code ON public.shared_chat_links(share_code, is_active);
CREATE INDEX idx_shared_links_chat ON public.shared_chat_links(chat_id);

-- Create Audit Logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action, created_at);

-- Create Cache Entries table
CREATE TABLE public.cache_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP
);

CREATE INDEX idx_cache_key_expires ON public.cache_entries(key, expires_at);
CREATE INDEX idx_cache_expires ON public.cache_entries(expires_at);

-- Create System Config table
CREATE TABLE public.system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_config_key ON public.system_config(key, is_public);

-- Create Feature Flags table
CREATE TABLE public.feature_flags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  enabled_for_users TEXT[] DEFAULT '{}',
  disabled_for_users TEXT[] DEFAULT '{}',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_name ON public.feature_flags(name, enabled);

-- Create Error Logs table
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  context JSONB,
  user_id VARCHAR(255),
  url TEXT,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  notes TEXT,
  occurrence_count INTEGER DEFAULT 1,
  first_occurred_at TIMESTAMP DEFAULT NOW(),
  last_occurred_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_error_logs_level ON public.error_logs(level, resolved);
CREATE INDEX idx_error_logs_user ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_last ON public.error_logs(last_occurred_at);

-- Create default user
INSERT INTO public.users (id, username, email) 
VALUES ('00000000-0000-0000-0000-000000000000', 'default', 'default@localhost')
ON CONFLICT (username) DO NOTHING;

-- Insert default MCP settings
INSERT INTO public.mcp_settings (user_id) 
VALUES ('00000000-0000-0000-0000-000000000000')
ON CONFLICT (user_id) DO NOTHING;

-- Insert default UI preferences
INSERT INTO public.ui_preferences (user_id) 
VALUES ('00000000-0000-0000-0000-000000000000')
ON CONFLICT (user_id) DO NOTHING;

-- Grant permissions to acs_chat_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO acs_chat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO acs_chat_user;
GRANT CREATE ON SCHEMA public TO acs_chat_user;

-- Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mcp_settings_updated_at BEFORE UPDATE ON public.mcp_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ui_preferences_updated_at BEFORE UPDATE ON public.ui_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
