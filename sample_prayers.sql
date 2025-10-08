-- Sample SQL to add sample prayers with fake users
-- Run this in your Supabase SQL Editor

-- OPTION 1: Simple version - All prayers will show as your current user
-- Just run the prayer inserts using your existing user_id
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the users table

-- First, let's get your user ID (run this query first to see your ID):
-- SELECT id, first_name, last_name FROM users LIMIT 1;

-- Then replace YOUR_USER_ID_HERE below with your actual UUID

/*
INSERT INTO prayer_requests (user_id, author_name, is_anonymous, category, request_text, is_urgent, prayer_count, comment_count, created_at, updated_at)
VALUES
  (
    'YOUR_USER_ID_HERE',
    'Marcus Thompson',
    false,
    'Addiction/Temptation',
    'Been clean for 6 days. Tonight the battle is fierce. The lies are loud. I need my brothers to stand with me right now.',
    false,
    15,
    3,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  );
*/

-- OPTION 2: Better approach - Remove the foreign key temporarily to add fake users
-- This creates standalone prayer data for testing

-- Step 1: Temporarily disable the foreign key constraint
ALTER TABLE prayer_requests DROP CONSTRAINT IF EXISTS prayer_requests_user_id_fkey;

-- Step 2: Insert sample prayers with fake user IDs (these won't match real users)
INSERT INTO prayer_requests (user_id, author_name, is_anonymous, category, request_text, is_urgent, prayer_count, comment_count, created_at, updated_at)
VALUES
  -- Marcus Thompson - 2 prayers
  (
    '11111111-1111-1111-1111-111111111111',
    'Marcus Thompson',
    false,
    'Addiction/Temptation',
    'Been clean for 6 days. Tonight the battle is fierce. The lies are loud. I need my brothers to stand with me right now.',
    false,
    15,
    3,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Marcus Thompson',
    false,
    'Work/Calling',
    'Starting a new job next week after being unemployed for 3 months. Pray that I would glorify God in this new season and be a light to my coworkers.',
    false,
    8,
    2,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),

  -- David Rodriguez - 2 prayers (1 anonymous, 1 urgent)
  (
    '22222222-2222-2222-2222-222222222222',
    'David Rodriguez',
    true,
    'Marriage/Relationships',
    'My wife and I have been distant lately. I know it is mostly my fault - I have been passive and checked out. Pray for God to soften my heart and give me courage to lead my family well.',
    false,
    22,
    5,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'David Rodriguez',
    false,
    'Spiritual Warfare',
    NULL,
    true,
    31,
    7,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  ),

  -- James Mitchell - 2 prayers (1 urgent, 1 anonymous)
  (
    '33333333-3333-3333-3333-333333333333',
    'James Mitchell',
    false,
    'Addiction/Temptation',
    NULL,
    true,
    19,
    4,
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'James Mitchell',
    true,
    'Work/Calling',
    'Tomorrow I am walking away from my corporate job to start the business God has been pressing on my heart for 2 years. I am terrified but I know He is calling me. Pray I do not turn back.',
    false,
    45,
    12,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  );

-- Step 3: Re-enable the foreign key constraint (OPTIONAL - only if you want to enforce it again)
-- WARNING: Uncomment this if you want strict user validation. Leave commented for testing.
-- ALTER TABLE prayer_requests ADD CONSTRAINT prayer_requests_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES auth.users(id);
