-- Create notification and email system tables

-- Email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'welcome', 'assignment', 'certificate', 'reminder', 'custom'
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}', -- Available variables for the template
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email queue table
CREATE TABLE public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  template_variables JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES public.email_queue(id),
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL,
  provider VARCHAR(50), -- 'smtp', 'sendgrid', 'mailgun', etc.
  provider_message_id VARCHAR(255),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error', 'assignment', 'certificate'
  category VARCHAR(50), -- 'system', 'course', 'assignment', 'certificate', 'gamification'
  data JSONB DEFAULT '{}', -- Additional data for the notification
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMTP configuration table
CREATE TABLE public.smtp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL DEFAULT 'default',
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL DEFAULT 587,
  username VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL, -- Encrypted password
  use_tls BOOLEAN DEFAULT true,
  use_ssl BOOLEAN DEFAULT false,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  assignment_notifications BOOLEAN DEFAULT true,
  certificate_notifications BOOLEAN DEFAULT true,
  reminder_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON public.email_queue(scheduled_for);
CREATE INDEX idx_email_queue_priority ON public.email_queue(priority, scheduled_for);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_email_logs_email ON public.email_logs(to_email);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smtp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (is_admin_user(auth.uid()));

-- RLS Policies for email_queue
CREATE POLICY "Admins can view email queue" ON public.email_queue
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "System can manage email queue" ON public.email_queue
  FOR ALL WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for email_logs
CREATE POLICY "Admins can view email logs" ON public.email_logs
  FOR SELECT USING (is_admin_user(auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for smtp_config
CREATE POLICY "Admins can manage SMTP config" ON public.smtp_config
  FOR ALL USING (is_admin_user(auth.uid()));

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to send email
CREATE OR REPLACE FUNCTION public.queue_email(
  p_to_email VARCHAR(255),
  p_to_name VARCHAR(255) DEFAULT NULL,
  p_subject VARCHAR(500),
  p_html_content TEXT,
  p_text_content TEXT DEFAULT NULL,
  p_template_id UUID DEFAULT NULL,
  p_template_variables JSONB DEFAULT '{}',
  p_priority INTEGER DEFAULT 5,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  queue_id UUID;
  smtp_from_email VARCHAR(255);
  smtp_from_name VARCHAR(255);
BEGIN
  -- Get SMTP configuration
  SELECT from_email, from_name INTO smtp_from_email, smtp_from_name
  FROM public.smtp_config
  WHERE is_active = true
  LIMIT 1;
  
  -- Use default if no SMTP config found
  IF smtp_from_email IS NULL THEN
    smtp_from_email := 'noreply@sistema.com';
    smtp_from_name := 'Sistema HCP';
  END IF;
  
  -- Insert into email queue
  INSERT INTO public.email_queue (
    to_email,
    to_name,
    from_email,
    from_name,
    subject,
    html_content,
    text_content,
    template_id,
    template_variables,
    priority,
    scheduled_for
  ) VALUES (
    p_to_email,
    p_to_name,
    smtp_from_email,
    smtp_from_name,
    p_subject,
    p_html_content,
    p_text_content,
    p_template_id,
    p_template_variables,
    p_priority,
    p_scheduled_for
  )
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info',
  p_category VARCHAR(50) DEFAULT 'system',
  p_data JSONB DEFAULT '{}',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id UUID;
  user_preferences RECORD;
BEGIN
  -- Get user notification preferences
  SELECT * INTO user_preferences
  FROM public.notification_preferences
  WHERE user_id = p_user_id;
  
  -- Create default preferences if not exists
  IF user_preferences IS NULL THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Set default preferences
    user_preferences.email_notifications := true;
    user_preferences.push_notifications := true;
    user_preferences.assignment_notifications := true;
    user_preferences.certificate_notifications := true;
    user_preferences.reminder_notifications := true;
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    data,
    expires_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_category,
    p_data,
    p_expires_at
  )
  RETURNING id INTO notification_id;
  
  -- Send email notification if enabled
  IF user_preferences.email_notifications = true THEN
    -- Get user email
    DECLARE
      user_email VARCHAR(255);
      user_name VARCHAR(255);
    BEGIN
      SELECT email, name INTO user_email, user_name
      FROM public.profiles p
      JOIN auth.users u ON p.user_id = u.id
      WHERE p.user_id = p_user_id;
      
      IF user_email IS NOT NULL THEN
        PERFORM public.queue_email(
          user_email,
          user_name,
          p_title,
          '<h2>' || p_title || '</h2><p>' || p_message || '</p>',
          p_title || '\n\n' || p_message,
          NULL,
          jsonb_build_object('title', p_title, 'message', p_message, 'type', p_type),
          5
        );
      END IF;
    END;
  END IF;
  
  RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = NOW()
  WHERE id = p_notification_id
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
  unread_count INTEGER;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM public.notifications
  WHERE user_id = target_user_id
  AND is_read = false
  AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN unread_count;
END;
$$;

-- Trigger to update updated_at columns
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON public.email_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smtp_config_updated_at
  BEFORE UPDATE ON public.smtp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, template_type, html_content, text_content, variables) VALUES
('Boas-vindas', 'Bem-vindo ao Sistema HCP!', 'welcome', 
'<h1>Bem-vindo, {{user_name}}!</h1>
<p>Estamos felizes em tê-lo conosco no sistema HCP Onboarding.</p>
<p>Seu acesso foi criado com sucesso. Você pode fazer login usando:</p>
<ul>
<li><strong>Email:</strong> {{user_email}}</li>
<li><strong>Senha temporária:</strong> {{temp_password}}</li>
</ul>
<p>Por favor, altere sua senha no primeiro acesso.</p>
<p>Atenciosamente,<br>Equipe HCP</p>',
'Bem-vindo, {{user_name}}!

Estamos felizes em tê-lo conosco no sistema HCP Onboarding.

Seu acesso foi criado com sucesso. Você pode fazer login usando:
- Email: {{user_email}}
- Senha temporária: {{temp_password}}

Por favor, altere sua senha no primeiro acesso.

Atenciosamente,
Equipe HCP',
'{"user_name": "Nome do usuário", "user_email": "Email do usuário", "temp_password": "Senha temporária"}'),

('Curso Atribuído', 'Novo curso atribuído: {{course_name}}', 'assignment',
'<h1>Novo Curso Atribuído</h1>
<p>Olá {{user_name}},</p>
<p>Um novo curso foi atribuído a você:</p>
<h2>{{course_name}}</h2>
<p>{{course_description}}</p>
<p><strong>Prazo:</strong> {{due_date}}</p>
<p><strong>Prioridade:</strong> {{priority}}</p>
<p>Acesse o sistema para começar seus estudos.</p>
<p>Atenciosamente,<br>Equipe HCP</p>',
'Novo Curso Atribuído

Olá {{user_name}},

Um novo curso foi atribuído a você:

{{course_name}}
{{course_description}}

Prazo: {{due_date}}
Prioridade: {{priority}}

Acesse o sistema para começar seus estudos.

Atenciosamente,
Equipe HCP',
'{"user_name": "Nome do usuário", "course_name": "Nome do curso", "course_description": "Descrição do curso", "due_date": "Data limite", "priority": "Prioridade"}'),

('Certificado Gerado', 'Seu certificado está pronto!', 'certificate',
'<h1>Parabéns! Seu certificado está pronto</h1>
<p>Olá {{user_name}},</p>
<p>Parabéns pela conclusão do curso <strong>{{course_name}}</strong>!</p>
<p>Seu certificado foi gerado e está disponível para download no sistema.</p>
<p><strong>Pontuação:</strong> {{score}}%</p>
<p><strong>Data de conclusão:</strong> {{completion_date}}</p>
<p>Continue assim e alcance novos níveis!</p>
<p>Atenciosamente,<br>Equipe HCP</p>',
'Parabéns! Seu certificado está pronto

Olá {{user_name}},

Parabéns pela conclusão do curso {{course_name}}!

Seu certificado foi gerado e está disponível para download no sistema.

Pontuação: {{score}}%
Data de conclusão: {{completion_date}}

Continue assim e alcance novos níveis!

Atenciosamente,
Equipe HCP',
'{"user_name": "Nome do usuário", "course_name": "Nome do curso", "score": "Pontuação", "completion_date": "Data de conclusão"}');

-- Insert default SMTP configuration (placeholder)
INSERT INTO public.smtp_config (name, host, port, username, password_encrypted, from_email, from_name) VALUES
('Default SMTP', 'smtp.gmail.com', 587, 'sistema@empresa.com', 'encrypted_password_here', 'noreply@empresa.com', 'Sistema HCP');

-- Comments
COMMENT ON TABLE public.email_templates IS 'Templates de email para diferentes tipos de notificação';
COMMENT ON TABLE public.email_queue IS 'Fila de emails para processamento assíncrono';
COMMENT ON TABLE public.email_logs IS 'Logs de emails enviados com estatísticas de entrega';
COMMENT ON TABLE public.notifications IS 'Notificações in-app para usuários';
COMMENT ON TABLE public.smtp_config IS 'Configurações SMTP para envio de emails';
COMMENT ON TABLE public.notification_preferences IS 'Preferências de notificação por usuário';