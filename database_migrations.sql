-- ============================================
-- CHAT FEATURES DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. NEW TABLES
-- ============================================

-- Chat Admins Table
CREATE TABLE IF NOT EXISTS chat_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

CREATE INDEX idx_chat_admins_chat_id ON chat_admins(chat_id);
CREATE INDEX idx_chat_admins_user_id ON chat_admins(user_id);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('message', 'user')),
  reported_message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reporter_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_chat_id ON reports(chat_id);

-- Chat Settings Table
CREATE TABLE IF NOT EXISTS chat_settings (
  chat_id UUID PRIMARY KEY REFERENCES chats(id) ON DELETE CASCADE,
  allow_member_invites BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. NEW COLUMNS
-- ============================================

-- Users table additions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'blocked_users') THEN
    ALTER TABLE users ADD COLUMN blocked_users JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'chat_hide_timestamps') THEN
    ALTER TABLE users ADD COLUMN chat_hide_timestamps JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Chat participants additions
ALTER TABLE chat_participants ADD COLUMN IF NOT EXISTS can_send BOOLEAN DEFAULT TRUE;

-- Chat messages additions
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_hidden_by_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS hidden_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- 3. DATA MIGRATION
-- ============================================

-- Create chat_admins entries for all existing group creators
INSERT INTO chat_admins (chat_id, user_id, assigned_by)
SELECT id, created_by, created_by
FROM chats
WHERE type IN ('group', 'mandatory')
  AND created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM chat_admins
    WHERE chat_admins.chat_id = chats.id
      AND chat_admins.user_id = chats.created_by
  );

-- Create chat_settings for all existing groups
INSERT INTO chat_settings (chat_id, allow_member_invites)
SELECT id, FALSE
FROM chats
WHERE type IN ('group', 'mandatory')
  AND NOT EXISTS (
    SELECT 1 FROM chat_settings
    WHERE chat_settings.chat_id = chats.id
  );

-- Update Team Inspire to Sons of Thunder
UPDATE chats
SET name = 'Sons of Thunder'
WHERE type = 'mandatory' AND name = 'Team Inspire';

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE chat_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Chat Admins: Users can view admins of their chats
CREATE POLICY "Users can view chat admins" ON chat_admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = chat_admins.chat_id
        AND chat_participants.user_id = auth.uid()
        AND chat_participants.is_active = TRUE
    )
  );

-- Chat Admins: Only admins can insert/delete admins
CREATE POLICY "Admins can manage chat admins" ON chat_admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chat_admins ca
      WHERE ca.chat_id = chat_admins.chat_id
        AND ca.user_id = auth.uid()
    )
  );

-- Reports: Users can insert their own reports
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT
  WITH CHECK (reported_by = auth.uid());

-- Reports: Users can view their own reports
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT
  USING (reported_by = auth.uid());

-- Reports: Admins can view all reports (add admin check later)
CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Chat Settings: Users can view settings of their chats
CREATE POLICY "Users can view chat settings" ON chat_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.chat_id = chat_settings.chat_id
        AND chat_participants.user_id = auth.uid()
        AND chat_participants.is_active = TRUE
    )
  );

-- Chat Settings: Only admins can update chat settings
CREATE POLICY "Admins can update chat settings" ON chat_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_admins
      WHERE chat_admins.chat_id = chat_settings.chat_id
        AND chat_admins.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin of a chat
CREATE OR REPLACE FUNCTION is_chat_admin(p_chat_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_admins
    WHERE chat_id = p_chat_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can send in a chat
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

-- Function to get user's blocked list
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

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
