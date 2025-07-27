-- Fix security warning and add trigger for enrollment progress updates

-- Update function with proper security settings
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Create trigger to update enrollment progress when lesson progress changes
CREATE TRIGGER update_enrollment_progress_trigger
AFTER UPDATE ON public.lesson_progress
FOR EACH ROW
WHEN (OLD.is_completed IS DISTINCT FROM NEW.is_completed)
EXECUTE FUNCTION public.update_enrollment_progress();