-- ============================================
-- AUTO-ADD NEW USERS TO SONS OF THUNDER
-- Run this in Supabase SQL Editor
-- ============================================

-- Create a function that adds new users to the mandatory chat
CREATE OR REPLACE FUNCTION auto_add_user_to_mandatory_chat()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the new user to Sons of Thunder (mandatory chat)
  INSERT INTO chat_participants (chat_id, user_id, is_active, can_send)
  VALUES (
    '00000000-0000-0000-0000-000000000001',  -- Sons of Thunder fixed UUID
    NEW.id,  -- The new user's ID
    true,
    true
  )
  ON CONFLICT DO NOTHING;  -- Skip if already exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires when a new user is inserted
DROP TRIGGER IF EXISTS trigger_add_user_to_mandatory_chat ON users;

CREATE TRIGGER trigger_add_user_to_mandatory_chat
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_user_to_mandatory_chat();

-- ============================================
-- BACKFILL EXISTING USERS
-- Add any existing users who aren't already in the chat
-- ============================================

INSERT INTO chat_participants (chat_id, user_id, is_active, can_send)
SELECT
  '00000000-0000-0000-0000-000000000001',  -- Sons of Thunder
  u.id,
  true,
  true
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM chat_participants cp
  WHERE cp.chat_id = '00000000-0000-0000-0000-000000000001'
    AND cp.user_id = u.id
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- Check how many users are now in Sons of Thunder
-- ============================================

SELECT
  c.name as chat_name,
  COUNT(cp.user_id) as participant_count
FROM chats c
LEFT JOIN chat_participants cp ON c.id = cp.chat_id AND cp.is_active = true
WHERE c.id = '00000000-0000-0000-0000-000000000001'
GROUP BY c.name;
