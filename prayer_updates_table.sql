-- Create table for prayer updates (journal/story feature)
CREATE TABLE IF NOT EXISTS prayer_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  update_text TEXT NOT NULL,
  update_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prayer_updates_prayer_id ON prayer_updates(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_updates_user_id ON prayer_updates(user_id);

-- Add columns to prayer_requests for update tracking
ALTER TABLE prayer_requests
ADD COLUMN IF NOT EXISTS latest_update_text TEXT,
ADD COLUMN IF NOT EXISTS update_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Function to update prayer_requests when update is added
CREATE OR REPLACE FUNCTION update_prayer_on_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests
    SET
      latest_update_text = NEW.update_text,
      update_count = update_count + 1,
      last_updated_at = NEW.created_at
    WHERE id = NEW.prayer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- When an update is deleted, recalculate latest_update_text
    UPDATE prayer_requests pr
    SET
      latest_update_text = (
        SELECT update_text
        FROM prayer_updates
        WHERE prayer_id = OLD.prayer_id
        ORDER BY update_number DESC
        LIMIT 1
      ),
      update_count = GREATEST(0, update_count - 1),
      last_updated_at = COALESCE(
        (SELECT created_at FROM prayer_updates WHERE prayer_id = OLD.prayer_id ORDER BY created_at DESC LIMIT 1),
        pr.created_at
      )
    WHERE id = OLD.prayer_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- When an update is edited, refresh latest if it's the most recent
    UPDATE prayer_requests pr
    SET
      latest_update_text = (
        SELECT update_text
        FROM prayer_updates
        WHERE prayer_id = NEW.prayer_id
        ORDER BY update_number DESC
        LIMIT 1
      ),
      last_updated_at = NEW.created_at
    WHERE id = NEW.prayer_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update prayer_requests
DROP TRIGGER IF EXISTS trigger_update_prayer_on_update ON prayer_updates;
CREATE TRIGGER trigger_update_prayer_on_update
AFTER INSERT OR UPDATE OR DELETE ON prayer_updates
FOR EACH ROW
EXECUTE FUNCTION update_prayer_on_update();
