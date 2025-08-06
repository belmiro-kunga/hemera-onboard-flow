-- Fix security warnings by adding SET search_path to functions
CREATE OR REPLACE FUNCTION public.generate_simulado_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate certificate if completed and passed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.score >= 70 THEN
    INSERT INTO public.simulado_certificates (
      user_id,
      simulado_id,
      attempt_id,
      score,
      pass_score
    ) VALUES (
      NEW.user_id,
      NEW.simulado_id,
      NEW.id,
      NEW.score,
      70
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_course_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate certificate if just completed (100% progress)
  IF NEW.progress_percentage = 100 AND OLD.progress_percentage < 100 THEN
    INSERT INTO public.course_certificates (
      user_id,
      course_id,
      enrollment_id
    ) VALUES (
      NEW.user_id,
      NEW.course_id,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;