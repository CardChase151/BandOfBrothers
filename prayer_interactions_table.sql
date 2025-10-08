-- Create table to track prayer interactions (who prayed for which prayer)
CREATE TABLE IF NOT EXISTS prayer_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prayer_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_prayer_id ON prayer_interactions(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_user_id ON prayer_interactions(user_id);

-- Function to update prayer_count when interactions change
CREATE OR REPLACE FUNCTION update_prayer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests
    SET prayer_count = prayer_count + 1
    WHERE id = NEW.prayer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests
    SET prayer_count = GREATEST(0, prayer_count - 1)
    WHERE id = OLD.prayer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update prayer_count
DROP TRIGGER IF EXISTS trigger_update_prayer_count ON prayer_interactions;
CREATE TRIGGER trigger_update_prayer_count
AFTER INSERT OR DELETE ON prayer_interactions
FOR EACH ROW
EXECUTE FUNCTION update_prayer_count();
