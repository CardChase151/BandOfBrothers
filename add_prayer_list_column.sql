-- Add is_on_list column to prayer_interactions table
-- This allows users to mark prayers for their daily prayer list

ALTER TABLE prayer_interactions
ADD COLUMN IF NOT EXISTS is_on_list BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_is_on_list ON prayer_interactions(user_id, is_on_list) WHERE is_on_list = true;
