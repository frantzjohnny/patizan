-- ============================================================
-- PATIZAN RECORDS — Authorize Administrator Role
-- Run this in your Supabase SQL Editor after creating a user in Supabase Auth.
-- Replace 'your_admin_email@domain.com' with the administrator's email.
-- ============================================================

DO $$
DECLARE
  target_email TEXT := 'your_admin_email@domain.com'; -- Replace with the administrator email
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = LOWER(TRIM(target_email));
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User "%" not found in auth.users. Please create the user in Supabase Auth first.', target_email;
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (target_user_id, LOWER(TRIM(target_email)), 'Studio Administrator')
  ON CONFLICT (id) DO NOTHING;

  -- Grant super_admin role
  INSERT INTO public.admin_users (profile_id, role, is_active)
  VALUES (target_user_id, 'super_admin', TRUE)
  ON CONFLICT (profile_id) DO UPDATE SET role = 'super_admin', is_active = TRUE;

  RAISE NOTICE 'User "%" successfully authorized as super_admin.', target_email;
END $$;
