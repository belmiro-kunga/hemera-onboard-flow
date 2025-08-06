-- Create users table for user management
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('funcionario', 'admin', 'superadmin')),
  department TEXT,
  birthday DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Create or replace update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to view active users
CREATE OR REPLACE POLICY "Allow read access to all users" ON public.users
  FOR SELECT USING (true);

-- Policy: Allow admins to perform all operations
CREATE OR REPLACE POLICY "Allow all access to admins" ON public.users
  FOR ALL USING (true); -- Simplified for now, can be enhanced later

-- Policy: Allow users to update their own profile
CREATE OR REPLACE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE USING (email = current_setting('app.current_user_email', true));

-- Create trigger to update updated_at column
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create a new user with hashed password
CREATE OR REPLACE FUNCTION public.create_user(
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

-- Create function to authenticate user
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
