-- Add organizational fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN department TEXT,
ADD COLUMN position TEXT,
ADD COLUMN manager_id UUID REFERENCES public.profiles(user_id),
ADD COLUMN photo_url TEXT,
ADD COLUMN start_date DATE,
ADD COLUMN employee_id TEXT UNIQUE;

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(user_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Departments policies
CREATE POLICY "Admins can manage departments" 
ON public.departments 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view active departments" 
ON public.departments 
FOR SELECT 
USING (is_active = true);

-- Create function to create user with profile
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_role user_role DEFAULT 'funcionario',
  p_department TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL,
  p_manager_id UUID DEFAULT NULL,
  p_employee_id TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create users';
  END IF;

  -- Create auth user (this will trigger the profile creation via trigger)
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('name', p_name)
  ) RETURNING id INTO new_user_id;

  -- Update the profile with additional data
  UPDATE public.profiles 
  SET 
    phone = p_phone,
    role = p_role,
    department = p_department,
    position = p_position,
    manager_id = p_manager_id,
    employee_id = p_employee_id,
    start_date = p_start_date,
    created_by = auth.uid()
  WHERE user_id = new_user_id;

  -- Return success with user data
  result := jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', p_email,
    'name', p_name
  );

  RETURN result;
EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create function to get users with organizational details
CREATE OR REPLACE FUNCTION public.get_users_with_details()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  position TEXT,
  manager_name TEXT,
  employee_id TEXT,
  start_date DATE,
  is_active BOOLEAN,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.name,
    au.email,
    p.phone,
    p.role,
    p.department,
    p.position,
    m.name as manager_name,
    p.employee_id,
    p.start_date,
    p.is_active,
    p.last_login,
    p.created_at
  FROM public.profiles p
  INNER JOIN auth.users au ON p.user_id = au.id
  LEFT JOIN public.profiles m ON p.manager_id = m.user_id
  WHERE is_admin_user(auth.uid())
  ORDER BY p.created_at DESC;
$$;

-- Create trigger for updated_at on departments
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();