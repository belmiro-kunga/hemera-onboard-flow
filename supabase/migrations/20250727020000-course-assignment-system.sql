-- Create course assignment system tables

-- Create function to check if user is admin (if not exists)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid 
    AND (job_position ILIKE '%admin%' OR job_position ILIKE '%gerente%' OR job_position ILIKE '%diretor%')
  );
$$;

-- Tabela para armazenar atribuições de cursos e simulados
CREATE TABLE public.course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('course', 'simulado')),
  content_id UUID NOT NULL, -- References either video_courses.id or simulados.id
  assigned_by UUID NOT NULL REFERENCES public.profiles(user_id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NULL,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Tabela para templates de atribuição por cargo
CREATE TABLE public.assignment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  job_title VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para cursos e simulados incluídos nos templates
CREATE TABLE public.template_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.assignment_templates(id) ON DELETE CASCADE,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('course', 'simulado')),
  content_id UUID NOT NULL, -- References either video_courses.id or simulados.id
  is_mandatory BOOLEAN DEFAULT true,
  default_due_days INTEGER DEFAULT 30,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, content_type, content_id)
);

-- Tabela para histórico de notificações
CREATE TABLE public.assignment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.course_assignments(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('assignment_created', 'due_soon', 'overdue', 'completed', 'reminder')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT false,
  in_app_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização de performance
CREATE INDEX idx_course_assignments_user_id ON public.course_assignments(user_id);
CREATE INDEX idx_course_assignments_content ON public.course_assignments(content_type, content_id);
CREATE INDEX idx_course_assignments_assigned_by ON public.course_assignments(assigned_by);
CREATE INDEX idx_course_assignments_status ON public.course_assignments(status);
CREATE INDEX idx_course_assignments_due_date ON public.course_assignments(due_date);
CREATE INDEX idx_assignment_templates_department ON public.assignment_templates(department);
CREATE INDEX idx_assignment_templates_job_title ON public.assignment_templates(job_title);
CREATE INDEX idx_template_courses_template_id ON public.template_courses(template_id);
CREATE INDEX idx_template_courses_content ON public.template_courses(content_type, content_id);
CREATE INDEX idx_assignment_notifications_assignment_id ON public.assignment_notifications(assignment_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para course_assignments
CREATE POLICY "Users can view own assignments" ON public.course_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assignments" ON public.course_assignments
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can create assignments" ON public.course_assignments
  FOR INSERT WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update assignments" ON public.course_assignments
  FOR UPDATE USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete assignments" ON public.course_assignments
  FOR DELETE USING (is_admin_user(auth.uid()));

-- Políticas RLS para assignment_templates
CREATE POLICY "Admins can manage templates" ON public.assignment_templates
  FOR ALL USING (is_admin_user(auth.uid()));

-- Políticas RLS para template_courses
CREATE POLICY "Admins can manage template courses" ON public.template_courses
  FOR ALL USING (is_admin_user(auth.uid()));

-- Políticas RLS para assignment_notifications
CREATE POLICY "Users can view own notifications" ON public.assignment_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_assignments ca 
      WHERE ca.id = assignment_notifications.assignment_id 
      AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all notifications" ON public.assignment_notifications
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "System can create notifications" ON public.assignment_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own notifications" ON public.assignment_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.course_assignments ca 
      WHERE ca.id = assignment_notifications.assignment_id 
      AND ca.user_id = auth.uid()
    )
  );

-- Função para atualizar status de atribuições baseado no progresso
CREATE OR REPLACE FUNCTION public.update_assignment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar status da atribuição quando o curso for completado
  IF NEW.progress_percentage = 100 AND OLD.progress_percentage < 100 THEN
    UPDATE public.course_assignments 
    SET 
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id
    AND status != 'completed';
    
    -- Criar notificação de conclusão
    INSERT INTO public.assignment_notifications (assignment_id, notification_type)
    SELECT id, 'completed'
    FROM public.course_assignments
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id;
  
  -- Atualizar status para in_progress quando começar o curso
  ELSIF NEW.progress_percentage > 0 AND OLD.progress_percentage = 0 THEN
    UPDATE public.course_assignments 
    SET 
      status = 'in_progress',
      updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id
    AND status = 'assigned';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para marcar atribuições como atrasadas
CREATE OR REPLACE FUNCTION public.mark_overdue_assignments()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Marcar atribuições como atrasadas
  UPDATE public.course_assignments 
  SET 
    status = 'overdue',
    updated_at = NOW()
  WHERE due_date < NOW()
  AND status IN ('assigned', 'in_progress');
  
  -- Criar notificações para atribuições atrasadas
  INSERT INTO public.assignment_notifications (assignment_id, notification_type)
  SELECT id, 'overdue'
  FROM public.course_assignments
  WHERE status = 'overdue'
  AND id NOT IN (
    SELECT assignment_id 
    FROM public.assignment_notifications 
    WHERE notification_type = 'overdue'
  );
END;
$$;

-- Função para aplicar template a um usuário
CREATE OR REPLACE FUNCTION public.apply_template_to_user(
  p_template_id UUID,
  p_user_id UUID,
  p_assigned_by UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  template_course RECORD;
  assignments_created INTEGER := 0;
  due_date_calc TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verificar se o usuário que está aplicando é admin
  IF NOT is_admin_user(p_assigned_by) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can apply templates';
  END IF;
  
  -- Verificar se o template existe e está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.assignment_templates 
    WHERE id = p_template_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Aplicar cada curso do template
  FOR template_course IN 
    SELECT tc.*, vc.title as course_title
    FROM public.template_courses tc
    JOIN public.video_courses vc ON vc.id = tc.course_id
    WHERE tc.template_id = p_template_id
  LOOP
    -- Calcular data de vencimento
    due_date_calc := CASE 
      WHEN template_course.default_due_days > 0 
      THEN NOW() + (template_course.default_due_days || ' days')::INTERVAL
      ELSE NULL
    END;
    
    -- Criar atribuição se não existir
    INSERT INTO public.course_assignments (
      user_id,
      content_type,
      content_id,
      assigned_by,
      due_date,
      priority,
      notes
    ) VALUES (
      p_user_id,
      template_course.content_type,
      template_course.content_id,
      p_assigned_by,
      due_date_calc,
      template_course.priority,
      'Atribuído automaticamente via template'
    )
    ON CONFLICT (user_id, content_type, content_id) DO NOTHING;
    
    -- Contar se foi criada uma nova atribuição
    IF FOUND THEN
      assignments_created := assignments_created + 1;
      
      -- Criar notificação
      INSERT INTO public.assignment_notifications (assignment_id, notification_type)
      SELECT id, 'assignment_created'
      FROM public.course_assignments
      WHERE user_id = p_user_id 
      AND content_type = template_course.content_type
      AND content_id = template_course.content_id;
    END IF;
  END LOOP;
  
  RETURN assignments_created;
END;
$$;

-- Trigger para atualizar status das atribuições baseado no progresso do curso
CREATE TRIGGER update_assignment_status_trigger
  AFTER UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assignment_status();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_course_assignments_updated_at
  BEFORE UPDATE ON public.course_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_templates_updated_at
  BEFORE UPDATE ON public.assignment_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo para templates
INSERT INTO public.assignment_templates (name, department, job_title, description, created_by) VALUES
('Onboarding Básico', NULL, NULL, 'Template básico de onboarding para novos funcionários', (SELECT user_id FROM public.profiles LIMIT 1)),
('Treinamento Vendas', 'Vendas', NULL, 'Cursos obrigatórios para equipe de vendas', (SELECT user_id FROM public.profiles LIMIT 1)),
('Compliance Financeiro', 'Financeiro', NULL, 'Treinamentos de compliance para área financeira', (SELECT user_id FROM public.profiles LIMIT 1));

-- Comentários nas tabelas
COMMENT ON TABLE public.course_assignments IS 'Armazena as atribuições de cursos para usuários específicos';
COMMENT ON TABLE public.assignment_templates IS 'Templates de atribuição de cursos por cargo ou departamento';
COMMENT ON TABLE public.template_courses IS 'Cursos incluídos em cada template de atribuição';
COMMENT ON TABLE public.assignment_notifications IS 'Histórico de notificações relacionadas às atribuições';