-- Initial schema migration for Hemera system
-- This consolidates all Supabase migrations into a single local PostgreSQL migration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'single_answer');
CREATE TYPE public.difficulty_level AS ENUM ('facil', 'medio', 'dificil');

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create is_admin_user function
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

-- Create profiles table
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  job_position TEXT,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video courses system tables
CREATE TABLE public.video_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.video_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.video_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'youtube',
  duration_minutes INTEGER DEFAULT 0,
  order_number INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  min_watch_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  course_id UUID NOT NULL REFERENCES public.video_courses(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(user_id),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  lesson_id UUID NOT NULL REFERENCES public.video_lessons(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_position_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id, enrollment_id)
);

CREATE TABLE public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  course_id UUID NOT NULL REFERENCES public.video_courses(id),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id),
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create simulados system tables
CREATE TABLE public.simulados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_questions INTEGER NOT NULL DEFAULT 10,
  difficulty difficulty_level DEFAULT 'medio',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.questoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulado_id UUID REFERENCES public.simulados(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'multiple_choice',
  explanation TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.opcoes_resposta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questao_id UUID REFERENCES public.questoes(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.simulado_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id),
  simulado_id UUID REFERENCES public.simulados(id),
  score DECIMAL(5,2),
  total_questions INTEGER,
  correct_answers INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE TABLE public.user_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.simulado_attempts(id) ON DELETE CASCADE,
  questao_id UUID REFERENCES public.questoes(id),
  opcao_resposta_id UUID REFERENCES public.opcoes_resposta(id),
  answer_text TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course assignment system tables
CREATE TABLE public.course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('course', 'simulado')),
  content_id UUID NOT NULL,
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

CREATE TABLE public.template_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.assignment_templates(id) ON DELETE CASCADE,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('course', 'simulado')),
  content_id UUID NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  default_due_days INTEGER DEFAULT 30,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, content_type, content_id)
);

CREATE TABLE public.assignment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.course_assignments(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('assignment_created', 'due_soon', 'overdue', 'completed', 'reminder')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT false,
  in_app_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification system tables
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  priority INTEGER DEFAULT 5,
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

CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES public.email_queue(id),
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL,
  provider VARCHAR(50),
  provider_message_id VARCHAR(255),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.smtp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL DEFAULT 'default',
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL DEFAULT 587,
  username VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL,
  use_tls BOOLEAN DEFAULT true,
  use_ssl BOOLEAN DEFAULT false,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_video_lessons_course_id ON public.video_lessons(course_id);
CREATE INDEX idx_video_lessons_order ON public.video_lessons(course_id, order_number);
CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX idx_lesson_progress_enrollment ON public.lesson_progress(enrollment_id);
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
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON public.email_queue(scheduled_for);
CREATE INDEX idx_email_queue_priority ON public.email_queue(priority, scheduled_for);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_email_logs_email ON public.email_logs(to_email);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);-- En
able RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_resposta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smtp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (is_admin_user(auth.uid()));

-- RLS Policies for video_courses
CREATE POLICY "Admins can manage all video courses" ON public.video_courses
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view active video courses assigned to them" ON public.video_courses
  FOR SELECT USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_id = video_courses.id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for video_lessons
CREATE POLICY "Admins can manage all video lessons" ON public.video_lessons
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view lessons of enrolled courses" ON public.video_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      JOIN public.video_courses vc ON vc.id = ce.course_id
      WHERE ce.user_id = auth.uid() 
      AND vc.id = video_lessons.course_id
      AND vc.is_active = true
    )
  );

-- RLS Policies for course_enrollments
CREATE POLICY "Admins can manage all enrollments" ON public.course_enrollments
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view own enrollments" ON public.course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment progress" ON public.course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for lesson_progress
CREATE POLICY "Admins can view all lesson progress" ON public.lesson_progress
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for course_certificates
CREATE POLICY "Admins can view all certificates" ON public.course_certificates
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view own certificates" ON public.course_certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create certificates" ON public.course_certificates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for simulados
CREATE POLICY "Admins can manage all simulados" ON public.simulados
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view active simulados" ON public.simulados
  FOR SELECT USING (is_active = true);

-- RLS Policies for questoes
CREATE POLICY "Admins can manage all questoes" ON public.questoes
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view questoes of active simulados" ON public.questoes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.simulados s 
    WHERE s.id = simulado_id AND s.is_active = true
  ));

-- RLS Policies for opcoes_resposta
CREATE POLICY "Admins can manage all opcoes" ON public.opcoes_resposta
  FOR ALL USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view opcoes of active simulados" ON public.opcoes_resposta
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.questoes q 
    JOIN public.simulados s ON s.id = q.simulado_id 
    WHERE q.id = questao_id AND s.is_active = true
  ));

-- RLS Policies for simulado_attempts
CREATE POLICY "Admins can view all attempts" ON public.simulado_attempts
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can manage own attempts" ON public.simulado_attempts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_answers
CREATE POLICY "Admins can view all answers" ON public.user_answers
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can manage own answers" ON public.user_answers
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.simulado_attempts sa 
    WHERE sa.id = attempt_id AND sa.user_id = auth.uid()
  ));

-- RLS Policies for course_assignments
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

-- RLS Policies for assignment_templates
CREATE POLICY "Admins can manage templates" ON public.assignment_templates
  FOR ALL USING (is_admin_user(auth.uid()));

-- RLS Policies for template_courses
CREATE POLICY "Admins can manage template courses" ON public.template_courses
  FOR ALL USING (is_admin_user(auth.uid()));

-- RLS Policies for assignment_notifications
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

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_courses_updated_at
  BEFORE UPDATE ON public.video_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_lessons_updated_at
  BEFORE UPDATE ON public.video_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_simulados_updated_at
  BEFORE UPDATE ON public.simulados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questoes_updated_at
  BEFORE UPDATE ON public.questoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_assignments_updated_at
  BEFORE UPDATE ON public.course_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_templates_updated_at
  BEFORE UPDATE ON public.assignment_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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
  EXECUTE FUNCTION public.update_updated_at_column();-- Create
 system functions

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update enrollment progress when lesson progress changes
  UPDATE public.course_enrollments 
  SET 
    progress_percentage = (
      SELECT COALESCE(
        ROUND(
          (COUNT(*) FILTER (WHERE lp.is_completed = true) * 100.0) / 
          NULLIF(COUNT(*), 0)
        ), 0
      )
      FROM public.lesson_progress lp
      JOIN public.video_lessons vl ON vl.id = lp.lesson_id
      WHERE lp.enrollment_id = NEW.enrollment_id
    ),
    completed_at = CASE 
      WHEN (
        SELECT COUNT(*) FILTER (WHERE lp.is_completed = false)
        FROM public.lesson_progress lp
        WHERE lp.enrollment_id = NEW.enrollment_id
      ) = 0 THEN NOW()
      ELSE NULL
    END
  WHERE id = NEW.enrollment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update assignment status based on course progress
CREATE OR REPLACE FUNCTION public.update_assignment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update assignment status when course is completed
  IF NEW.progress_percentage = 100 AND OLD.progress_percentage < 100 THEN
    UPDATE public.course_assignments 
    SET 
      status = 'completed',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND content_type = 'course'
    AND content_id = NEW.course_id
    AND status != 'completed';
    
    -- Create completion notification
    INSERT INTO public.assignment_notifications (assignment_id, notification_type)
    SELECT id, 'completed'
    FROM public.course_assignments
    WHERE user_id = NEW.user_id 
    AND content_type = 'course'
    AND content_id = NEW.course_id;
  
  -- Update status to in_progress when course is started
  ELSIF NEW.progress_percentage > 0 AND OLD.progress_percentage = 0 THEN
    UPDATE public.course_assignments 
    SET 
      status = 'in_progress',
      updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND content_type = 'course'
    AND content_id = NEW.course_id
    AND status = 'assigned';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to mark overdue assignments
CREATE OR REPLACE FUNCTION public.mark_overdue_assignments()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mark assignments as overdue
  UPDATE public.course_assignments 
  SET 
    status = 'overdue',
    updated_at = NOW()
  WHERE due_date < NOW()
  AND status IN ('assigned', 'in_progress');
  
  -- Create overdue notifications
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

-- Function to apply template to user
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
  -- Check if user applying is admin
  IF NOT is_admin_user(p_assigned_by) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can apply templates';
  END IF;
  
  -- Check if template exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.assignment_templates 
    WHERE id = p_template_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Apply each course from template
  FOR template_course IN 
    SELECT tc.*
    FROM public.template_courses tc
    WHERE tc.template_id = p_template_id
  LOOP
    -- Calculate due date
    due_date_calc := CASE 
      WHEN template_course.default_due_days > 0 
      THEN NOW() + (template_course.default_due_days || ' days')::INTERVAL
      ELSE NULL
    END;
    
    -- Create assignment if not exists
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
      'Assigned automatically via template'
    )
    ON CONFLICT (user_id, content_type, content_id) DO NOTHING;
    
    -- Count if new assignment was created
    IF FOUND THEN
      assignments_created := assignments_created + 1;
      
      -- Create notification
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

-- Function to queue email
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
    smtp_from_name := 'Sistema Hemera';
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
BEGIN
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

-- Create triggers
CREATE TRIGGER update_enrollment_progress_trigger
  AFTER UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_enrollment_progress();

CREATE TRIGGER update_assignment_status_trigger
  AFTER UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assignment_status();

-- Insert default data
INSERT INTO public.email_templates (name, subject, template_type, html_content, text_content, variables) VALUES
('Welcome', 'Welcome to Hemera System!', 'welcome', 
'<h1>Welcome, {{user_name}}!</h1>
<p>We are happy to have you in the Hemera system.</p>
<p>Your access has been created successfully.</p>',
'Welcome, {{user_name}}!

We are happy to have you in the Hemera system.

Your access has been created successfully.',
'{"user_name": "User name"}'),

('Course Assigned', 'New course assigned: {{course_name}}', 'assignment',
'<h1>New Course Assigned</h1>
<p>Hello {{user_name}},</p>
<p>A new course has been assigned to you:</p>
<h2>{{course_name}}</h2>
<p>{{course_description}}</p>
<p><strong>Due date:</strong> {{due_date}}</p>',
'New Course Assigned

Hello {{user_name}},

A new course has been assigned to you:

{{course_name}}
{{course_description}}

Due date: {{due_date}}',
'{"user_name": "User name", "course_name": "Course name", "course_description": "Course description", "due_date": "Due date"}');

INSERT INTO public.smtp_config (name, host, port, username, password_encrypted, from_email, from_name) VALUES
('Default SMTP', 'localhost', 587, 'system@hemera.com', 'encrypted_password_here', 'noreply@hemera.com', 'Hemera System');

-- Comments
COMMENT ON TABLE public.profiles IS 'User profiles with additional information';
COMMENT ON TABLE public.video_courses IS 'Video courses available in the system';
COMMENT ON TABLE public.course_enrollments IS 'User enrollments in courses';
COMMENT ON TABLE public.course_assignments IS 'Course assignments for specific users';
COMMENT ON TABLE public.assignment_templates IS 'Templates for course assignments by role or department';
COMMENT ON TABLE public.notifications IS 'In-app notifications for users';
COMMENT ON TABLE public.email_queue IS 'Email queue for asynchronous processing';

-- Migration completed successfully
SELECT 'Initial schema migration completed successfully' as status;