-- ============================================
-- COMPLETE SUPABASE PROJECT MIGRATION
-- From: hhxbzbhetbqzwtuhrbmx (OLD)
-- To: eirvfwrhdrokihrpyqrd (NEW)
-- ============================================

-- ⚡ INSTRUCTIONS:
-- 1. Copy this ENTIRE file
-- 2. Paste into NEW project SQL Editor
-- 3. Click RUN
-- ============================================

-- ============================================
-- PART 1: CREATE ALL TABLES WITH EXACT SCHEMA
-- ============================================

-- Table: users (base table, no dependencies)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    email text,
    first_name text,
    last_name text,
    role text DEFAULT 'user'::text,
    created_at timestamp with time zone DEFAULT now(),
    push_token text,
    last_greeting_index integer,
    team_inspire_enabled boolean DEFAULT true,
    can_create_chats boolean DEFAULT true,
    can_send_messages boolean DEFAULT true,
    hidden_chats jsonb DEFAULT '[]'::jsonb,
    archived_chats jsonb DEFAULT '[]'::jsonb,
    blocked_users jsonb DEFAULT '[]'::jsonb NOT NULL,
    chat_hide_timestamps jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- Table: chats
CREATE TABLE IF NOT EXISTS chats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    type character varying NOT NULL,
    created_by uuid REFERENCES users(id),
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Table: chat_participants
CREATE TABLE IF NOT EXISTS chat_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    last_read_at timestamp with time zone DEFAULT now(),
    can_send boolean DEFAULT true
);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id),
    message text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    is_deleted boolean DEFAULT false,
    is_hidden_by_admin boolean DEFAULT false,
    hidden_by_admin_id uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Table: chat_admins
CREATE TABLE IF NOT EXISTS chat_admins (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at timestamp with time zone DEFAULT now(),
    UNIQUE(chat_id, user_id)
);

-- Table: chat_settings
CREATE TABLE IF NOT EXISTS chat_settings (
    chat_id uuid PRIMARY KEY REFERENCES chats(id) ON DELETE CASCADE,
    allow_member_invites boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: reports
CREATE TABLE IF NOT EXISTS reports (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    reported_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type text NOT NULL CHECK (report_type IN ('message', 'user')),
    reported_message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
    reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    reason text NOT NULL,
    reporter_contact text,
    created_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

-- Table: home_content
CREATE TABLE IF NOT EXISTS home_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    url text,
    image_url text,
    category text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: training_content
CREATE TABLE IF NOT EXISTS training_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    url text,
    image_url text,
    category text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: schedule_content
CREATE TABLE IF NOT EXISTS schedule_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    url text,
    image_url text,
    category text,
    day_of_week character varying,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    meeting_id character varying,
    meeting_password character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: licensing_content
CREATE TABLE IF NOT EXISTS licensing_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    url text,
    image_url text,
    category text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table: newrepstart_content (with sequence)
CREATE SEQUENCE IF NOT EXISTS newrepstart_content_id_seq;

CREATE TABLE IF NOT EXISTS newrepstart_content (
    id integer DEFAULT nextval('newrepstart_content_id_seq'::regclass) PRIMARY KEY,
    title character varying NOT NULL,
    description text,
    url character varying,
    image_url character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- PART 2: CREATE ALL INDEXES
-- ============================================

-- Indexes for chat_admins
CREATE INDEX IF NOT EXISTS idx_chat_admins_chat_id ON chat_admins(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_admins_user_id ON chat_admins(user_id);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_chat_id ON reports(chat_id);

-- Indexes for chat_messages (add if needed for performance)
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages(sent_at DESC);

-- Indexes for chat_participants
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);

-- ============================================
-- PART 3: CREATE ALL FUNCTIONS
-- ============================================

-- Function: is_chat_admin
CREATE OR REPLACE FUNCTION is_chat_admin(p_chat_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_admins
    WHERE chat_id = p_chat_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: can_user_send_in_chat
CREATE OR REPLACE FUNCTION can_user_send_in_chat(p_chat_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_global_permission BOOLEAN;
  v_chat_permission BOOLEAN;
BEGIN
  -- Check global permission
  SELECT can_send_messages INTO v_global_permission
  FROM users
  WHERE id = p_user_id;

  IF v_global_permission = FALSE THEN
    RETURN FALSE;
  END IF;

  -- Check chat-specific permission
  SELECT can_send INTO v_chat_permission
  FROM chat_participants
  WHERE chat_id = p_chat_id AND user_id = p_user_id AND is_active = TRUE;

  RETURN COALESCE(v_chat_permission, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_user_blocked_list
CREATE OR REPLACE FUNCTION get_user_blocked_list(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_blocked_users JSONB;
BEGIN
  SELECT blocked_users INTO v_blocked_users
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_blocked_users, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_user_count (if it exists in old project)
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 4: ENABLE ROW LEVEL SECURITY
-- ============================================

-- NOTE: We're NOT copying RLS policies yet, just enabling RLS
ALTER TABLE chat_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE licensing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE newrepstart_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- MIGRATION COMPLETE - SCHEMA READY
-- Next: Export/Import data
-- Then: Add RLS policies (separate file)
-- ============================================
