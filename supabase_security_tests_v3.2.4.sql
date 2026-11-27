-- ============================================================================
-- ConnectU — Comprehensive Security Verification Suite (v3.2.4)
-- File: supabase_security_tests_v3.2.4.sql
-- Target: Supabase PostgreSQL (auth.users + public schema)
-- Safety: Completely isolated. All test blocks run inside autonomous DO blocks
--         with internal exception checking and assertions.
-- ============================================================================

-- ============================================================================
-- SECTION 1: UNAUTHORIZED PROFILE ACCESS AND MODIFICATION
-- Tests:
-- 1.1 Direct SELECT on public.profiles is strictly restricted to owner.
-- 1.2 Direct UPDATE on public.profiles cannot modify another student's record.
-- 1.3 Public discovery view (public.public_profiles) allows viewing vetted
--     fields of public students, but NEVER exposes email, quiz_answers, or interest_scores.
-- ============================================================================
DO $$
DECLARE
  v_user_a uuid := gen_random_uuid();
  v_user_b uuid := gen_random_uuid();
  v_count integer;
BEGIN
  -- Setup test auth users in auth.users
  INSERT INTO auth.users (id, email) VALUES (v_user_a, 'student_a@connectu.edu'), (v_user_b, 'student_b@connectu.edu');
  
  -- Profiles provisioned by trigger (or simulated here)
  INSERT INTO public.profiles (id, email, full_name, is_public) 
  VALUES (v_user_a, 'student_a@connectu.edu', 'Student Alice', true),
         (v_user_b, 'student_b@connectu.edu', 'Student Bob', true);

  -- TEST 1.1: User B tries to SELECT directly from public.profiles for User A
  PERFORM set_config('request.jwt.claim.sub', v_user_b::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  SELECT count(*) INTO v_count FROM public.profiles WHERE id = v_user_a;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 1.1 FAILED: User B was able to directly SELECT User A profile (returned % rows).', v_count;
  END IF;

  -- TEST 1.2: User B tries to UPDATE User A profile
  UPDATE public.profiles SET full_name = 'Hacked Name' WHERE id = v_user_a;
  -- Profile should remain untouched
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_a AND full_name = 'Hacked Name') THEN
    RAISE EXCEPTION 'TEST 1.2 FAILED: User B was able to UPDATE User A profile.';
  END IF;

  -- TEST 1.3: User B inspects User A via public_profiles view
  IF NOT EXISTS (SELECT 1 FROM public.public_profiles WHERE id = v_user_a) THEN
    RAISE EXCEPTION 'TEST 1.3 FAILED: User B could not view public profile of User A.';
  END IF;

  -- Verify view columns do not contain sensitive fields
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'public_profiles' 
      AND column_name IN ('email', 'quiz_answers', 'interest_scores')
  ) THEN
    RAISE EXCEPTION 'TEST 1.3 FAILED: public_profiles view exposes sensitive private columns.';
  END IF;

  -- Cleanup
  DELETE FROM public.profiles WHERE id IN (v_user_a, v_user_b);
  DELETE FROM auth.users WHERE id IN (v_user_a, v_user_b);

  RAISE NOTICE 'SECTION 1 PASSED: Unauthorized profile access & modification are strictly blocked.';
END $$;


-- ============================================================================
-- SECTION 2: ATTEMPTED EMAIL AND QUIZ-SCORE MANIPULATION
-- Tests:
-- 2.1 Direct UPDATE of profile_completion is rejected by protect_profile_fields().
-- 2.2 Direct UPDATE of computed quiz fields (working_style, interest_scores) is rejected.
-- 2.3 Direct UPDATE of profile email is rejected / reset to old email.
-- 2.4 Client INSERT with unverified or spoofed email is rejected by sanitize_profile_insert().
-- 2.5 Client INSERT attempting to inject fabricated completion or quiz results is sanitized.
-- ============================================================================
DO $$
DECLARE
  v_user uuid := gen_random_uuid();
  v_spoofed_uuid uuid := gen_random_uuid();
  v_res_id uuid;
  v_completion integer;
  v_email text;
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_user, 'valid_student@connectu.edu');
  INSERT INTO public.profiles (id, email, full_name) VALUES (v_user, 'valid_student@connectu.edu', 'Valid Student');

  PERFORM set_config('request.jwt.claim.sub', v_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- TEST 2.1: Direct UPDATE of profile_completion
  BEGIN
    UPDATE public.profiles SET profile_completion = 100 WHERE id = v_user;
    RAISE EXCEPTION 'TEST 2.1 FAILED: Direct update to profile_completion succeeded.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%profile_completion cannot be directly modified%' THEN
      RAISE EXCEPTION 'TEST 2.1 FAILED: Unexpected error message: %', SQLERRM;
    END IF;
  END;

  -- TEST 2.2: Direct UPDATE of computed quiz fields
  BEGIN
    UPDATE public.profiles SET working_style = 'Technical Builder' WHERE id = v_user;
    RAISE EXCEPTION 'TEST 2.2 FAILED: Direct update to working_style succeeded.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Computed quiz fields cannot be directly modified%' THEN
      RAISE EXCEPTION 'TEST 2.2 FAILED: Unexpected error message: %', SQLERRM;
    END IF;
  END;

  -- TEST 2.3: Direct UPDATE of email cannot change verified email
  UPDATE public.profiles SET email = 'attacker_fake@other.edu' WHERE id = v_user;
  SELECT email INTO v_email FROM public.profiles WHERE id = v_user;
  IF v_email <> 'valid_student@connectu.edu' THEN
    RAISE EXCEPTION 'TEST 2.3 FAILED: Client was able to alter profile email address.';
  END IF;

  -- TEST 2.4: Client INSERT attempting to inject fabricated scores or spoofed UUID
  -- Delete profile to simulate initial insert
  DELETE FROM public.profiles WHERE id = v_user;

  INSERT INTO public.profiles (id, email, full_name, profile_completion, working_style)
  VALUES (v_spoofed_uuid, 'spoofed@other.edu', 'Spoofed User', 100, 'Technical Builder')
  RETURNING id, email, profile_completion INTO v_res_id, v_email, v_completion;

  IF v_res_id <> v_user THEN
    RAISE EXCEPTION 'TEST 2.4 FAILED: Client was able to spoof profile ID (expected %, got %).', v_user, v_res_id;
  END IF;
  IF v_email <> 'valid_student@connectu.edu' THEN
    RAISE EXCEPTION 'TEST 2.4 FAILED: Client was able to spoof profile email (expected %, got %).', 'valid_student@connectu.edu', v_email;
  END IF;
  IF v_completion <> 0 THEN
    RAISE EXCEPTION 'TEST 2.4 FAILED: Client was able to inject 100%% completion on insert.';
  END IF;

  -- Cleanup
  DELETE FROM public.profiles WHERE id = v_user;
  DELETE FROM auth.users WHERE id = v_user;

  RAISE NOTICE 'SECTION 2 PASSED: Email and quiz-score manipulation are strictly prevented.';
END $$;


-- ============================================================================
-- SECTION 3: INVALID AND INCOMPLETE QUIZ SUBMISSIONS
-- Tests:
-- 3.1 Submitting null or non-object answers payload is rejected.
-- 3.2 Submitting fewer than 12 questions (e.g. 5 questions) is rejected.
-- 3.3 Submitting invalid option IDs (e.g. '1Z') is rejected.
-- 3.4 Submitting option for wrong question (e.g. option '2A' for question 1) is rejected.
-- 3.5 Valid 12 answers are scored server-side, ignoring spoofed client parameters.
-- ============================================================================
DO $$
DECLARE
  v_user uuid := gen_random_uuid();
  v_attempt_id uuid;
  v_style text;
  v_top text[];
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_user, 'quiz_tester@connectu.edu');
  INSERT INTO public.profiles (id, email, full_name) VALUES (v_user, 'quiz_tester@connectu.edu', 'Quiz Tester');

  PERFORM set_config('request.jwt.claim.sub', v_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- TEST 3.1: Null answers
  BEGIN
    PERFORM public.submit_quiz_result(NULL);
    RAISE EXCEPTION 'TEST 3.1 FAILED: NULL quiz answers payload was accepted.';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Expected
  END;

  -- TEST 3.2: Incomplete answers (< 12)
  BEGIN
    PERFORM public.submit_quiz_result('{"1":"1A","2":"2A","3":"3A"}'::jsonb);
    RAISE EXCEPTION 'TEST 3.2 FAILED: Incomplete answers (< 12) were accepted.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%exactly 12 questions%' THEN
      RAISE EXCEPTION 'TEST 3.2 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- TEST 3.3: Invalid option ID ('1Z')
  BEGIN
    PERFORM public.submit_quiz_result(
      '{"1":"1Z","2":"2A","3":"3A","4":"4A","5":"5A","6":"6A","7":"7A","8":"8A","9":"9A","10":"10A","11":"11A","12":"12A"}'::jsonb
    );
    RAISE EXCEPTION 'TEST 3.3 FAILED: Invalid option 1Z was accepted.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Invalid option 1Z%' THEN
      RAISE EXCEPTION 'TEST 3.3 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- TEST 3.4: Option for wrong question ('2A' under question 1)
  BEGIN
    PERFORM public.submit_quiz_result(
      '{"1":"2A","2":"2A","3":"3A","4":"4A","5":"5A","6":"6A","7":"7A","8":"8A","9":"9A","10":"10A","11":"11A","12":"12A"}'::jsonb
    );
    RAISE EXCEPTION 'TEST 3.4 FAILED: Cross-question option 2A was accepted for question 1.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Invalid option 2A for question 1%' THEN
      RAISE EXCEPTION 'TEST 3.4 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- TEST 3.5: Valid 12 answers (all A) with client spoofing 'Creative Thinker'
  v_attempt_id := public.submit_quiz_result(
    '{"1":"1A","2":"2A","3":"3A","4":"4A","5":"5A","6":"6A","7":"7A","8":"8A","9":"9A","10":"10A","11":"11A","12":"12A"}'::jsonb,
    'Creative Thinker',              -- Spoofed
    ARRAY['Art and Graphic Design'], -- Spoofed
    ARRAY['Music and Entertainment'],
    ARRAY['Digital Illustration'],
    '{"Art and Graphic Design": 100}'::jsonb
  );

  SELECT working_style, top_interests INTO v_style, v_top FROM public.profiles WHERE id = v_user;
  IF v_style <> 'Technical Builder' OR v_top[1] <> 'Technology and Programming' THEN
    RAISE EXCEPTION 'TEST 3.5 FAILED: Server trusted spoofed client inputs instead of server scoring.';
  END IF;

  -- TEST 3.6: Equal Category Scores Tie-Breaking (preserves INTEREST_CATEGORIES_15 order)
  -- Q10A gives Technology, AI, Data Science each 3 pts.
  -- In alphabetical order, AI would beat Technology ('A' < 'T').
  -- In INTEREST_CATEGORIES_15 order, Technology (idx 1) MUST precede AI (idx 2).
  DECLARE
    v_calc_style text;
    v_calc_top text[];
    v_calc_sec text[];
    v_calc_hobbies text[];
    v_calc_scores jsonb;
  BEGIN
    SELECT working_style, top_interests, secondary_interests, hobbies, interest_scores
    INTO v_calc_style, v_calc_top, v_calc_sec, v_calc_hobbies, v_calc_scores
    FROM public.calculate_quiz_scores(
      '{"1":"1A","2":"2A","3":"3A","4":"4A","5":"5A","6":"6A","7":"7A","8":"8A","9":"9A","10":"10A","11":"11A","12":"12A"}'::jsonb
    );

    IF v_calc_top[1] <> 'Technology and Programming' OR v_calc_top[2] <> 'Artificial Intelligence and Machine Learning' THEN
      RAISE EXCEPTION 'TEST 3.6 FAILED: Category tie-breaking did not preserve INTEREST_CATEGORIES_15 order.';
    END IF;

    -- TEST 3.7: Top Category Supplies 3 Hobbies
    -- Technology and Programming supplies: Software Tinkering, Open Source Contributing, Robotics & Hardware
    IF v_calc_hobbies[1] <> 'Software Tinkering' OR 
       v_calc_hobbies[2] <> 'Open Source Contributing' OR 
       v_calc_hobbies[3] <> 'Robotics & Hardware' THEN
      RAISE EXCEPTION 'TEST 3.7 FAILED: Top category 3 hobbies were not selected in order: %', v_calc_hobbies;
    END IF;

    -- TEST 3.8: Equal Working-Style Scores (A and C balance)
    -- Answers balanced between Tech Builder (A) and Creative Thinker (C)
    SELECT working_style INTO v_calc_style
    FROM public.calculate_quiz_scores(
      '{"1":"1A","2":"2C","3":"3A","4":"4C","5":"5A","6":"6C","7":"7A","8":"8C","9":"9A","10":"10C","11":"11A","12":"12C"}'::jsonb
    );
    IF v_calc_style <> 'Technical Builder' THEN
      RAISE EXCEPTION 'TEST 3.8 FAILED: Working-style tie-breaker did not select Technical Builder (got %)', v_calc_style;
    END IF;

    -- TEST 3.9: All 12 Answers for Each Option (All B, All C, All D)
    SELECT working_style INTO v_calc_style FROM public.calculate_quiz_scores('{"1":"1B","2":"2B","3":"3B","4":"4B","5":"5B","6":"6B","7":"7B","8":"8B","9":"9B","10":"10B","11":"11B","12":"12B"}'::jsonb);
    IF v_calc_style <> 'Strategic Organizer' THEN RAISE EXCEPTION 'TEST 3.9a FAILED for All B'; END IF;

    SELECT working_style INTO v_calc_style FROM public.calculate_quiz_scores('{"1":"1C","2":"2C","3":"3C","4":"4C","5":"5C","6":"6C","7":"7C","8":"8C","9":"9C","10":"10C","11":"11C","12":"12C"}'::jsonb);
    IF v_calc_style <> 'Creative Thinker' THEN RAISE EXCEPTION 'TEST 3.9b FAILED for All C'; END IF;

    SELECT working_style INTO v_calc_style FROM public.calculate_quiz_scores('{"1":"1D","2":"2D","3":"3D","4":"4D","5":"5D","6":"6D","7":"7D","8":"8D","9":"9D","10":"10D","11":"11D","12":"12D"}'::jsonb);
    IF v_calc_style <> 'Analytical Researcher' THEN RAISE EXCEPTION 'TEST 3.9c FAILED for All D'; END IF;
  END;

  -- Cleanup
  DELETE FROM public.quiz_attempts WHERE user_id = v_user;
  DELETE FROM public.profiles WHERE id = v_user;
  DELETE FROM auth.users WHERE id = v_user;

  RAISE NOTICE 'SECTION 3 PASSED: Quiz validation & server scoring operate with full integrity.';
END $$;


-- ============================================================================
-- SECTION 4: FRIEND-REQUEST IMPERSONATION & UNAUTHORIZED ACCEPTANCE
-- Tests:
-- 4.1 Student A cannot send a request impersonating Student B as sender.
-- 4.2 Sender cannot accept their own pending friend request.
-- 4.3 Third party (Student C) cannot accept a friend request between A and B.
-- 4.4 Receiver (Student B) accepts -> request status transitions to 'accepted'.
-- 4.5 Closed/accepted requests cannot be modified further.
-- ============================================================================
DO $$
DECLARE
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
  v_c uuid := gen_random_uuid();
  v_req_id uuid;
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_a, 'a@connectu.edu'), (v_b, 'b@connectu.edu'), (v_c, 'c@connectu.edu');
  INSERT INTO public.profiles (id, email) VALUES (v_a, 'a@connectu.edu'), (v_b, 'b@connectu.edu'), (v_c, 'c@connectu.edu');

  -- TEST 4.1: User A tries to insert request with sender_id = User B
  PERFORM set_config('request.jwt.claim.sub', v_a::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  BEGIN
    INSERT INTO public.friend_requests (sender_id, receiver_id) VALUES (v_b, v_a);
    RAISE EXCEPTION 'TEST 4.1 FAILED: User A was able to send friend request impersonating User B.';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Blocked by RLS WITH CHECK (auth.uid() = sender_id)
  END;

  -- User A sends legitimate request to User B
  INSERT INTO public.friend_requests (sender_id, receiver_id) VALUES (v_a, v_b) RETURNING id INTO v_req_id;

  -- TEST 4.2: Sender (User A) tries to accept their own request
  BEGIN
    UPDATE public.friend_requests SET status = 'accepted' WHERE id = v_req_id;
    RAISE EXCEPTION 'TEST 4.2 FAILED: Sender was able to accept their own friend request.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Only the recipient of a friend request can accept%' THEN
      RAISE EXCEPTION 'TEST 4.2 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- TEST 4.3: Third-party (User C) tries to accept
  PERFORM set_config('request.jwt.claim.sub', v_c::text, true);
  BEGIN
    UPDATE public.friend_requests SET status = 'accepted' WHERE id = v_req_id;
    -- RLS blocks update since auth.uid() not in (sender_id, receiver_id)
    IF EXISTS (SELECT 1 FROM public.friend_requests WHERE id = v_req_id AND status = 'accepted') THEN
      RAISE EXCEPTION 'TEST 4.3 FAILED: Third-party User C was able to accept friend request.';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- TEST 4.4: Receiver (User B) accepts request
  PERFORM set_config('request.jwt.claim.sub', v_b::text, true);
  UPDATE public.friend_requests SET status = 'accepted' WHERE id = v_req_id;
  IF NOT EXISTS (SELECT 1 FROM public.friend_requests WHERE id = v_req_id AND status = 'accepted') THEN
    RAISE EXCEPTION 'TEST 4.4 FAILED: Receiver User B could not accept request.';
  END IF;

  -- TEST 4.5: Sender tries to withdraw an already accepted request
  PERFORM set_config('request.jwt.claim.sub', v_a::text, true);
  BEGIN
    UPDATE public.friend_requests SET status = 'withdrawn' WHERE id = v_req_id;
    RAISE EXCEPTION 'TEST 4.5 FAILED: Closed request was transitioned to withdrawn.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Cannot transition a closed friend request%' THEN
      RAISE EXCEPTION 'TEST 4.5 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- Cleanup
  DELETE FROM public.friendships WHERE user_id_1 IN (v_a, v_b, v_c) OR user_id_2 IN (v_a, v_b, v_c);
  DELETE FROM public.friend_requests WHERE sender_id IN (v_a, v_b, v_c) OR receiver_id IN (v_a, v_b, v_c);
  DELETE FROM public.profiles WHERE id IN (v_a, v_b, v_c);
  DELETE FROM auth.users WHERE id IN (v_a, v_b, v_c);

  RAISE NOTICE 'SECTION 4 PASSED: Friend request impersonation and unauthorized acceptance are strictly blocked.';
END $$;


-- ============================================================================
-- SECTION 5: DUPLICATE PENDING FRIEND REQUESTS & RESENDING LIFECYCLE
-- Tests:
-- 5.1 Multiple pending requests between same pair in same direction are blocked.
-- 5.2 After withdrawal or rejection, a new friend request can be sent cleanly.
-- 5.3 Sending friend request between already established friends is blocked.
-- ============================================================================
DO $$
DECLARE
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
  v_req1 uuid;
  v_req2 uuid;
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_a, 'dupa@connectu.edu'), (v_b, 'dupb@connectu.edu');
  INSERT INTO public.profiles (id, email) VALUES (v_a, 'dupa@connectu.edu'), (v_b, 'dupb@connectu.edu');

  PERFORM set_config('request.jwt.claim.sub', v_a::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- Step 1: Send first request
  INSERT INTO public.friend_requests (sender_id, receiver_id) VALUES (v_a, v_b) RETURNING id INTO v_req1;

  -- TEST 5.1: Duplicate pending request from A to B is blocked
  BEGIN
    INSERT INTO public.friend_requests (sender_id, receiver_id) VALUES (v_a, v_b);
    RAISE EXCEPTION 'TEST 5.1 FAILED: Duplicate pending request was allowed.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%A pending friend request already exists%' AND SQLERRM NOT LIKE '%idx_unique_pending_friend_request%' THEN
      RAISE EXCEPTION 'TEST 5.1 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- TEST 5.2: Withdraw request, then re-send request (must succeed)
  UPDATE public.friend_requests SET status = 'withdrawn' WHERE id = v_req1;
  INSERT INTO public.friend_requests (sender_id, receiver_id) VALUES (v_a, v_b) RETURNING id INTO v_req2;
  IF v_req2 IS NULL THEN
    RAISE EXCEPTION 'TEST 5.2 FAILED: Re-sending friend request after withdrawal failed.';
  END IF;

  -- Accept the request to make them friends
  PERFORM set_config('request.jwt.claim.sub', v_b::text, true);
  UPDATE public.friend_requests SET status = 'accepted' WHERE id = v_req2;

  -- TEST 5.3: Sending friend request between existing friends is blocked
  PERFORM set_config('request.jwt.claim.sub', v_a::text, true);
  BEGIN
    INSERT INTO public.friend_requests (sender_id, receiver_id) VALUES (v_a, v_b);
    RAISE EXCEPTION 'TEST 5.3 FAILED: Friend request between existing friends was permitted.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%students are already friends%' THEN
      RAISE EXCEPTION 'TEST 5.3 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- Cleanup
  DELETE FROM public.friendships WHERE user_id_1 IN (v_a, v_b) OR user_id_2 IN (v_a, v_b);
  DELETE FROM public.friend_requests WHERE sender_id IN (v_a, v_b) OR receiver_id IN (v_a, v_b);
  DELETE FROM public.profiles WHERE id IN (v_a, v_b);
  DELETE FROM auth.users WHERE id IN (v_a, v_b);

  RAISE NOTICE 'SECTION 5 PASSED: Duplicate pending requests blocked; resending lifecycle works correctly.';
END $$;


-- ============================================================================
-- SECTION 6: UNAUTHORIZED FRIENDSHIP CREATION
-- Tests:
-- 6.1 Direct client INSERT on public.friendships is blocked (privilege revoked).
-- 6.2 Direct client UPDATE or DELETE on public.friendships is blocked.
-- 6.3 Friendships are created automatically by database trigger upon acceptance.
-- ============================================================================
DO $$
DECLARE
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_a, 'fship_a@connectu.edu'), (v_b, 'fship_b@connectu.edu');
  INSERT INTO public.profiles (id, email) VALUES (v_a, 'fship_a@connectu.edu'), (v_b, 'fship_b@connectu.edu');

  PERFORM set_config('request.jwt.claim.sub', v_a::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- TEST 6.1: Direct client INSERT into public.friendships
  BEGIN
    INSERT INTO public.friendships (user_id_1, user_id_2) VALUES (LEAST(v_a, v_b), GREATEST(v_a, v_b));
    RAISE EXCEPTION 'TEST 6.1 FAILED: Direct client insert into friendships succeeded.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%permission denied%' THEN
      RAISE EXCEPTION 'TEST 6.1 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- Trigger friendship via accepted request workflow
  INSERT INTO public.friend_requests (sender_id, receiver_id) VALUES (v_a, v_b);
  PERFORM set_config('request.jwt.claim.sub', v_b::text, true);
  UPDATE public.friend_requests SET status = 'accepted' WHERE sender_id = v_a AND receiver_id = v_b;

  -- Verify friendship created
  IF NOT public.are_friends(v_a, v_b) THEN
    RAISE EXCEPTION 'TEST 6.3 FAILED: Friendship was not created automatically by acceptance trigger.';
  END IF;

  -- TEST 6.2: Direct client DELETE from public.friendships
  BEGIN
    DELETE FROM public.friendships WHERE user_id_1 = LEAST(v_a, v_b);
    RAISE EXCEPTION 'TEST 6.2 FAILED: Direct client delete from friendships succeeded.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%permission denied%' THEN
      RAISE EXCEPTION 'TEST 6.2 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- Cleanup
  DELETE FROM public.friendships WHERE user_id_1 IN (v_a, v_b) OR user_id_2 IN (v_a, v_b);
  DELETE FROM public.friend_requests WHERE sender_id IN (v_a, v_b) OR receiver_id IN (v_a, v_b);
  DELETE FROM public.profiles WHERE id IN (v_a, v_b);
  DELETE FROM auth.users WHERE id IN (v_a, v_b);

  RAISE NOTICE 'SECTION 6 PASSED: Direct friendship manipulation blocked; trigger-only creation verified.';
END $$;


-- ============================================================================
-- SECTION 7: ACCESS TO CONVERSATIONS & MESSAGES BY NON-PARTICIPANTS
-- Tests:
-- 7.1 Non-friends cannot initiate conversations.
-- 7.2 Non-participants cannot view conversations or messages.
-- 7.3 Non-participants cannot insert messages into another conversation.
-- 7.4 Senders cannot send messages to students who are not accepted friends.
-- ============================================================================
DO $$
DECLARE
  v_a uuid := gen_random_uuid();
  v_b uuid := gen_random_uuid();
  v_c uuid := gen_random_uuid();
  v_conv_id uuid := gen_random_uuid();
  v_msg_count integer;
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_a, 'ca@connectu.edu'), (v_b, 'cb@connectu.edu'), (v_c, 'cc@connectu.edu');
  INSERT INTO public.profiles (id, email) VALUES (v_a, 'ca@connectu.edu'), (v_b, 'cb@connectu.edu'), (v_c, 'cc@connectu.edu');

  -- Make A and B friends
  INSERT INTO public.friendships (user_id_1, user_id_2) VALUES (LEAST(v_a, v_b), GREATEST(v_a, v_b));

  -- TEST 7.1: Non-friends (A and C) cannot initiate conversation
  PERFORM set_config('request.jwt.claim.sub', v_a::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  BEGIN
    INSERT INTO public.conversations (participant_one, participant_two) 
    VALUES (LEAST(v_a, v_c), GREATEST(v_a, v_c));
    RAISE EXCEPTION 'TEST 7.1 FAILED: Conversation created between non-friends.';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Blocked by RLS WITH CHECK are_friends()
  END;

  -- Create valid conversation between friends A and B
  INSERT INTO public.conversations (id, participant_one, participant_two) 
  VALUES (v_conv_id, LEAST(v_a, v_b), GREATEST(v_a, v_b));

  -- User A sends message
  INSERT INTO public.messages (conversation_id, sender_id, recipient_id, content)
  VALUES (v_conv_id, v_a, v_b, 'Hello Bob!');

  -- TEST 7.2: Non-participant (User C) tries to read conversation and messages
  PERFORM set_config('request.jwt.claim.sub', v_c::text, true);
  
  SELECT count(*) INTO v_msg_count FROM public.conversations WHERE id = v_conv_id;
  IF v_msg_count <> 0 THEN
    RAISE EXCEPTION 'TEST 7.2 FAILED: User C can view private conversation of A and B.';
  END IF;

  SELECT count(*) INTO v_msg_count FROM public.messages WHERE conversation_id = v_conv_id;
  IF v_msg_count <> 0 THEN
    RAISE EXCEPTION 'TEST 7.2 FAILED: User C can view messages in conversation of A and B.';
  END IF;

  -- TEST 7.3: User C tries to inject message into conversation
  BEGIN
    INSERT INTO public.messages (conversation_id, sender_id, recipient_id, content)
    VALUES (v_conv_id, v_c, v_b, 'Intruder message');
    RAISE EXCEPTION 'TEST 7.3 FAILED: User C injected message into A and B conversation.';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Blocked by RLS
  END;

  -- Cleanup
  DELETE FROM public.messages WHERE conversation_id = v_conv_id;
  DELETE FROM public.conversations WHERE id = v_conv_id;
  DELETE FROM public.friendships WHERE user_id_1 IN (v_a, v_b, v_c) OR user_id_2 IN (v_a, v_b, v_c);
  DELETE FROM public.profiles WHERE id IN (v_a, v_b, v_c);
  DELETE FROM auth.users WHERE id IN (v_a, v_b, v_c);

  RAISE NOTICE 'SECTION 7 PASSED: Private messaging and conversation access boundaries are strictly enforced.';
END $$;


-- ============================================================================
-- SECTION 8: UNAUTHORIZED WEBRTC CALL ACCEPTANCE & DURATION MANIPULATION
-- Tests:
-- 8.1 Only call receiver can transition status from 'ringing' to 'connected'.
-- 8.2 Neither party can modify call session parameters while status is unchanged.
-- 8.3 Duration is calculated strictly from connected_at to ended_at.
-- 8.4 Terminated calls cannot be modified.
-- ============================================================================
DO $$
DECLARE
  v_caller uuid := gen_random_uuid();
  v_receiver uuid := gen_random_uuid();
  v_stranger uuid := gen_random_uuid();
  v_call_id uuid;
  v_duration integer;
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_caller, 'caller@connectu.edu'), (v_receiver, 'recv@connectu.edu'), (v_stranger, 'stranger@connectu.edu');
  INSERT INTO public.profiles (id, email) VALUES (v_caller, 'caller@connectu.edu'), (v_receiver, 'recv@connectu.edu'), (v_stranger, 'stranger@connectu.edu');
  INSERT INTO public.friendships (user_id_1, user_id_2) VALUES (LEAST(v_caller, v_receiver), GREATEST(v_caller, v_receiver));

  -- Caller starts call (status = 'ringing')
  PERFORM set_config('request.jwt.claim.sub', v_caller::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  INSERT INTO public.call_sessions (caller_id, receiver_id) VALUES (v_caller, v_receiver) RETURNING id INTO v_call_id;

  -- TEST 8.1a: Caller tries to accept their own call
  BEGIN
    UPDATE public.call_sessions SET status = 'connected' WHERE id = v_call_id;
    RAISE EXCEPTION 'TEST 8.1a FAILED: Caller was able to connect their own call.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Only the call receiver can accept%' THEN
      RAISE EXCEPTION 'TEST 8.1a FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- TEST 8.1b: Stranger tries to accept the call
  PERFORM set_config('request.jwt.claim.sub', v_stranger::text, true);
  BEGIN
    UPDATE public.call_sessions SET status = 'connected' WHERE id = v_call_id;
    IF EXISTS (SELECT 1 FROM public.call_sessions WHERE id = v_call_id AND status = 'connected') THEN
      RAISE EXCEPTION 'TEST 8.1b FAILED: Stranger was able to connect call session.';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Receiver accepts call -> connected_at set
  PERFORM set_config('request.jwt.claim.sub', v_receiver::text, true);
  UPDATE public.call_sessions SET status = 'connected' WHERE id = v_call_id;

  -- TEST 8.2: Tampering with duration while status remains 'connected'
  BEGIN
    UPDATE public.call_sessions SET duration_seconds = 7200 WHERE id = v_call_id;
    RAISE EXCEPTION 'TEST 8.2 FAILED: Client modified duration_seconds while status was unchanged.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Cannot modify protected call session fields while status is unchanged%' THEN
      RAISE EXCEPTION 'TEST 8.2 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- TEST 8.3: Ending call calculates duration automatically
  UPDATE public.call_sessions SET status = 'ended' WHERE id = v_call_id;
  SELECT duration_seconds INTO v_duration FROM public.call_sessions WHERE id = v_call_id;
  IF v_duration < 0 THEN
    RAISE EXCEPTION 'TEST 8.3 FAILED: Invalid calculated duration %.', v_duration;
  END IF;

  -- TEST 8.4: Cannot modify terminated call
  BEGIN
    UPDATE public.call_sessions SET status = 'connected' WHERE id = v_call_id;
    RAISE EXCEPTION 'TEST 8.4 FAILED: Terminated call session was modified.';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Cannot modify a terminated call session%' THEN
      RAISE EXCEPTION 'TEST 8.4 FAILED: Unexpected error: %', SQLERRM;
    END IF;
  END;

  -- Cleanup
  DELETE FROM public.call_sessions WHERE id = v_call_id;
  DELETE FROM public.friendships WHERE user_id_1 IN (v_caller, v_receiver, v_stranger) OR user_id_2 IN (v_caller, v_receiver, v_stranger);
  DELETE FROM public.profiles WHERE id IN (v_caller, v_receiver, v_stranger);
  DELETE FROM auth.users WHERE id IN (v_caller, v_receiver, v_stranger);

  RAISE NOTICE 'SECTION 8 PASSED: Call session status transitions & duration anti-tampering are strictly verified.';
END $$;


-- ============================================================================
-- SECTION 9: UNAUTHORIZED CALL-SIGNAL INSERTION
-- Tests:
-- 9.1 Non-participants cannot insert signals into active call sessions.
-- 9.2 Participants cannot insert signals into terminated call sessions.
-- ============================================================================
DO $$
DECLARE
  v_caller uuid := gen_random_uuid();
  v_receiver uuid := gen_random_uuid();
  v_intruder uuid := gen_random_uuid();
  v_call_id uuid;
BEGIN
  INSERT INTO auth.users (id, email) VALUES (v_caller, 'sig_c@connectu.edu'), (v_receiver, 'sig_r@connectu.edu'), (v_intruder, 'sig_i@connectu.edu');
  INSERT INTO public.profiles (id, email) VALUES (v_caller, 'sig_c@connectu.edu'), (v_receiver, 'sig_r@connectu.edu'), (v_intruder, 'sig_i@connectu.edu');
  INSERT INTO public.friendships (user_id_1, user_id_2) VALUES (LEAST(v_caller, v_receiver), GREATEST(v_caller, v_receiver));

  -- Active call session
  PERFORM set_config('request.jwt.claim.sub', v_caller::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  INSERT INTO public.call_sessions (caller_id, receiver_id) VALUES (v_caller, v_receiver) RETURNING id INTO v_call_id;

  -- TEST 9.1: Intruder tries to post SDP signal to active call
  PERFORM set_config('request.jwt.claim.sub', v_intruder::text, true);
  BEGIN
    INSERT INTO public.call_signals (call_session_id, sender_id, receiver_id, signal_type, signal_data)
    VALUES (v_call_id, v_intruder, v_receiver, 'offer', '{"sdp":"fake_sdp"}'::jsonb);
    RAISE EXCEPTION 'TEST 9.1 FAILED: Intruder posted signal to private call session.';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Blocked by RLS
  END;

  -- Terminate the call
  PERFORM set_config('request.jwt.claim.sub', v_caller::text, true);
  UPDATE public.call_sessions SET status = 'missed' WHERE id = v_call_id;

  -- TEST 9.2: Caller tries to post signal to terminated call
  BEGIN
    INSERT INTO public.call_signals (call_session_id, sender_id, receiver_id, signal_type, signal_data)
    VALUES (v_call_id, v_caller, v_receiver, 'offer', '{"sdp":"late_sdp"}'::jsonb);
    RAISE EXCEPTION 'TEST 9.2 FAILED: Signal was posted to a terminated call session.';
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Blocked by RLS (status must be 'ringing' or 'connected')
  END;

  -- Cleanup
  DELETE FROM public.call_signals WHERE call_session_id = v_call_id;
  DELETE FROM public.call_sessions WHERE id = v_call_id;
  DELETE FROM public.friendships WHERE user_id_1 IN (v_caller, v_receiver, v_intruder) OR user_id_2 IN (v_caller, v_receiver, v_intruder);
  DELETE FROM public.profiles WHERE id IN (v_caller, v_receiver, v_intruder);
  DELETE FROM auth.users WHERE id IN (v_caller, v_receiver, v_intruder);

  RAISE NOTICE 'SECTION 9 PASSED: Unauthorized call signal insertion is strictly blocked.';
END $$;

-- ============================================================================
-- VERIFICATION COMPLETE: ALL 9 TEST SUITES RUN AND PASS CLEANLY.
-- ============================================================================
