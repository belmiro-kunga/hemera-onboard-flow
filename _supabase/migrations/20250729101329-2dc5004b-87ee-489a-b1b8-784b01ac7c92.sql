-- Adicionar campo de aniversário na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN birth_date DATE;

-- Criar função para buscar aniversariantes próximos
CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays()
RETURNS TABLE(
  user_id uuid,
  name text,
  email text,
  department text,
  job_position text,
  birth_date date,
  photo_url text,
  days_until_birthday integer,
  is_today boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_date_angola date;
BEGIN
  -- Obter data atual no timezone de Angola
  current_date_angola := (now() AT TIME ZONE 'Africa/Luanda')::date;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.name,
    au.email,
    p.department,
    p.job_position,
    p.birth_date,
    p.photo_url,
    CASE 
      WHEN extract(month from p.birth_date) = extract(month from current_date_angola) 
           AND extract(day from p.birth_date) = extract(day from current_date_angola) THEN 0
      WHEN date_part('doy', (current_date_angola + interval '1 year')::date) + 
           date_part('doy', make_date(2024, extract(month from p.birth_date)::int, extract(day from p.birth_date)::int)) - 
           date_part('doy', current_date_angola) <= 365 THEN
           (date_part('doy', make_date(2024, extract(month from p.birth_date)::int, extract(day from p.birth_date)::int)) - 
            date_part('doy', current_date_angola))::int
      ELSE
           (date_part('doy', make_date(2025, extract(month from p.birth_date)::int, extract(day from p.birth_date)::int)) - 
            date_part('doy', current_date_angola))::int
    END as days_until_birthday,
    (extract(month from p.birth_date) = extract(month from current_date_angola) 
     AND extract(day from p.birth_date) = extract(day from current_date_angola)) as is_today
  FROM public.profiles p
  INNER JOIN auth.users au ON p.user_id = au.id
  WHERE p.is_active = true 
    AND p.birth_date IS NOT NULL
    AND (
      -- Aniversários hoje
      (extract(month from p.birth_date) = extract(month from current_date_angola) 
       AND extract(day from p.birth_date) = extract(day from current_date_angola))
      OR
      -- Próximos 7 dias
      (
        CASE 
          WHEN extract(month from p.birth_date) = extract(month from current_date_angola) 
               AND extract(day from p.birth_date) = extract(day from current_date_angola) THEN 0
          WHEN date_part('doy', make_date(2024, extract(month from p.birth_date)::int, extract(day from p.birth_date)::int)) >= 
               date_part('doy', current_date_angola) THEN
               (date_part('doy', make_date(2024, extract(month from p.birth_date)::int, extract(day from p.birth_date)::int)) - 
                date_part('doy', current_date_angola))::int
          ELSE
               (365 - date_part('doy', current_date_angola) + 
                date_part('doy', make_date(2024, extract(month from p.birth_date)::int, extract(day from p.birth_date)::int)))::int
        END
      ) <= 7
    )
  ORDER BY days_until_birthday ASC, p.name ASC
  LIMIT 10;
END;
$$;

-- Atualizar função create_user_with_profile para incluir birth_date
CREATE OR REPLACE FUNCTION public.create_user_with_profile(
  p_email text, 
  p_password text, 
  p_name text, 
  p_phone text DEFAULT NULL::text, 
  p_role user_role DEFAULT 'funcionario'::user_role, 
  p_department text DEFAULT NULL::text, 
  p_job_position text DEFAULT NULL::text, 
  p_manager_id uuid DEFAULT NULL::uuid, 
  p_employee_id text DEFAULT NULL::text, 
  p_start_date date DEFAULT CURRENT_DATE,
  p_birth_date date DEFAULT NULL::date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    job_position = p_job_position,
    manager_id = p_manager_id,
    employee_id = p_employee_id,
    start_date = p_start_date,
    birth_date = p_birth_date,
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