-- Corrigir funções com search_path mutable
CREATE OR REPLACE FUNCTION public.process_email_template(
  template_content TEXT,
  variables JSONB
) RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result TEXT := template_content;
  key TEXT;
  value TEXT;
BEGIN
  FOR key, value IN SELECT * FROM jsonb_each_text(variables) LOOP
    result := replace(result, '{{' || key || '}}', value);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_temporary_password(
  p_user_id UUID,
  p_expires_hours INTEGER DEFAULT 24
) RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  temp_password TEXT;
  password_hash TEXT;
BEGIN
  -- Gerar senha temporária (8 caracteres alfanuméricos)
  temp_password := substr(md5(random()::text), 1, 8);
  
  -- Hash da senha
  password_hash := crypt(temp_password, gen_salt('bf'));
  
  -- Inserir na tabela de senhas temporárias
  INSERT INTO public.temporary_passwords (
    user_id,
    password_hash,
    expires_at
  ) VALUES (
    p_user_id,
    password_hash,
    now() + (p_expires_hours || ' hours')::INTERVAL
  );
  
  RETURN temp_password;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_temporary_password(
  p_user_id UUID,
  p_password TEXT
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stored_hash TEXT;
  temp_password_record RECORD;
BEGIN
  -- Buscar senha temporária não utilizada e não expirada
  SELECT * INTO temp_password_record
  FROM public.temporary_passwords
  WHERE user_id = p_user_id
    AND is_used = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verificar se a senha está correta
  IF crypt(p_password, temp_password_record.password_hash) = temp_password_record.password_hash THEN
    -- Marcar como utilizada
    UPDATE public.temporary_passwords
    SET is_used = true, used_at = now()
    WHERE id = temp_password_record.id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;