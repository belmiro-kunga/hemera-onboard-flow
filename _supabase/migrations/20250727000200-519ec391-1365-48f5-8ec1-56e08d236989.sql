-- Criar tabelas para o sistema de simulados (sem tipos duplicados)

-- Verificar se difficulty_level já existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE public.difficulty_level AS ENUM ('facil', 'medio', 'dificil');
    END IF;
END $$;

-- Tabela de simulados
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

-- Tabela de questões
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

-- Tabela de opções de resposta
CREATE TABLE public.opcoes_resposta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  questao_id UUID REFERENCES public.questoes(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de tentativas de simulado
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

-- Tabela de respostas do usuário
CREATE TABLE public.user_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.simulado_attempts(id) ON DELETE CASCADE,
  questao_id UUID REFERENCES public.questoes(id),
  opcao_resposta_id UUID REFERENCES public.opcoes_resposta(id),
  answer_text TEXT, -- para perguntas de resposta única
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opcoes_resposta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para simulados
CREATE POLICY "Admins can manage all simulados" 
ON public.simulados 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view active simulados" 
ON public.simulados 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para questões
CREATE POLICY "Admins can manage all questoes" 
ON public.questoes 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view questoes of active simulados" 
ON public.questoes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.simulados s 
  WHERE s.id = simulado_id AND s.is_active = true
));

-- Políticas RLS para opções
CREATE POLICY "Admins can manage all opcoes" 
ON public.opcoes_resposta 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can view opcoes of active simulados" 
ON public.opcoes_resposta 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.questoes q 
  JOIN public.simulados s ON s.id = q.simulado_id 
  WHERE q.id = questao_id AND s.is_active = true
));

-- Políticas RLS para tentativas
CREATE POLICY "Admins can view all attempts" 
ON public.simulado_attempts 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can manage own attempts" 
ON public.simulado_attempts 
FOR ALL 
USING (auth.uid() = user_id);

-- Políticas RLS para respostas
CREATE POLICY "Admins can view all answers" 
ON public.user_answers 
FOR SELECT 
USING (is_admin_user(auth.uid()));

CREATE POLICY "Users can manage own answers" 
ON public.user_answers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.simulado_attempts sa 
  WHERE sa.id = attempt_id AND sa.user_id = auth.uid()
));

-- Triggers para updated_at
CREATE TRIGGER update_simulados_updated_at
BEFORE UPDATE ON public.simulados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questoes_updated_at
BEFORE UPDATE ON public.questoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();