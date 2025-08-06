-- Create simulado_certificates table
CREATE TABLE public.simulado_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  simulado_id UUID NOT NULL,
  attempt_id UUID NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score NUMERIC,
  pass_score NUMERIC NOT NULL DEFAULT 70
);

-- Enable RLS
ALTER TABLE public.simulado_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for simulado_certificates
CREATE POLICY "Admins can view all simulado certificates" 
ON public.simulado_certificates 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view own simulado certificates" 
ON public.simulado_certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create simulado certificates" 
ON public.simulado_certificates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- Create storage policies for certificates
CREATE POLICY "Anyone can view certificates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certificates');

CREATE POLICY "System can upload certificates" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);

-- Function to generate simulado certificate
CREATE OR REPLACE FUNCTION public.generate_simulado_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for automatic simulado certificate generation
CREATE TRIGGER generate_simulado_certificate_trigger
  AFTER UPDATE ON public.simulado_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_simulado_certificate();

-- Function to generate course certificate
CREATE OR REPLACE FUNCTION public.generate_course_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for automatic course certificate generation
CREATE TRIGGER generate_course_certificate_trigger
  AFTER UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_course_certificate();