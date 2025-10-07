-- ============================================
-- SONS OF THUNDER SETUP FOR NEW DATABASE
-- Run this in your Band of Brothers Supabase SQL Editor
-- Replace YOUR_USER_ID with your actual user ID
-- ============================================

-- First, find your user ID by running:
-- SELECT id, email, first_name, last_name FROM users;

-- User: Chase Kellis (thek2way17@gmail.com)
-- User ID: 1e8215b7-fda2-45b0-b240-82956badb472

-- Create the Sons of Thunder mandatory group chat
INSERT INTO chats (id, name, type, created_by, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Fixed UUID for Sons of Thunder
  'Sons of Thunder',
  'mandatory',
  '1e8215b7-fda2-45b0-b240-82956badb472',  -- Chase Kellis
  true
)
ON CONFLICT (id) DO NOTHING;

-- Add Chase as a participant
INSERT INTO chat_participants (chat_id, user_id, is_active, can_send)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '1e8215b7-fda2-45b0-b240-82956badb472',  -- Chase Kellis
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Make Chase an admin of Sons of Thunder
INSERT INTO chat_admins (chat_id, user_id, assigned_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '1e8215b7-fda2-45b0-b240-82956badb472',  -- Chase Kellis
  '1e8215b7-fda2-45b0-b240-82956badb472'   -- Assigned by Chase
)
ON CONFLICT (chat_id, user_id) DO NOTHING;

-- Create chat settings (no member invites allowed for mandatory chats)
INSERT INTO chat_settings (chat_id, allow_member_invites)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  false
)
ON CONFLICT (chat_id) DO NOTHING;

-- Add a welcome message
INSERT INTO chat_messages (chat_id, sender_id, message)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '1e8215b7-fda2-45b0-b240-82956badb472',  -- Chase Kellis
  'Welcome to Sons of Thunder! This is the official Band of Brothers team chat.'
);
