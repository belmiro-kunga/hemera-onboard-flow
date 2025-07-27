-- Criar tabela para informações da empresa
CREATE TABLE public.company_presentation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  mission TEXT,
  vision TEXT,
  values JSONB DEFAULT '[]'::jsonb,
  history TEXT,
  logo_url TEXT,
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_acknowledgment BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para organograma
CREATE TABLE public.organizational_chart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.organizational_chart(id),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  photo_url TEXT,
  bio TEXT,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_presentation BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para tracking de visualizações
CREATE TABLE public.presentation_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_mandatory_completed BOOLEAN DEFAULT false,
  first_login_presentation_shown BOOLEAN DEFAULT false
);

-- Habilitar RLS
ALTER TABLE public.company_presentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_views ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para company_presentation
CREATE POLICY "Admins can manage company presentation" 
ON public.company_presentation 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view active company presentation" 
ON public.company_presentation 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para organizational_chart
CREATE POLICY "Admins can manage organizational chart" 
ON public.organizational_chart 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view active organizational chart" 
ON public.organizational_chart 
FOR SELECT 
USING (is_active = true AND show_in_presentation = true);

-- Políticas RLS para presentation_views
CREATE POLICY "Admins can view all presentation views" 
ON public.presentation_views 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can manage own presentation views" 
ON public.presentation_views 
FOR ALL 
USING (auth.uid() = user_id);

-- Inserir configurações padrão no site_settings
INSERT INTO public.site_settings (setting_key, setting_value, description) VALUES
('presentation_enabled', 'true', 'Habilitar apresentação da empresa'),
('presentation_mandatory', 'true', 'Tornar apresentação obrigatória'),
('presentation_skip_allowed', 'false', 'Permitir pular apresentação'),
('presentation_auto_show', 'true', 'Exibir automaticamente no primeiro login')
ON CONFLICT (setting_key) DO NOTHING;

-- Função para verificar se usuário precisa ver apresentação
CREATE OR REPLACE FUNCTION public.user_needs_presentation(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(
    (SELECT last_login IS NULL 
     FROM public.profiles 
     WHERE user_id = user_uuid),
    false
  ) AND NOT EXISTS (
    SELECT 1 
    FROM public.presentation_views 
    WHERE user_id = user_uuid 
    AND completed_at IS NOT NULL
  );
$function$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_company_presentation_updated_at
BEFORE UPDATE ON public.company_presentation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizational_chart_updated_at
BEFORE UPDATE ON public.organizational_chart
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();