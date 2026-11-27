-- ============================================================================
-- ConnectU — Production Database Migration (v3.2.4 Enterprise Hardened Architecture)
-- Architecture: Supabase PostgreSQL (auth.users + public schema)
-- Safety: Fully idempotent and rerun-safe. Preserves all existing records.
-- Notice: Pre-execution revision. Awaiting explicit user approval before apply.
-- 
-- Key v3.2.4 Security & Scoring Enhancements:
-- 1. Exact Category Tie-Breaking:
--    - When categories tie in points, preserves original INTEREST_CATEGORIES_15 array order.
--    - Eliminates alphabetical category tie-breaking.
--    - Enforces consistent ranking across top_interests, secondary_interests, and hobbies.
-- 2. Exact Working-Style Tie-Breaking:
--    - Resolves role ties strictly in frontend initialization order:
--      (1) Technical Builder, (2) Creative Thinker, (3) Strategic Organizer, (4) Analytical Researcher.
--    - Eliminates alphabetical role tie-breaking.
-- 3. Exact Sequential Hobby Derivation:
--    - Traverses top 5 positive-scoring categories in exact rank order.
--    - Appends each category's defined hobbies (1..3).
--    - Deduplicates while strictly preserving first-appearance insertion order.
--    - Returns first 3 unique hobbies without limiting to one hobby per category.
-- 4. Hardened Profile Email Security:
--    - sanitize_profile_insert() strictly binds NEW.email from auth.users (auth.uid()).
--    - Rejects profile creation if a verified authenticated email is unavailable.
-- 5. Legacy RLS Policy Audit & Cleansing:
--    - Automated dynamic cleanup loop over pg_policies for all 9 tables.
--    - Replaces outdated permissive policies with strict least-privilege policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS & SCHEMA PREPARATION
-- ----------------------------------------------------------------------------
BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Core Student Identity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT 'Student',
  avatar_url text DEFAULT '',
  university text DEFAULT NULL,
  college text DEFAULT NULL,
  branch text DEFAULT NULL,
  academic_year text DEFAULT NULL,
  semester text DEFAULT NULL,
  bio text DEFAULT '',
  skills text[] DEFAULT '{}'::text[],
  interests text[] DEFAULT '{}'::text[],
  collaboration_preferences text[] DEFAULT '{}'::text[],
  
  -- Quiz results & computed persona (cached for matching engine)
  working_style text DEFAULT NULL,
  top_interests text[] DEFAULT '{}'::text[],
  secondary_interests text[] DEFAULT '{}'::text[],
  hobbies text[] DEFAULT '{}'::text[],
  interest_scores jsonb DEFAULT '{}'::jsonb,
  quiz_answers jsonb DEFAULT '{}'::jsonb,
  quiz_completed boolean DEFAULT false,
  quiz_completed_at timestamptz DEFAULT NULL,
  profile_completion integer DEFAULT 0,
  
  -- Privacy & visibility controls
  is_public boolean DEFAULT true,
  show_online_status boolean DEFAULT true,
  allow_direct_messages boolean DEFAULT true,
  
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add missing columns to pre-existing tables without overwriting defaults
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text DEFAULT 'Student',
  ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS university text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS college text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS branch text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS academic_year text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS semester text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '',
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS collaboration_preferences text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS working_style text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS top_interests text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS secondary_interests text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS interest_scores jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS quiz_answers jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS quiz_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiz_completed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS profile_completion integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_online_status boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_direct_messages boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now());

-- ----------------------------------------------------------------------------
-- 2. PROFILE INSERT SANITIZATION TRIGGER
-- Prevents clients from injecting fabricated quiz scores or completion on profile insert.
-- Strictly binds email to verified auth.users record. Rejects client-supplied email.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sanitize_profile_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_auth_email text;
BEGIN
  -- If inserted from a client API session (auth.role() is 'authenticated' or 'anon'),
  -- unconditionally force identity, verified email, computed quiz fields, and completion to safe default values.
  -- Administrative sessions (postgres, service_role, migrations) and nested auth triggers (depth > 1) pass smoothly.
  IF pg_trigger_depth() = 1 
     AND auth.role() IN ('authenticated', 'anon') 
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required to create a student profile.';
    END IF;

    -- Force ID strictly to the authenticated user ID
    NEW.id := auth.uid();

    -- Retrieve verified email strictly from auth.users (never fall back to client-supplied email)
    SELECT COALESCE(email, raw_user_meta_data->>'email', '') INTO v_auth_email FROM auth.users WHERE id = auth.uid();

    IF v_auth_email IS NULL OR trim(v_auth_email) = '' THEN
      RAISE EXCEPTION 'A verified authenticated email from auth.users is required to create a profile.';
    END IF;

    NEW.email := v_auth_email;

    -- Reset all computed quiz fields and completion to safe initial defaults
    NEW.working_style := NULL;
    NEW.top_interests := '{}'::text[];
    NEW.secondary_interests := '{}'::text[];
    NEW.hobbies := '{}'::text[];
    NEW.interest_scores := '{}'::jsonb;
    NEW.quiz_answers := '{}'::jsonb;
    NEW.quiz_completed := false;
    NEW.quiz_completed_at := NULL;
    NEW.profile_completion := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_insert_sanitize ON public.profiles;
CREATE TRIGGER on_profile_insert_sanitize
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_profile_insert();

-- ----------------------------------------------------------------------------
-- 3. PROFILE SENSITIVE COLUMN PROTECTION TRIGGER
-- Protects ID, email, profile_completion, and computed quiz fields from direct client mutation.
-- Direct client updates at pg_trigger_depth() = 1 are rejected.
-- Nested updates from trusted triggers (depth > 1) pass smoothly.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Disallow mutating profile ID
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Profile ID cannot be modified.';
  END IF;

  -- Protect email: email must only be updated by auth triggers or service_role
  IF NEW.email IS DISTINCT FROM OLD.email 
     AND auth.role() IN ('authenticated', 'anon') 
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    NEW.email = OLD.email;
  END IF;

  -- Protect computed quiz results & profile completion from direct client manipulation
  IF pg_trigger_depth() = 1 
     AND auth.role() IN ('authenticated', 'anon') 
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF NEW.interest_scores IS DISTINCT FROM OLD.interest_scores OR
       NEW.working_style IS DISTINCT FROM OLD.working_style OR
       NEW.top_interests IS DISTINCT FROM OLD.top_interests OR
       NEW.secondary_interests IS DISTINCT FROM OLD.secondary_interests OR
       NEW.hobbies IS DISTINCT FROM OLD.hobbies OR
       NEW.quiz_answers IS DISTINCT FROM OLD.quiz_answers OR
       NEW.quiz_completed IS DISTINCT FROM OLD.quiz_completed OR
       NEW.quiz_completed_at IS DISTINCT FROM OLD.quiz_completed_at THEN
      RAISE EXCEPTION 'Computed quiz fields cannot be directly modified on profiles. Submit quiz results through submit_quiz_result().';
    END IF;

    IF NEW.profile_completion IS DISTINCT FROM OLD.profile_completion THEN
      RAISE EXCEPTION 'profile_completion cannot be directly modified. It is managed automatically by platform triggers.';
    END IF;
  END IF;

  -- Maintain updated timestamp
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_update_protect ON public.profiles;
CREATE TRIGGER on_profile_update_protect
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- ----------------------------------------------------------------------------
-- 4. GOOGLE AUTHENTICATION & NEW USER TRIGGER
-- Automatically provisions profiles on signup without placeholder values
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    profile_completion
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', 'Student'), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = CASE 
      WHEN public.profiles.email IS NULL OR public.profiles.email = '' 
      THEN EXCLUDED.email 
      ELSE public.profiles.email 
    END,
    full_name = CASE
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' OR public.profiles.full_name = 'Student'
      THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    avatar_url = CASE
      WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = ''
      THEN EXCLUDED.avatar_url
      ELSE public.profiles.avatar_url
    END,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Safe backfill for existing authenticated users missing a profile record
INSERT INTO public.profiles (id, email, full_name, avatar_url, profile_completion)
SELECT 
  u.id,
  COALESCE(u.email, u.raw_user_meta_data->>'email', ''),
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(COALESCE(u.email, u.raw_user_meta_data->>'email', 'Student'), '@', 1)
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture',
    ''
  ),
  0
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO UPDATE SET
  email = CASE 
    WHEN public.profiles.email IS NULL OR public.profiles.email = '' 
    THEN EXCLUDED.email 
    ELSE public.profiles.email 
  END,
  full_name = CASE
    WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' OR public.profiles.full_name = 'Student'
    THEN EXCLUDED.full_name
    ELSE public.profiles.full_name
  END,
  avatar_url = CASE
    WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = ''
    THEN EXCLUDED.avatar_url
    ELSE public.profiles.avatar_url
  END;

-- ----------------------------------------------------------------------------
-- 5. PUBLIC DISCOVERY VIEW (Data Privacy Boundary)
-- Exposes ONLY vetted attributes. Excludes email, quiz_answers, interest_scores, settings.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_profiles WITH (security_barrier = true) AS
SELECT
  id,
  full_name,
  avatar_url,
  university,
  college,
  branch,
  academic_year,
  semester,
  bio,
  skills,
  interests,
  collaboration_preferences,
  working_style,
  top_interests,
  secondary_interests,
  hobbies,
  quiz_completed,
  profile_completion,
  show_online_status,
  allow_direct_messages,
  created_at
FROM public.profiles
WHERE COALESCE(is_public, true) = true;

-- Explicitly configure view permissions: authenticated discovery only
REVOKE ALL ON public.public_profiles FROM anon, public;
GRANT SELECT ON public.public_profiles TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 6. HISTORICAL QUIZ ATTEMPTS & TRUSTED PROFILE SYNCHRONIZATION
-- Submissions flow strictly via submit_quiz_result() -> quiz_attempts -> trigger -> profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL,
  working_style text NOT NULL,
  top_interests text[] NOT NULL DEFAULT '{}'::text[],
  secondary_interests text[] NOT NULL DEFAULT '{}'::text[],
  hobbies text[] DEFAULT '{}'::text[],
  interest_scores jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure secondary_interests column exists if table pre-existed
ALTER TABLE public.quiz_attempts 
  ADD COLUMN IF NOT EXISTS secondary_interests text[] DEFAULT '{}'::text[];

-- Revoke direct modification privileges from clients on quiz_attempts
REVOKE INSERT, UPDATE, DELETE ON public.quiz_attempts FROM authenticated, anon, public;
GRANT SELECT ON public.quiz_attempts TO authenticated;

-- Trusted Trigger Function: Synchronize validated quiz attempt to active student profile
-- Executes inside AFTER INSERT on quiz_attempts (pg_trigger_depth() > 1) so it safely
-- updates profiles without triggering the direct-mutation block in protect_profile_fields().
CREATE OR REPLACE FUNCTION public.sync_quiz_attempt_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.profiles
  SET
    working_style = NEW.working_style,
    top_interests = NEW.top_interests,
    secondary_interests = NEW.secondary_interests,
    hobbies = NEW.hobbies,
    interest_scores = NEW.interest_scores,
    quiz_answers = NEW.answers,
    quiz_completed = true,
    quiz_completed_at = NEW.completed_at,
    profile_completion = GREATEST(profile_completion, 85),
    updated_at = timezone('utc'::text, now())
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_quiz_attempt_inserted ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_inserted
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.sync_quiz_attempt_to_profile();

-- ----------------------------------------------------------------------------
-- 7. CONNECTU QUIZ SCORING ENGINE & RPC INTERFACES
-- ----------------------------------------------------------------------------
-- Server-Side Scoring Implementation:
-- Evaluates answers according to the actual ConnectU 12-question quiz rules
-- without trusting client-computed score inputs.
-- Enforces frontend array order tie-breaking for interest categories (INTEREST_CATEGORIES_15).
-- Enforces frontend initialization order tie-breaking for working styles (roleScores).
-- Implements exact sequential hobby collection and deduplication matching quizEngine.js.
CREATE OR REPLACE FUNCTION public.calculate_quiz_scores(p_answers jsonb)
RETURNS TABLE (
  working_style text,
  top_interests text[],
  secondary_interests text[],
  hobbies text[],
  interest_scores jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_scores jsonb;
  v_top text[];
  v_sec text[];
  v_best_role text;
  v_hobbies text[];
  v_opt text;
  v_max_score int;
BEGIN
  -- 1. Validate payload structure
  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Quiz answers payload must be a valid JSON object.';
  END IF;

  -- 2. Validate exactly 12 answers
  IF (SELECT count(*) FROM jsonb_object_keys(p_answers)) <> 12 THEN
    RAISE EXCEPTION 'Quiz submission must contain answers to exactly 12 questions (received % answers).',
      (SELECT count(*) FROM jsonb_object_keys(p_answers));
  END IF;

  -- 3. Validate every question 1..12 and its selected option ID against frontend quizEngine.js
  FOR i IN 1..12 LOOP
    -- Key must be present as a string of the question number
    IF NOT (p_answers ? (i::text)) THEN
      RAISE EXCEPTION 'Missing answer for quiz question %.', i;
    END IF;

    -- Value must strictly be a JSON string
    IF jsonb_typeof((p_answers -> (i::text))) <> 'string' THEN
      RAISE EXCEPTION 'Answer for quiz question % must be a string option identifier.', i;
    END IF;

    v_opt := (p_answers ->> (i::text));
    IF v_opt IS NULL OR trim(v_opt) = '' THEN
      RAISE EXCEPTION 'Empty answer for quiz question %.', i;
    END IF;

    -- Strict validation against each question's actual options in quizEngine.js
    CASE i
      WHEN 1 THEN IF v_opt NOT IN ('1A', '1B', '1C', '1D') THEN RAISE EXCEPTION 'Invalid option % for question 1.', v_opt; END IF;
      WHEN 2 THEN IF v_opt NOT IN ('2A', '2B', '2C', '2D') THEN RAISE EXCEPTION 'Invalid option % for question 2.', v_opt; END IF;
      WHEN 3 THEN IF v_opt NOT IN ('3A', '3B', '3C', '3D') THEN RAISE EXCEPTION 'Invalid option % for question 3.', v_opt; END IF;
      WHEN 4 THEN IF v_opt NOT IN ('4A', '4B', '4C', '4D') THEN RAISE EXCEPTION 'Invalid option % for question 4.', v_opt; END IF;
      WHEN 5 THEN IF v_opt NOT IN ('5A', '5B', '5C', '5D') THEN RAISE EXCEPTION 'Invalid option % for question 5.', v_opt; END IF;
      WHEN 6 THEN IF v_opt NOT IN ('6A', '6B', '6C', '6D') THEN RAISE EXCEPTION 'Invalid option % for question 6.', v_opt; END IF;
      WHEN 7 THEN IF v_opt NOT IN ('7A', '7B', '7C', '7D') THEN RAISE EXCEPTION 'Invalid option % for question 7.', v_opt; END IF;
      WHEN 8 THEN IF v_opt NOT IN ('8A', '8B', '8C', '8D') THEN RAISE EXCEPTION 'Invalid option % for question 8.', v_opt; END IF;
      WHEN 9 THEN IF v_opt NOT IN ('9A', '9B', '9C', '9D') THEN RAISE EXCEPTION 'Invalid option % for question 9.', v_opt; END IF;
      WHEN 10 THEN IF v_opt NOT IN ('10A', '10B', '10C', '10D') THEN RAISE EXCEPTION 'Invalid option % for question 10.', v_opt; END IF;
      WHEN 11 THEN IF v_opt NOT IN ('11A', '11B', '11C', '11D') THEN RAISE EXCEPTION 'Invalid option % for question 11.', v_opt; END IF;
      WHEN 12 THEN IF v_opt NOT IN ('12A', '12B', '12C', '12D') THEN RAISE EXCEPTION 'Invalid option % for question 12.', v_opt; END IF;
    END CASE;
  END LOOP;

  -- 4. Calculate scores, roles, and derive top hobbies
  WITH user_answers AS (
    SELECT key::int AS q_id, value AS opt_id
    FROM jsonb_each_text(p_answers)
  ),
  weight_matrix(opt_id, category, weight, role, role_weight) AS (
    VALUES
      -- Q1
      ('1A', 'Technology and Programming', 4, 'Technical Builder', 3),
      ('1A', 'Artificial Intelligence and Machine Learning', 2, 'Technical Builder', 0),
      ('1A', 'Data Science and Analytics', 1, 'Technical Builder', 0),
      ('1B', 'Gaming and Esports', 3, 'Creative Thinker', 1),
      ('1B', 'Music and Entertainment', 3, 'Creative Thinker', 0),
      ('1C', 'Art and Graphic Design', 4, 'Creative Thinker', 3),
      ('1C', 'Photography and Video Editing', 3, 'Creative Thinker', 0),
      ('1C', 'Music and Entertainment', 1, 'Creative Thinker', 0),
      ('1D', 'Reading and Education', 4, 'Analytical Researcher', 3),
      ('1D', 'Research and Science', 3, 'Analytical Researcher', 0),
      ('1D', 'Psychology and Human Behavior', 1, 'Analytical Researcher', 0),
      -- Q2
      ('2A', 'Technology and Programming', 4, 'Technical Builder', 3),
      ('2A', 'Entrepreneurship and Business', 2, 'Technical Builder', 0),
      ('2A', 'Artificial Intelligence and Machine Learning', 1, 'Technical Builder', 0),
      ('2B', 'Sports and Fitness', 4, 'Strategic Organizer', 1),
      ('2B', 'Gaming and Esports', 2, 'Strategic Organizer', 0),
      ('2B', 'Social Activities and Community Building', 2, 'Strategic Organizer', 0),
      ('2C', 'Music and Entertainment', 3, 'Creative Thinker', 3),
      ('2C', 'Photography and Video Editing', 3, 'Creative Thinker', 0),
      ('2C', 'Art and Graphic Design', 2, 'Creative Thinker', 0),
      ('2D', 'Reading and Education', 3, 'Analytical Researcher', 3),
      ('2D', 'Research and Science', 3, 'Analytical Researcher', 0),
      ('2D', 'Social Activities and Community Building', 2, 'Analytical Researcher', 0),
      -- Q3
      ('3A', 'Artificial Intelligence and Machine Learning', 4, 'Technical Builder', 3),
      ('3A', 'Technology and Programming', 3, 'Technical Builder', 0),
      ('3A', 'Data Science and Analytics', 2, 'Technical Builder', 0),
      ('3B', 'Entrepreneurship and Business', 4, 'Strategic Organizer', 3),
      ('3B', 'Marketing and Management', 3, 'Strategic Organizer', 0),
      ('3B', 'Communication and Public Speaking', 1, 'Strategic Organizer', 0),
      ('3C', 'Art and Graphic Design', 3, 'Creative Thinker', 3),
      ('3C', 'Photography and Video Editing', 3, 'Creative Thinker', 0),
      ('3C', 'Music and Entertainment', 2, 'Creative Thinker', 0),
      ('3D', 'Psychology and Human Behavior', 4, 'Analytical Researcher', 3),
      ('3D', 'Research and Science', 3, 'Analytical Researcher', 0),
      ('3D', 'Communication and Public Speaking', 2, 'Analytical Researcher', 0),
      -- Q4
      ('4A', 'Technology and Programming', 3, 'Technical Builder', 2),
      ('4A', 'Artificial Intelligence and Machine Learning', 3, 'Technical Builder', 0),
      ('4B', 'Gaming and Esports', 3, 'Creative Thinker', 1),
      ('4B', 'Sports and Fitness', 3, 'Creative Thinker', 0),
      ('4B', 'Music and Entertainment', 1, 'Creative Thinker', 0),
      ('4C', 'Music and Entertainment', 3, 'Creative Thinker', 2),
      ('4C', 'Art and Graphic Design', 3, 'Creative Thinker', 0),
      ('4C', 'Photography and Video Editing', 2, 'Creative Thinker', 0),
      ('4D', 'Reading and Education', 3, 'Analytical Researcher', 2),
      ('4D', 'Psychology and Human Behavior', 3, 'Analytical Researcher', 0),
      ('4D', 'Research and Science', 2, 'Analytical Researcher', 0),
      -- Q5
      ('5A', 'Artificial Intelligence and Machine Learning', 4, 'Technical Builder', 4),
      ('5A', 'Technology and Programming', 3, 'Technical Builder', 0),
      ('5A', 'Data Science and Analytics', 2, 'Technical Builder', 0),
      ('5B', 'Entrepreneurship and Business', 4, 'Strategic Organizer', 4),
      ('5B', 'Marketing and Management', 3, 'Strategic Organizer', 0),
      ('5B', 'Social Activities and Community Building', 3, 'Strategic Organizer', 0),
      ('5C', 'Art and Graphic Design', 3, 'Creative Thinker', 4),
      ('5C', 'Photography and Video Editing', 3, 'Creative Thinker', 0),
      ('5C', 'Music and Entertainment', 2, 'Creative Thinker', 0),
      ('5C', 'Technology and Programming', 1, 'Creative Thinker', 0),
      ('5D', 'Research and Science', 4, 'Analytical Researcher', 4),
      ('5D', 'Social Activities and Community Building', 3, 'Analytical Researcher', 0),
      ('5D', 'Psychology and Human Behavior', 2, 'Analytical Researcher', 0),
      -- Q6
      ('6A', 'Technology and Programming', 4, 'Technical Builder', 3),
      ('6A', 'Data Science and Analytics', 2, 'Technical Builder', 0),
      ('6B', 'Gaming and Esports', 3, 'Strategic Organizer', 1),
      ('6B', 'Sports and Fitness', 4, 'Strategic Organizer', 0),
      ('6C', 'Art and Graphic Design', 3, 'Creative Thinker', 3),
      ('6C', 'Music and Entertainment', 3, 'Creative Thinker', 0),
      ('6C', 'Photography and Video Editing', 3, 'Creative Thinker', 0),
      ('6D', 'Reading and Education', 3, 'Analytical Researcher', 3),
      ('6D', 'Research and Science', 3, 'Analytical Researcher', 0),
      ('6D', 'Communication and Public Speaking', 2, 'Analytical Researcher', 0),
      -- Q7
      ('7A', 'Technology and Programming', 3, 'Technical Builder', 3),
      ('7A', 'Data Science and Analytics', 3, 'Technical Builder', 0),
      ('7A', 'Artificial Intelligence and Machine Learning', 3, 'Technical Builder', 0),
      ('7B', 'Entrepreneurship and Business', 3, 'Strategic Organizer', 3),
      ('7B', 'Marketing and Management', 4, 'Strategic Organizer', 0),
      ('7B', 'Communication and Public Speaking', 2, 'Strategic Organizer', 0),
      ('7C', 'Art and Graphic Design', 3, 'Creative Thinker', 3),
      ('7C', 'Communication and Public Speaking', 3, 'Creative Thinker', 0),
      ('7C', 'Photography and Video Editing', 2, 'Creative Thinker', 0),
      ('7D', 'Psychology and Human Behavior', 4, 'Analytical Researcher', 3),
      ('7D', 'Research and Science', 3, 'Analytical Researcher', 0),
      ('7D', 'Social Activities and Community Building', 2, 'Analytical Researcher', 0),
      -- Q8
      ('8A', 'Technology and Programming', 4, 'Technical Builder', 3),
      ('8A', 'Artificial Intelligence and Machine Learning', 2, 'Technical Builder', 0),
      ('8B', 'Entrepreneurship and Business', 3, 'Strategic Organizer', 3),
      ('8B', 'Sports and Fitness', 3, 'Strategic Organizer', 0),
      ('8B', 'Marketing and Management', 2, 'Strategic Organizer', 0),
      ('8C', 'Music and Entertainment', 3, 'Creative Thinker', 3),
      ('8C', 'Photography and Video Editing', 3, 'Creative Thinker', 0),
      ('8C', 'Art and Graphic Design', 2, 'Creative Thinker', 0),
      ('8D', 'Communication and Public Speaking', 4, 'Analytical Researcher', 3),
      ('8D', 'Research and Science', 3, 'Analytical Researcher', 0),
      ('8D', 'Reading and Education', 2, 'Analytical Researcher', 0),
      -- Q9
      ('9A', 'Technology and Programming', 4, 'Technical Builder', 4),
      ('9A', 'Data Science and Analytics', 1, 'Technical Builder', 0),
      ('9B', 'Marketing and Management', 4, 'Strategic Organizer', 4),
      ('9B', 'Entrepreneurship and Business', 3, 'Strategic Organizer', 0),
      ('9B', 'Social Activities and Community Building', 3, 'Strategic Organizer', 0),
      ('9C', 'Art and Graphic Design', 4, 'Creative Thinker', 4),
      ('9C', 'Communication and Public Speaking', 2, 'Creative Thinker', 0),
      ('9C', 'Photography and Video Editing', 2, 'Creative Thinker', 0),
      ('9D', 'Research and Science', 4, 'Analytical Researcher', 4),
      ('9D', 'Data Science and Analytics', 3, 'Analytical Researcher', 0),
      ('9D', 'Reading and Education', 2, 'Analytical Researcher', 0),
      -- Q10
      ('10A', 'Technology and Programming', 3, 'Technical Builder', 3),
      ('10A', 'Artificial Intelligence and Machine Learning', 3, 'Technical Builder', 0),
      ('10A', 'Data Science and Analytics', 3, 'Technical Builder', 0),
      ('10B', 'Marketing and Management', 3, 'Strategic Organizer', 3),
      ('10B', 'Entrepreneurship and Business', 3, 'Strategic Organizer', 0),
      ('10B', 'Communication and Public Speaking', 3, 'Strategic Organizer', 0),
      ('10C', 'Art and Graphic Design', 3, 'Creative Thinker', 3),
      ('10C', 'Photography and Video Editing', 3, 'Creative Thinker', 0),
      ('10C', 'Music and Entertainment', 3, 'Creative Thinker', 0),
      ('10D', 'Research and Science', 3, 'Analytical Researcher', 3),
      ('10D', 'Communication and Public Speaking', 3, 'Analytical Researcher', 0),
      ('10D', 'Psychology and Human Behavior', 3, 'Analytical Researcher', 0),
      -- Q11
      ('11A', 'Technology and Programming', 3, 'Technical Builder', 3),
      ('11A', 'Artificial Intelligence and Machine Learning', 2, 'Technical Builder', 0),
      ('11B', 'Entrepreneurship and Business', 3, 'Strategic Organizer', 3),
      ('11B', 'Marketing and Management', 2, 'Strategic Organizer', 0),
      ('11B', 'Sports and Fitness', 1, 'Strategic Organizer', 0),
      ('11C', 'Art and Graphic Design', 3, 'Creative Thinker', 3),
      ('11C', 'Music and Entertainment', 2, 'Creative Thinker', 0),
      ('11C', 'Photography and Video Editing', 2, 'Creative Thinker', 0),
      ('11D', 'Research and Science', 3, 'Analytical Researcher', 3),
      ('11D', 'Reading and Education', 3, 'Analytical Researcher', 0),
      ('11D', 'Psychology and Human Behavior', 2, 'Analytical Researcher', 0),
      -- Q12
      ('12A', 'Technology and Programming', 3, 'Technical Builder', 3),
      ('12A', 'Artificial Intelligence and Machine Learning', 3, 'Technical Builder', 0),
      ('12B', 'Social Activities and Community Building', 3, 'Strategic Organizer', 3),
      ('12B', 'Entrepreneurship and Business', 3, 'Strategic Organizer', 0),
      ('12B', 'Marketing and Management', 2, 'Strategic Organizer', 0),
      ('12C', 'Music and Entertainment', 3, 'Creative Thinker', 3),
      ('12C', 'Art and Graphic Design', 3, 'Creative Thinker', 0),
      ('12C', 'Photography and Video Editing', 2, 'Creative Thinker', 0),
      ('12D', 'Research and Science', 3, 'Analytical Researcher', 3),
      ('12D', 'Reading and Education', 3, 'Analytical Researcher', 0),
      ('12D', 'Communication and Public Speaking', 2, 'Analytical Researcher', 0)
  ),
  -- Exact category order matching INTEREST_CATEGORIES_15 in quizEngine.js
  all_categories(category, cat_order) AS (
    VALUES
      ('Technology and Programming', 1),
      ('Artificial Intelligence and Machine Learning', 2),
      ('Data Science and Analytics', 3),
      ('Gaming and Esports', 4),
      ('Sports and Fitness', 5),
      ('Music and Entertainment', 6),
      ('Art and Graphic Design', 7),
      ('Photography and Video Editing', 8),
      ('Entrepreneurship and Business', 9),
      ('Marketing and Management', 10),
      ('Research and Science', 11),
      ('Reading and Education', 12),
      ('Psychology and Human Behavior', 13),
      ('Communication and Public Speaking', 14),
      ('Social Activities and Community Building', 15)
  ),
  accumulated AS (
    SELECT 
      c.category,
      c.cat_order,
      COALESCE(SUM(m.weight), 0)::int as total_points
    FROM all_categories c
    LEFT JOIN (
      user_answers u 
      JOIN weight_matrix m ON m.opt_id = u.opt_id
    ) ON c.category = m.category
    GROUP BY c.category, c.cat_order
  ),
  -- Deterministic tie-breaking: total_points DESC, then cat_order ASC (preserving frontend array order)
  ranked AS (
    SELECT 
      category,
      total_points,
      cat_order,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, cat_order ASC) as rank_num
    FROM accumulated
  ),
  -- Exact working-style role initialization order matching quizEngine.js
  role_definitions(role, role_order) AS (
    VALUES
      ('Technical Builder', 1),
      ('Creative Thinker', 2),
      ('Strategic Organizer', 3),
      ('Analytical Researcher', 4)
  ),
  role_accumulated AS (
    SELECT 
      rd.role,
      rd.role_order,
      COALESCE(SUM(m.role_weight), 0)::int as total_role_points
    FROM role_definitions rd
    LEFT JOIN (
      user_answers u 
      JOIN weight_matrix m ON m.opt_id = u.opt_id
    ) ON rd.role = m.role AND m.role_weight > 0
    GROUP BY rd.role, rd.role_order
    ORDER BY total_role_points DESC, rd.role_order ASC
    LIMIT 1
  ),
  hobby_map(category, hobby_rank, hobby) AS (
    VALUES
      ('Technology and Programming', 1, 'Software Tinkering'),
      ('Technology and Programming', 2, 'Open Source Contributing'),
      ('Technology and Programming', 3, 'Robotics & Hardware'),
      ('Artificial Intelligence and Machine Learning', 1, 'Prompt Engineering & Model Testing'),
      ('Artificial Intelligence and Machine Learning', 2, 'AI App Prototyping'),
      ('Artificial Intelligence and Machine Learning', 3, 'Kaggle Competitions'),
      ('Data Science and Analytics', 1, 'Data Visualization'),
      ('Data Science and Analytics', 2, 'Algorithmic Puzzles'),
      ('Data Science and Analytics', 3, 'Statistical Modeling'),
      ('Gaming and Esports', 1, 'PC & Console Gaming'),
      ('Gaming and Esports', 2, 'Esports Strategy'),
      ('Gaming and Esports', 3, 'Interactive Storytelling'),
      ('Sports and Fitness', 1, 'Outdoor Adventures'),
      ('Sports and Fitness', 2, 'Gym & Athletic Training'),
      ('Sports and Fitness', 3, 'Intramural Team Sports'),
      ('Music and Entertainment', 1, 'Music Listening & Curating'),
      ('Music and Entertainment', 2, 'Instrument Playing'),
      ('Music and Entertainment', 3, 'Concerts & Live Gigs'),
      ('Art and Graphic Design', 1, 'Digital Illustration'),
      ('Art and Graphic Design', 2, 'UI & Wireframing'),
      ('Art and Graphic Design', 3, 'Visual Journaling'),
      ('Photography and Video Editing', 1, 'Street Photography'),
      ('Photography and Video Editing', 2, 'Short Film Production'),
      ('Photography and Video Editing', 3, 'Content Creation'),
      ('Entrepreneurship and Business', 1, 'Side Hustles'),
      ('Entrepreneurship and Business', 2, 'Startup Pitching'),
      ('Entrepreneurship and Business', 3, 'Case Study Breakdowns'),
      ('Marketing and Management', 1, 'Event Organizing'),
      ('Marketing and Management', 2, 'Brand Strategy'),
      ('Marketing and Management', 3, 'Product Operations'),
      ('Research and Science', 1, 'Independent Lab Inquiries'),
      ('Research and Science', 2, 'Academic Paper Deep-Dives'),
      ('Research and Science', 3, 'Science Communication'),
      ('Reading and Education', 1, 'Non-fiction & Sci-fi Reading'),
      ('Reading and Education', 2, 'Philosophy & Essay Writing'),
      ('Reading and Education', 3, 'Attending Workshops'),
      ('Psychology and Human Behavior', 1, 'Behavioral Observation'),
      ('Psychology and Human Behavior', 2, 'Journaling & Reflection'),
      ('Psychology and Human Behavior', 3, 'Active Listening & Mentoring'),
      ('Communication and Public Speaking', 1, 'Debate & Model UN'),
      ('Communication and Public Speaking', 2, 'Podcast Hosting'),
      ('Communication and Public Speaking', 3, 'Campus Storytelling'),
      ('Social Activities and Community Building', 1, 'Club Leadership'),
      ('Social Activities and Community Building', 2, 'Volunteering'),
      ('Social Activities and Community Building', 3, 'Hackathon Organizing')
  ),
  -- Traverses top 5 positive categories in rank order, expanding all 3 hobbies per category
  candidate_hobbies_sequenced AS (
    SELECT 
      hm.hobby,
      ROW_NUMBER() OVER (ORDER BY r.rank_num ASC, hm.hobby_rank ASC) as seq
    FROM ranked r
    JOIN hobby_map hm ON hm.category = r.category
    WHERE r.rank_num <= 5 AND r.total_points > 0
  ),
  -- Deduplicates while strictly preserving first-appearance insertion order
  deduped_hobbies AS (
    SELECT 
      hobby,
      MIN(seq) as first_appearance
    FROM candidate_hobbies_sequenced
    GROUP BY hobby
    ORDER BY first_appearance ASC
    LIMIT 3
  ),
  max_score_calc AS (
    SELECT GREATEST(COALESCE(MAX(total_points), 1), 1) as max_pts
    FROM accumulated
  ),
  score_agg AS (
    SELECT jsonb_object_agg(
      a.category, 
      LEAST(100, ROUND((a.total_points::numeric / m.max_pts::numeric) * 100))::int
    ) as scores_json
    FROM accumulated a
    CROSS JOIN max_score_calc m
  )
  SELECT 
    COALESCE((SELECT role FROM role_accumulated), 'Technical Builder'),
    ARRAY(SELECT category FROM ranked WHERE rank_num <= 5 AND total_points > 0 ORDER BY rank_num ASC),
    ARRAY(SELECT category FROM ranked WHERE rank_num BETWEEN 6 AND 8 AND total_points > 0 ORDER BY rank_num ASC),
    ARRAY(SELECT hobby FROM deduped_hobbies ORDER BY first_appearance ASC),
    (SELECT scores_json FROM score_agg),
    (SELECT max_pts FROM max_score_calc)
  INTO v_best_role, v_top, v_sec, v_hobbies, v_scores, v_max_score;

  RETURN QUERY SELECT v_best_role, v_top, v_sec, v_hobbies, v_scores;
END;
$$;

-- Validated RPC Function for Quiz Submission
-- Calculates all scores exclusively on server; ignores client-supplied persona parameters.
CREATE OR REPLACE FUNCTION public.submit_quiz_result(
  p_answers jsonb,
  p_working_style text DEFAULT NULL,
  p_top_interests text[] DEFAULT NULL,
  p_secondary_interests text[] DEFAULT '{}'::text[],
  p_hobbies text[] DEFAULT '{}'::text[],
  p_interest_scores jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
  v_server_style text;
  v_server_top text[];
  v_server_sec text[];
  v_server_hobbies text[];
  v_server_scores jsonb;
BEGIN
  -- Strict authentication verification: only the logged-in user can submit their quiz
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to submit quiz results.';
  END IF;

  IF p_answers IS NULL OR p_answers = '{}'::jsonb THEN
    RAISE EXCEPTION 'Quiz answers payload cannot be empty.';
  END IF;

  -- Exclusively calculate quiz persona on server; unconditionally ignore all client-supplied persona parameters
  SELECT working_style, top_interests, secondary_interests, hobbies, interest_scores
  INTO v_server_style, v_server_top, v_server_sec, v_server_hobbies, v_server_scores
  FROM public.calculate_quiz_scores(p_answers);

  -- Insert into historical quiz_attempts.
  -- The on_quiz_attempt_inserted trigger automatically and atomically updates public.profiles.
  INSERT INTO public.quiz_attempts (
    user_id,
    answers,
    working_style,
    top_interests,
    secondary_interests,
    hobbies,
    interest_scores,
    completed_at
  )
  VALUES (
    v_user_id,
    p_answers,
    v_server_style,
    v_server_top,
    COALESCE(v_server_sec, '{}'::text[]),
    COALESCE(v_server_hobbies, '{}'::text[]),
    v_server_scores,
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_attempt_id;

  RETURN v_attempt_id;
END;
$$;

-- Protect function execution permissions
REVOKE ALL ON FUNCTION public.calculate_quiz_scores(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_quiz_scores(jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.submit_quiz_result(jsonb, text, text[], text[], text[], jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_result(jsonb, text, text[], text[], text[], jsonb) TO authenticated;

-- ----------------------------------------------------------------------------
-- 8. FRIEND REQUESTS (Workflow State Machine & Reciprocal Concurrency Lock)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT no_self_friend_requests CHECK (sender_id != receiver_id)
);

-- Safely remove legacy unique constraint if present from earlier versions
ALTER TABLE public.friend_requests 
  DROP CONSTRAINT IF EXISTS unique_friend_request_pair;

-- Partial unique index: only ONE pending request between sender and receiver at any given time.
-- Allows legitimate re-sending of requests after rejection or withdrawal.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_friend_request 
  ON public.friend_requests (sender_id, receiver_id) 
  WHERE status = 'pending';

-- Trigger: Concurrency-Safe Reciprocal Request Handling with Deterministic Advisory Lock
CREATE OR REPLACE FUNCTION public.handle_friend_request_insertion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  reciprocal_id uuid;
  u1 uuid := LEAST(NEW.sender_id, NEW.receiver_id);
  u2 uuid := GREATEST(NEW.sender_id, NEW.receiver_id);
BEGIN
  -- Acquire transaction-scoped advisory lock for this deterministic student pair.
  -- Automatically releases at transaction COMMIT or ROLLBACK.
  -- Prevents race conditions when two students send requests to each other concurrently.
  PERFORM pg_advisory_xact_lock(hashtext(u1::text), hashtext(u2::text));

  -- Prevent sending friend request if students are already accepted friends
  IF public.are_friends(NEW.sender_id, NEW.receiver_id) THEN
    RAISE EXCEPTION 'Cannot send friend request: students are already friends.';
  END IF;

  -- Prevent duplicate pending requests from this sender to receiver
  IF EXISTS (
    SELECT 1 FROM public.friend_requests
    WHERE sender_id = NEW.sender_id 
      AND receiver_id = NEW.receiver_id 
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'A pending friend request already exists between these students.';
  END IF;

  -- Check if a reverse pending request already exists
  SELECT id INTO reciprocal_id
  FROM public.friend_requests
  WHERE sender_id = NEW.receiver_id 
    AND receiver_id = NEW.sender_id 
    AND status = 'pending';

  IF reciprocal_id IS NOT NULL THEN
    -- Reciprocal invite exists: update the existing request to accepted
    UPDATE public.friend_requests
    SET status = 'accepted', updated_at = timezone('utc'::text, now())
    WHERE id = reciprocal_id;

    -- Set this new request to accepted as well
    NEW.status := 'accepted';
  ELSE
    -- Normal request: force status to pending
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_before_friend_request_insert ON public.friend_requests;
CREATE TRIGGER on_before_friend_request_insert
  BEFORE INSERT ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_friend_request_insertion();

-- Trigger: Enforce Role-Specific Updates & Protect Parties
CREATE OR REPLACE FUNCTION public.validate_friend_request_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent altering participant identities
  IF NEW.sender_id <> OLD.sender_id OR NEW.receiver_id <> OLD.receiver_id THEN
    RAISE EXCEPTION 'Cannot alter participants of a friend request.';
  END IF;

  -- Only pending requests may undergo status transitions
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'Cannot transition a closed friend request (current status: %).', OLD.status;
  END IF;

  -- Recipient permissions: Only receiver can accept or reject
  IF NEW.status IN ('accepted', 'rejected') THEN
    IF auth.uid() IS DISTINCT FROM OLD.receiver_id AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Only the recipient of a friend request can accept or reject it.';
    END IF;
  END IF;

  -- Sender permissions: Only sender can withdraw
  IF NEW.status = 'withdrawn' THEN
    IF auth.uid() IS DISTINCT FROM OLD.sender_id AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Only the sender can withdraw a pending friend request.';
    END IF;
  END IF;

  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_before_friend_request_update ON public.friend_requests;
CREATE TRIGGER on_before_friend_request_update
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_friend_request_update();

-- ----------------------------------------------------------------------------
-- 9. FRIENDSHIPS (Canonical Peer Graph)
-- Direct client inserts revoked to prevent bypassing the request workflow.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_id_2 uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Canonical ordering check: user_id_1 must be strictly less than user_id_2
  CONSTRAINT canonical_user_order CHECK (user_id_1 < user_id_2),
  CONSTRAINT unique_canonical_friendship UNIQUE (user_id_1, user_id_2)
);

-- Trigger: Automatically generate canonical friendship when request becomes accepted
CREATE OR REPLACE FUNCTION public.handle_friend_request_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    INSERT INTO public.friendships (user_id_1, user_id_2)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT (user_id_1, user_id_2) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_friend_request_accepted ON public.friend_requests;
CREATE TRIGGER on_friend_request_accepted
  AFTER UPDATE OF status ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_friend_request_accepted();

-- Secure Helper Function: Verify Friendship Without Enumeration
CREATE OR REPLACE FUNCTION public.are_friends(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF user_a IS NULL OR user_b IS NULL THEN
    RETURN false;
  END IF;
  
  -- Anti-enumeration: authenticated callers can only verify friendships involving themselves
  IF auth.uid() IS NOT NULL AND auth.uid() NOT IN (user_a, user_b) AND auth.role() <> 'service_role' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.friendships
    WHERE user_id_1 = LEAST(user_a, user_b)
      AND user_id_2 = GREATEST(user_a, user_b)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;

-- Revoke direct modification on friendships from clients (trigger-only creation)
REVOKE INSERT, UPDATE, DELETE ON public.friendships FROM authenticated, anon, public;
GRANT SELECT ON public.friendships TO authenticated;

-- ----------------------------------------------------------------------------
-- 10. CONVERSATIONS & PRIVATE MESSAGING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_two uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_text text DEFAULT '',
  last_message_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT canonical_conversation_order CHECK (participant_one < participant_two),
  CONSTRAINT unique_conversation_participants UNIQUE (participant_one, participant_two)
);

-- Trigger: Protect conversation participants and prevent direct summary updates by clients
CREATE OR REPLACE FUNCTION public.protect_conversation_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent altering participant identities
  IF NEW.participant_one <> OLD.participant_one OR NEW.participant_two <> OLD.participant_two THEN
    RAISE EXCEPTION 'Cannot alter conversation participants.';
  END IF;

  -- Disallow direct client alteration of last message summaries
  IF pg_trigger_depth() = 1 
     AND auth.role() IN ('authenticated', 'anon') 
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF NEW.last_message_text IS DISTINCT FROM OLD.last_message_text OR
       NEW.last_message_at IS DISTINCT FROM OLD.last_message_at THEN
      RAISE EXCEPTION 'Conversation summary fields can only be updated automatically when messages are posted.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_before_conversation_update ON public.conversations;
CREATE TRIGGER on_before_conversation_update
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.protect_conversation_fields();

-- Revoke direct UPDATE on conversations from authenticated users to protect summaries
REVOKE UPDATE, DELETE ON public.conversations FROM authenticated, anon, public;
GRANT SELECT, INSERT ON public.conversations TO authenticated;

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT valid_sender_recipient CHECK (sender_id != recipient_id),
  CONSTRAINT message_not_empty CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 5000)
);

REVOKE UPDATE, DELETE ON public.messages FROM authenticated, anon, public;
GRANT SELECT, INSERT ON public.messages TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_text = LEFT(NEW.content, 100),
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- ----------------------------------------------------------------------------
-- 11. WEBRTC CALL SESSIONS & SIGNALING
-- Exchanges SDP offers/answers and ICE coordinates. Zero audio/video media stored.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('ringing', 'connected', 'ended', 'missed', 'declined')) DEFAULT 'ringing',
  duration_seconds integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  connected_at timestamptz DEFAULT NULL,
  ended_at timestamptz DEFAULT NULL,
  
  CONSTRAINT no_self_call_sessions CHECK (caller_id != receiver_id)
);

-- Ensure connected_at column exists if table pre-existed
ALTER TABLE public.call_sessions 
  ADD COLUMN IF NOT EXISTS connected_at timestamptz DEFAULT NULL;

-- Trigger: Validate call session parameters and conversation participant alignment
CREATE OR REPLACE FUNCTION public.validate_call_session_insertion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Force initial status and initial duration
  NEW.status := 'ringing';
  NEW.duration_seconds := 0;
  NEW.created_at := timezone('utc'::text, now());
  NEW.connected_at := NULL;
  NEW.ended_at := NULL;

  -- Verify conversation_id belongs to the two participants if provided
  IF NEW.conversation_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = NEW.conversation_id
        AND c.participant_one = LEAST(NEW.caller_id, NEW.receiver_id)
        AND c.participant_two = GREATEST(NEW.caller_id, NEW.receiver_id)
    ) THEN
      RAISE EXCEPTION 'Call conversation does not match the participating caller and receiver.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_before_call_session_insert ON public.call_sessions;
CREATE TRIGGER on_before_call_session_insert
  BEFORE INSERT ON public.call_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_call_session_insertion();

-- Trigger: Enforce call-session status transitions and duration calculation
CREATE OR REPLACE FUNCTION public.validate_call_session_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- 1. When status is unchanged, block any modification to protected call session fields
  IF NEW.status = OLD.status THEN
    IF NEW.caller_id <> OLD.caller_id OR 
       NEW.receiver_id <> OLD.receiver_id OR 
       NEW.conversation_id IS DISTINCT FROM OLD.conversation_id OR 
       NEW.created_at <> OLD.created_at OR
       NEW.connected_at IS DISTINCT FROM OLD.connected_at OR
       NEW.ended_at IS DISTINCT FROM OLD.ended_at OR
       NEW.duration_seconds <> OLD.duration_seconds THEN
      RAISE EXCEPTION 'Cannot modify protected call session fields while status is unchanged.';
    END IF;
    RETURN NEW;
  END IF;

  -- 2. Protect immutable parameters during state transitions
  IF NEW.caller_id <> OLD.caller_id OR 
     NEW.receiver_id <> OLD.receiver_id OR 
     NEW.conversation_id IS DISTINCT FROM OLD.conversation_id OR 
     NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Cannot alter call session immutable parameters.';
  END IF;

  -- 3. Terminal state check
  IF OLD.status IN ('ended', 'missed', 'declined') THEN
    RAISE EXCEPTION 'Cannot modify a terminated call session.';
  END IF;

  -- 4. Permitted status transitions from ringing
  IF OLD.status = 'ringing' THEN
    IF NEW.status = 'connected' THEN
      IF auth.uid() IS DISTINCT FROM OLD.receiver_id AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Only the call receiver can accept and connect the call.';
      END IF;
      -- Set connected_at strictly on receiver acceptance
      NEW.connected_at := timezone('utc'::text, now());
      NEW.duration_seconds := 0;
    ELSIF NEW.status = 'declined' THEN
      IF auth.uid() IS DISTINCT FROM OLD.receiver_id AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Only the call receiver can decline the call.';
      END IF;
      NEW.ended_at := timezone('utc'::text, now());
      NEW.duration_seconds := 0;
      NEW.connected_at := NULL;
    ELSIF NEW.status = 'missed' THEN
      IF auth.uid() IS DISTINCT FROM OLD.caller_id AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Only the caller can cancel a ringing call.';
      END IF;
      NEW.ended_at := timezone('utc'::text, now());
      NEW.duration_seconds := 0;
      NEW.connected_at := NULL;
    ELSE
      RAISE EXCEPTION 'Invalid status transition from ringing to %.', NEW.status;
    END IF;
  
  -- 5. Permitted status transitions from connected
  ELSIF OLD.status = 'connected' THEN
    IF NEW.status = 'ended' THEN
      IF auth.uid() NOT IN (OLD.caller_id, OLD.receiver_id) AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Only participating callers can end an established call.';
      END IF;
      NEW.ended_at := timezone('utc'::text, now());
      
      -- Calculate duration strictly from connected_at to ended_at (ringing time excluded)
      NEW.duration_seconds := GREATEST(0, EXTRACT(EPOCH FROM (NEW.ended_at - COALESCE(OLD.connected_at, NEW.ended_at)))::integer);
      -- Ensure connected_at remains immutable
      NEW.connected_at := OLD.connected_at;
    ELSE
      RAISE EXCEPTION 'Invalid status transition from connected to %.', NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_before_call_session_update ON public.call_sessions;
CREATE TRIGGER on_before_call_session_update
  BEFORE UPDATE ON public.call_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_call_session_transition();

REVOKE DELETE ON public.call_sessions FROM authenticated, anon, public;
GRANT SELECT, INSERT, UPDATE ON public.call_sessions TO authenticated;

-- WebRTC Signaling Channel Table
CREATE TABLE IF NOT EXISTS public.call_signals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  call_session_id uuid REFERENCES public.call_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data jsonb NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT no_self_signals CHECK (sender_id != receiver_id),
  CONSTRAINT signal_payload_not_empty CHECK (signal_data IS NOT NULL AND signal_data != '{}'::jsonb)
);

REVOKE UPDATE, DELETE ON public.call_signals FROM authenticated, anon, public;
GRANT SELECT, INSERT ON public.call_signals TO authenticated;

-- ----------------------------------------------------------------------------
-- 12. CAMPUS COLLABORATIONS BOARD
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.collaborations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  spots_open integer DEFAULT 2 NOT NULL,
  deadline text,
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT collaboration_title_length CHECK (char_length(trim(title)) >= 3)
);

-- Ensure updated_at exists on collaborations
ALTER TABLE public.collaborations 
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now());

REVOKE ALL ON public.collaborations FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collaborations TO authenticated;

-- ----------------------------------------------------------------------------
-- 13. HIGH-PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_university ON public.profiles(university);
CREATE INDEX IF NOT EXISTS idx_profiles_working_style ON public.profiles(working_style);
CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin ON public.profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_top_interests_gin ON public.profiles USING GIN(top_interests);
CREATE INDEX IF NOT EXISTS idx_profiles_hobbies_gin ON public.profiles USING GIN(hobbies);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);

CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON public.friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON public.friendships(user_id_2);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_one, participant_two);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_call_sessions_participants ON public.call_sessions(caller_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_session ON public.call_signals(call_session_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_participants ON public.call_signals(sender_id, receiver_id);

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES & LEGACY POLICY AUDIT
-- ----------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- AUDIT & CLEANSING: Safely drop all existing/legacy policies across all 9 tables.
-- Prevents permissive legacy policies (e.g. USING (true)) from weakening security boundaries.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'quiz_attempts', 'friend_requests', 'friendships',
        'conversations', 'messages', 'call_sessions', 'call_signals', 'collaborations'
      )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES & PERMISSIONS
-- Strict Isolation: Direct SELECT is restricted to the authenticated owner.
-- Public discovery is routed through public.public_profiles view.
-- ----------------------------------------------------------------------------
REVOKE ALL ON public.profiles FROM anon, public;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE POLICY "Direct profile select restricted to owner"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own initial profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND quiz_completed = false
    AND (quiz_answers = '{}'::jsonb OR quiz_answers IS NULL)
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- QUIZ ATTEMPTS POLICIES
-- Direct client INSERT is revoked; RLS allows viewing own attempts.
-- ----------------------------------------------------------------------------
CREATE POLICY "Students can only view own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- FRIEND REQUESTS POLICIES & PERMISSIONS
-- ----------------------------------------------------------------------------
REVOKE ALL ON public.friend_requests FROM anon, public;
GRANT SELECT, INSERT, UPDATE ON public.friend_requests TO authenticated;
GRANT ALL ON public.friend_requests TO service_role;

CREATE POLICY "Users can view friend requests they sent or received"
  ON public.friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Client initiates with pending; trigger converts reciprocal to accepted without violation
CREATE POLICY "Users can only send friend requests as themselves"
  ON public.friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id 
    AND sender_id != receiver_id 
    AND status IN ('pending', 'accepted')
  );

CREATE POLICY "Involved users can update friend request status"
  ON public.friend_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id)
  WITH CHECK (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- ----------------------------------------------------------------------------
-- FRIENDSHIPS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view friendships they belong to"
  ON public.friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- ----------------------------------------------------------------------------
-- CONVERSATIONS POLICIES (Strictly Restricted to Accepted Friends)
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can create conversations only with accepted friends"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = participant_one OR auth.uid() = participant_two)
    AND public.are_friends(participant_one, participant_two)
  );

-- ----------------------------------------------------------------------------
-- MESSAGES POLICIES (Sender Identity & Friendship Verification)
-- ----------------------------------------------------------------------------
CREATE POLICY "Only conversation participants can read messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
  );

CREATE POLICY "Only authenticated senders can post messages to accepted friends"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.are_friends(sender_id, recipient_id)
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          (c.participant_one = sender_id AND c.participant_two = recipient_id) OR
          (c.participant_one = recipient_id AND c.participant_two = sender_id)
        )
    )
  );

-- ----------------------------------------------------------------------------
-- CALL SESSIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view call sessions they belong to"
  ON public.call_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Callers can start call sessions with accepted friends"
  ON public.call_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = caller_id 
    AND public.are_friends(caller_id, receiver_id)
  );

CREATE POLICY "Participants can update call sessions"
  ON public.call_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- ----------------------------------------------------------------------------
-- WEBRTC CALL SIGNALS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Participants can view their call signals"
  ON public.call_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Call participants can post signals to active sessions"
  ON public.call_signals FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.call_sessions s
      WHERE s.id = call_session_id
        AND s.status IN ('ringing', 'connected')
        AND (
          (s.caller_id = sender_id AND s.receiver_id = receiver_id) OR
          (s.caller_id = receiver_id AND s.receiver_id = sender_id)
        )
    )
  );

-- ----------------------------------------------------------------------------
-- COLLABORATIONS BOARD POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view collaborations"
  ON public.collaborations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can post collaboration requests"
  ON public.collaborations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own collaborations"
  ON public.collaborations FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own collaborations"
  ON public.collaborations FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ----------------------------------------------------------------------------
-- 15. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ----------------------------------------------------------------------------
-- Configure REPLICA IDENTITY FULL for all Realtime-replicated tables so WAL changes
-- carry full row images for RLS evaluation during UPDATE and DELETE events.
ALTER TABLE public.call_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.call_signals REPLICA IDENTITY FULL;
ALTER TABLE public.friend_requests REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'friend_requests'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'call_sessions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.call_sessions;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'call_signals'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;
    END IF;
  END IF;
END $$;

COMMIT;
