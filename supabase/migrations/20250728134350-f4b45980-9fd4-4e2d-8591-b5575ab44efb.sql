-- Create assignment system tables and functions

-- Create course assignments table
CREATE TABLE IF NOT EXISTS public.course_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'course',
  content_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'assigned',
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment templates table
CREATE TABLE IF NOT EXISTS public.assignment_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  job_title TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create template courses table
CREATE TABLE IF NOT EXISTS public.template_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'course',
  content_id UUID NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  default_due_days INTEGER DEFAULT 30,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment notifications table
CREATE TABLE IF NOT EXISTS public.assignment_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email_sent BOOLEAN DEFAULT false,
  in_app_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_assignments
CREATE POLICY "Admins can manage all assignments" 
ON public.course_assignments 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view own assignments" 
ON public.course_assignments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own assignment progress" 
ON public.course_assignments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for assignment_templates
CREATE POLICY "Admins can manage templates" 
ON public.assignment_templates 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Create RLS policies for template_courses
CREATE POLICY "Admins can manage template courses" 
ON public.template_courses 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Create RLS policies for assignment_notifications
CREATE POLICY "Admins can manage notifications" 
ON public.assignment_notifications 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view own notifications" 
ON public.assignment_notifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.course_assignments ca 
  WHERE ca.id = assignment_notifications.assignment_id 
  AND ca.user_id = auth.uid()
));

-- Create function to apply template to user
CREATE OR REPLACE FUNCTION public.apply_template_to_user(
  p_template_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_course RECORD;
  assignments_created INTEGER := 0;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Loop through template courses and create assignments
  FOR template_course IN 
    SELECT * FROM public.template_courses 
    WHERE template_id = p_template_id
  LOOP
    -- Check if assignment already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.course_assignments 
      WHERE user_id = p_user_id 
      AND content_id = template_course.content_id
      AND content_type = template_course.content_type
    ) THEN
      -- Create assignment
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
        auth.uid(),
        CASE 
          WHEN template_course.default_due_days > 0 
          THEN now() + (template_course.default_due_days || ' days')::INTERVAL
          ELSE NULL
        END,
        template_course.priority,
        'Atribuído via template: ' || (SELECT name FROM public.assignment_templates WHERE id = p_template_id)
      );
      
      assignments_created := assignments_created + 1;
    END IF;
  END LOOP;

  RETURN assignments_created;
END;
$$;

-- Create function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  email TEXT,
  total_points INTEGER,
  current_level INTEGER,
  courses_completed INTEGER,
  simulados_completed INTEGER,
  badge_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.user_id,
    p.name,
    p.email,
    COALESCE(ul.total_points, 0) as total_points,
    COALESCE(ul.current_level, 1) as current_level,
    COALESCE(ul.courses_completed, 0) as courses_completed,
    COALESCE(ul.simulados_completed, 0) as simulados_completed,
    COALESCE(badge_count.count, 0) as badge_count
  FROM public.profiles p
  LEFT JOIN public.user_levels ul ON ul.user_id = p.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as count 
    FROM public.user_badges 
    GROUP BY user_id
  ) badge_count ON badge_count.user_id = p.user_id
  WHERE p.is_active = true
  ORDER BY total_points DESC, current_level DESC
  LIMIT 50;
$$;

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_assignment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_assignments_updated_at
  BEFORE UPDATE ON public.course_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assignment_updated_at();

CREATE TRIGGER update_assignment_templates_updated_at
  BEFORE UPDATE ON public.assignment_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assignment_updated_at();