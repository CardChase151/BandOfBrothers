-- Drop the UNIQUE constraint so we can have multiple prayers per user per prayer
ALTER TABLE prayer_interactions DROP CONSTRAINT IF EXISTS prayer_interactions_prayer_id_user_id_key;

-- The trigger will still work fine - each INSERT increments the count
-- Now we can track multiple prayers from the same user over time
