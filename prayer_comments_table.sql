-- Create table for prayer comments and replies
CREATE TABLE IF NOT EXISTS prayer_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES prayer_comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prayer_comments_prayer_id ON prayer_comments(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_parent_id ON prayer_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_user_id ON prayer_comments(user_id);

-- Function to update comment_count when comments change
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests
    SET comment_count = comment_count + 1
    WHERE id = NEW.prayer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.prayer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update comment_count
DROP TRIGGER IF EXISTS trigger_update_comment_count ON prayer_comments;
CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR DELETE ON prayer_comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_count();
