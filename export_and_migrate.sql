-- ============================================
-- STEP 1: Run this in OLD project to get schema
-- (Already have it from the query you ran)
-- ============================================

-- ============================================
-- STEP 2: Create all tables in NEW project
-- Run the entire database_migrations.sql first
-- THEN run these additional tables that aren't in migrations:
-- ============================================

CREATE TABLE IF NOT EXISTS home_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  url text,
  image_url text,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS licensing_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  url text,
  image_url text,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS newrepstart_content_id_seq;

CREATE TABLE IF NOT EXISTS newrepstart_content (
  id integer DEFAULT nextval('newrepstart_content_id_seq'::regclass) PRIMARY KEY,
  title character varying NOT NULL,
  description text,
  url character varying,
  image_url character varying,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  url text,
  image_url text,
  category text,
  day_of_week character varying,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  meeting_id character varying,
  meeting_password character varying,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  url text,
  image_url text,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- STEP 3: Export data from OLD project
-- Run each SELECT and save results as CSV
-- ============================================

-- Copy these queries one by one in OLD project SQL Editor
-- Click "Download as CSV" for each

SELECT * FROM users ORDER BY created_at;
SELECT * FROM chats ORDER BY created_at;
SELECT * FROM chat_participants ORDER BY joined_at;
SELECT * FROM chat_messages ORDER BY sent_at;
SELECT * FROM home_content ORDER BY sort_order;
SELECT * FROM training_content ORDER BY sort_order;
SELECT * FROM schedule_content ORDER BY sort_order;
SELECT * FROM licensing_content ORDER BY sort_order;
SELECT * FROM newrepstart_content ORDER BY sort_order;
SELECT * FROM chat_admins ORDER BY assigned_at;
SELECT * FROM chat_settings ORDER BY created_at;
SELECT * FROM reports ORDER BY created_at;

-- ============================================
-- STEP 4: Import data into NEW project
-- Use Supabase Table Editor > Import Data > Upload CSV
-- Or use these INSERT statements (I'll generate them next)
-- ============================================
