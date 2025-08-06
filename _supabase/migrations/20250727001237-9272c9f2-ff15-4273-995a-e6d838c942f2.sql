-- Create video courses system tables

-- Video courses table
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

-- Video lessons table
CREATE TABLE public.video_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.video_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'youtube', -- youtube, local
  duration_minutes INTEGER DEFAULT 0,
  order_number INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  min_watch_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  course_id UUID NOT NULL REFERENCES public.video_courses(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(user_id),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- Lesson progress table
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

-- Course certificates table
CREATE TABLE public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  course_id UUID NOT NULL REFERENCES public.video_courses(id),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id),
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.video_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_courses
CREATE POLICY "Admins can manage all video courses" 
ON public.video_courses 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view active video courses assigned to them" 
ON public.video_courses 
FOR SELECT 
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.course_enrollments 
    WHERE course_id = video_courses.id 
    AND user_id = auth.uid()
  )
);

-- RLS Policies for video_lessons
CREATE POLICY "Admins can manage all video lessons" 
ON public.video_lessons 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view lessons of enrolled courses" 
ON public.video_lessons 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    JOIN public.video_courses vc ON vc.id = ce.course_id
    WHERE ce.user_id = auth.uid() 
    AND vc.id = video_lessons.course_id
    AND vc.is_active = true
  )
);

-- RLS Policies for course_enrollments
CREATE POLICY "Admins can manage all enrollments" 
ON public.course_enrollments 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view own enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment progress" 
ON public.course_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for lesson_progress
CREATE POLICY "Admins can view all lesson progress" 
ON public.lesson_progress 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can manage own lesson progress" 
ON public.lesson_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for course_certificates
CREATE POLICY "Admins can view all certificates" 
ON public.course_certificates 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view own certificates" 
ON public.course_certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create certificates" 
ON public.course_certificates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_video_lessons_course_id ON public.video_lessons(course_id);
CREATE INDEX idx_video_lessons_order ON public.video_lessons(course_id, order_number);
CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX idx_lesson_progress_enrollment ON public.lesson_progress(enrollment_id);

-- Create triggers for updated_at
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