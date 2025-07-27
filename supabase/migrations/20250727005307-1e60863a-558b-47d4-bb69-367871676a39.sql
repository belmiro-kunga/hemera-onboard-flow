-- Criar tabela de templates de email
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('welcome', 'password_reset', 'notification', 'reminder')),
  variables JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de logs de email
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'opened')),
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de fila de emails
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  variables JSONB DEFAULT '{}'::JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de senhas temporárias
CREATE TABLE public.temporary_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  password_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_queue_scheduled ON public.email_queue(scheduled_for);
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_temporary_passwords_user ON public.temporary_passwords(user_id);
CREATE INDEX idx_temporary_passwords_expires ON public.temporary_passwords(expires_at);

-- Habilitar RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_passwords ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para email_templates
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Políticas RLS para email_logs
CREATE POLICY "Admins can view all email logs" 
ON public.email_logs 
FOR SELECT 
USING (is_admin_user(auth.uid()));

-- Políticas RLS para email_queue
CREATE POLICY "Admins can manage email queue" 
ON public.email_queue 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Políticas RLS para temporary_passwords
CREATE POLICY "Users can view own temporary passwords" 
ON public.temporary_passwords 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage temporary passwords" 
ON public.temporary_passwords 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON public.email_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar variáveis em templates
CREATE OR REPLACE FUNCTION public.process_email_template(
  template_content TEXT,
  variables JSONB
) RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Função para gerar senha temporária
CREATE OR REPLACE FUNCTION public.generate_temporary_password(
  p_user_id UUID,
  p_expires_hours INTEGER DEFAULT 24
) RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar senha temporária
CREATE OR REPLACE FUNCTION public.validate_temporary_password(
  p_user_id UUID,
  p_password TEXT
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir templates padrão
INSERT INTO public.email_templates (name, subject, content, template_type, variables) VALUES
('Boas-vindas Padrão', 'Bem-vindo(a) ao Sistema - {{company_name}}', 
'<h1>Olá {{name}}!</h1>
<p>Bem-vindo(a) ao sistema da {{company_name}}.</p>
<p><strong>Seus dados de acesso:</strong></p>
<ul>
<li>Email: {{email}}</li>
<li>Senha temporária: {{temporary_password}}</li>
</ul>
<p>Por motivos de segurança, você precisará alterar sua senha no primeiro acesso.</p>
<p>Acesse: <a href="{{login_url}}">{{login_url}}</a></p>
<br>
<p>Atenciosamente,<br>Equipe {{company_name}}</p>', 
'welcome', 
'["name", "email", "company_name", "temporary_password", "login_url"]'::JSONB),

('Recuperação de Senha', 'Recuperação de Senha - {{company_name}}',
'<h1>Olá {{name}}!</h1>
<p>Recebemos uma solicitação para redefinir sua senha.</p>
<p>Sua nova senha temporária é: <strong>{{temporary_password}}</strong></p>
<p>Por motivos de segurança, você precisará alterar esta senha no próximo acesso.</p>
<p>Acesse: <a href="{{login_url}}">{{login_url}}</a></p>
<p>Se você não solicitou esta alteração, entre em contato conosco imediatamente.</p>
<br>
<p>Atenciosamente,<br>Equipe {{company_name}}</p>',
'password_reset',
'["name", "company_name", "temporary_password", "login_url"]'::JSONB);