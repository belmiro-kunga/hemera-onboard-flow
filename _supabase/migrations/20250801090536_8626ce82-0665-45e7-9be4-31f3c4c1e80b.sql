-- Criar usuários de teste com senhas conhecidas
-- Super Admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'superadmin@hcp.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"name": "Super Administrador"}'::jsonb,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now();

-- Admin
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@hcp.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"name": "Administrador"}'::jsonb,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now();

-- Funcionário
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'funcionario@hcp.com',
  crypt('func123', gen_salt('bf')),
  now(),
  '{"name": "João Funcionário"}'::jsonb,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('func123', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now();

-- Criar ou atualizar perfis correspondentes
INSERT INTO public.profiles (
  user_id,
  name,
  role,
  department,
  job_position,
  employee_id,
  start_date,
  is_active
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Super Administrador',
  'super_admin',
  'TI',
  'Super Administrador do Sistema',
  'SA001',
  CURRENT_DATE,
  true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Administrador',
  'admin',
  'Administração',
  'Administrador Geral',
  'AD001',
  CURRENT_DATE,
  true
),
(
  '00000000-0000-0000-0000-000000000003',
  'João Funcionário',
  'funcionario',
  'Recursos Humanos',
  'Analista de RH',
  'RH001',
  CURRENT_DATE,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  job_position = EXCLUDED.job_position,
  employee_id = EXCLUDED.employee_id,
  start_date = EXCLUDED.start_date,
  is_active = EXCLUDED.is_active,
  updated_at = now();