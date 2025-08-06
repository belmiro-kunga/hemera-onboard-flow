-- Create gamification tables and system

-- Create user_points table to track all point activities
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  activity_type TEXT NOT NULL, -- 'course_completion', 'simulado_completion', 'first_attempt_bonus', 'streak_bonus'
  source_id UUID, -- course_id or simulado_id
  description TEXT,
  multiplier DECIMAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- lucide icon name
  icon_color TEXT DEFAULT 'primary',
  criteria_type TEXT NOT NULL, -- 'points_total', 'courses_completed', 'simulados_completed', 'streak_days', 'level_reached'
  criteria_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create user_levels table
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  points_to_next_level INTEGER DEFAULT 100,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  courses_completed INTEGER DEFAULT 0,
  simulados_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gamification_settings table
CREATE TABLE public.gamification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Users can view own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all points" ON public.user_points
  FOR SELECT USING (is_admin_user(auth.uid()));
CREATE POLICY "System can insert points" ON public.user_points
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for badges
CREATE POLICY "Everyone can view active badges" ON public.badges
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage badges" ON public.badges
  FOR ALL USING (is_admin_user(auth.uid()));

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user badges" ON public.user_badges
  FOR SELECT USING (is_admin_user(auth.uid()));
CREATE POLICY "System can award badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for user_levels
CREATE POLICY "Users can view own level" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own level" ON public.user_levels
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all levels" ON public.user_levels
  FOR SELECT USING (is_admin_user(auth.uid()));
CREATE POLICY "System can manage levels" ON public.user_levels
  FOR ALL WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for gamification_settings
CREATE POLICY "Admins can manage gamification settings" ON public.gamification_settings
  FOR ALL USING (is_admin_user(auth.uid()));

-- Create function to calculate points for level
CREATE OR REPLACE FUNCTION public.get_points_for_level(level_number INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT (level_number * 100 + (level_number - 1) * 50);
$$;

-- Create function to calculate level from points
CREATE OR REPLACE FUNCTION public.get_level_from_points(points INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN points < 100 THEN 1
    ELSE LEAST(50, 1 + FLOOR((points - 50) / 150.0))
  END;
$$;

-- Create function to add points and update level
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_activity_type TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_multiplier DECIMAL DEFAULT 1.0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  final_points INTEGER;
  point_id UUID;
  current_total INTEGER;
  new_level INTEGER;
  current_level INTEGER;
BEGIN
  final_points := ROUND(p_points * p_multiplier);
  
  -- Insert point record
  INSERT INTO public.user_points (user_id, points, activity_type, source_id, description, multiplier)
  VALUES (p_user_id, final_points, p_activity_type, p_source_id, p_description, p_multiplier)
  RETURNING id INTO point_id;
  
  -- Update or create user level record
  INSERT INTO public.user_levels (user_id, total_points, last_activity_date)
  VALUES (p_user_id, final_points, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_levels.total_points + final_points,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
  
  -- Get updated totals and calculate new level
  SELECT total_points, current_level INTO current_total, current_level
  FROM public.user_levels WHERE user_id = p_user_id;
  
  new_level := public.get_level_from_points(current_total);
  
  -- Update level if changed
  IF new_level != current_level THEN
    UPDATE public.user_levels 
    SET 
      current_level = new_level,
      points_to_next_level = public.get_points_for_level(new_level + 1) - current_total
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_levels 
    SET points_to_next_level = public.get_points_for_level(current_level + 1) - current_total
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN point_id;
END;
$$;

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
BEGIN
  -- Get user stats
  SELECT 
    COALESCE(ul.total_points, 0) as total_points,
    COALESCE(ul.current_level, 1) as current_level,
    COALESCE(ul.courses_completed, 0) as courses_completed,
    COALESCE(ul.simulados_completed, 0) as simulados_completed,
    COALESCE(ul.current_streak_days, 0) as streak_days
  INTO user_stats
  FROM public.user_levels ul
  WHERE ul.user_id = p_user_id;
  
  -- Check all active badges
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE is_active = true 
    AND id NOT IN (SELECT badge_id FROM public.user_badges WHERE user_id = p_user_id)
  LOOP
    CASE badge_record.criteria_type
      WHEN 'points_total' THEN
        IF user_stats.total_points >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'courses_completed' THEN
        IF user_stats.courses_completed >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'simulados_completed' THEN
        IF user_stats.simulados_completed >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'level_reached' THEN
        IF user_stats.current_level >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        END IF;
      WHEN 'streak_days' THEN
        IF user_stats.streak_days >= badge_record.criteria_value THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (p_user_id, badge_record.id);
        END IF;
    END CASE;
  END LOOP;
END;
$$;

-- Update existing course certificate generation to include points requirement
CREATE OR REPLACE FUNCTION public.generate_course_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_total_points INTEGER;
  required_points INTEGER := 50; -- Minimum points required for course certificate
BEGIN
  -- Only generate certificate if just completed (100% progress)
  IF NEW.progress_percentage = 100 AND OLD.progress_percentage < 100 THEN
    -- Get user's total points
    SELECT COALESCE(total_points, 0) INTO user_total_points
    FROM public.user_levels
    WHERE user_id = NEW.user_id;
    
    -- Check if user has enough points
    IF user_total_points >= required_points THEN
      INSERT INTO public.course_certificates (
        user_id,
        course_id,
        enrollment_id
      ) VALUES (
        NEW.user_id,
        NEW.course_id,
        NEW.id
      );
      
      -- Award points for course completion
      PERFORM public.add_user_points(
        NEW.user_id,
        100,
        'course_completion',
        NEW.course_id,
        'Curso concluído com sucesso'
      );
      
      -- Update course completion count
      UPDATE public.user_levels 
      SET courses_completed = courses_completed + 1
      WHERE user_id = NEW.user_id;
      
      -- Check for new badges
      PERFORM public.check_and_award_badges(NEW.user_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update existing simulado certificate generation to include points requirement
CREATE OR REPLACE FUNCTION public.generate_simulado_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_total_points INTEGER;
  required_points INTEGER := 25; -- Minimum points required for simulado certificate
  points_to_award INTEGER;
BEGIN
  -- Only generate certificate if completed and passed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.score >= 70 THEN
    -- Get user's total points
    SELECT COALESCE(total_points, 0) INTO user_total_points
    FROM public.user_levels
    WHERE user_id = NEW.user_id;
    
    -- Check if user has enough points
    IF user_total_points >= required_points THEN
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
    
    -- Award points based on performance
    points_to_award := CASE 
      WHEN NEW.score >= 90 THEN 100
      WHEN NEW.score >= 80 THEN 75
      ELSE 50
    END;
    
    PERFORM public.add_user_points(
      NEW.user_id,
      points_to_award,
      'simulado_completion',
      NEW.simulado_id,
      'Simulado concluído com ' || NEW.score || '% de acerto'
    );
    
    -- Update simulado completion count
    UPDATE public.user_levels 
    SET simulados_completed = simulados_completed + 1
    WHERE user_id = NEW.user_id;
    
    -- Check for new badges
    PERFORM public.check_and_award_badges(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Insert default gamification settings
INSERT INTO public.gamification_settings (setting_key, setting_value, description) VALUES
('course_completion_points', '100', 'Pontos por conclusão de curso'),
('simulado_base_points', '50', 'Pontos base por conclusão de simulado'),
('simulado_bonus_80', '25', 'Pontos bônus por nota >= 80%'),
('simulado_bonus_90', '50', 'Pontos bônus por nota >= 90%'),
('first_attempt_multiplier', '1.5', 'Multiplicador para primeira tentativa'),
('streak_bonus_points', '10', 'Pontos bônus por dia consecutivo'),
('certificate_course_min_points', '50', 'Pontos mínimos para certificado de curso'),
('certificate_simulado_min_points', '25', 'Pontos mínimos para certificado de simulado');

-- Insert default badges
INSERT INTO public.badges (name, description, icon_name, icon_color, criteria_type, criteria_value) VALUES
('Primeiro Passo', 'Complete seu primeiro curso', 'Award', 'primary', 'courses_completed', 1),
('Estudioso', 'Complete 5 cursos', 'BookOpen', 'blue', 'courses_completed', 5),
('Expert', 'Complete 10 cursos', 'GraduationCap', 'purple', 'courses_completed', 10),
('Centurião', 'Acumule 100 pontos', 'Star', 'yellow', 'points_total', 100),
('Milionário', 'Acumule 1000 pontos', 'Crown', 'orange', 'points_total', 1000),
('Testador', 'Complete seu primeiro simulado', 'Target', 'green', 'simulados_completed', 1),
('Especialista', 'Complete 10 simulados', 'Zap', 'red', 'simulados_completed', 10),
('Nível 5', 'Alcance o nível 5', 'TrendingUp', 'indigo', 'level_reached', 5),
('Nível 10', 'Alcance o nível 10', 'Rocket', 'pink', 'level_reached', 10),
('Dedicado', 'Mantenha uma sequência de 7 dias', 'Calendar', 'cyan', 'streak_days', 7);

-- Add triggers for updating timestamps
CREATE TRIGGER update_badges_updated_at
    BEFORE UPDATE ON public.badges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_levels_updated_at
    BEFORE UPDATE ON public.user_levels
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamification_settings_updated_at
    BEFORE UPDATE ON public.gamification_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();