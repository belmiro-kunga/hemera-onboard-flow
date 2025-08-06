-- Step 3: Create or replace update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to update updated_at column
DO $$
BEGIN
  -- Drop the trigger if it exists
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    DROP TRIGGER update_users_updated_at ON public.users;
  END IF;
  
  -- Create the trigger
  EXECUTE 'CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();';
END $$;

-- Step 5: Drop existing create_user function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user' AND pronamespace = 'public'::regnamespace) THEN
    DROP FUNCTION public.create_user(TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT);
  END IF;
END $$;

-- Step 6: Create create_user function
CREATE FUNCTION public.create_user(
  p_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_role TEXT,
  p_department TEXT DEFAULT NULL,
  p_birthday DATE DEFAULT NULL,
  p_status TEXT DEFAULT 'active'
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_hashed_password TEXT;
BEGIN
  -- Hash the password using pgcrypto
  v_hashed_password := crypt(p_password, gen_salt('bf'));
  
  -- Insert the new user
  INSERT INTO public.users (
    name, 
    email, 
    password_hash, 
    role, 
    department, 
    birthday, 
    status
  ) VALUES (
    p_name, 
    p_email, 
    v_hashed_password, 
    p_role, 
    p_department, 
    p_birthday, 
    p_status
  ) RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error creating user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create or replace authenticate_user function
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_email TEXT,
  p_password TEXT
) RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  department TEXT,
  birthday DATE,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.birthday,
    u.status
  FROM public.users u
  WHERE u.email = p_email 
  AND u.password_hash = crypt(p_password, u.password_hash);
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Authentication error: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
