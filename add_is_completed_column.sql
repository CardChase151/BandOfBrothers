-- Add is_completed column to prayer_requests table
ALTER TABLE prayer_requests
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Create index for filtering completed prayers
CREATE INDEX IF NOT EXISTS idx_prayer_requests_is_completed ON prayer_requests(is_completed);
