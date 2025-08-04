import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSimulados } from '@/hooks/useSimulados';
import { type Question, type Option } from '@/lib/api/simulados';
import { Plus, Trash2, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface Option {
  id?: string;
  text: string;
  is_correct: boolean;
  order_number: number;
}

interface Question {
  id?: string;
  text: string;
  type: 'multiple_choice' | 'single_answer';
  explanation: string;
  order_number: number;
  options: Option[];
}

interface SimuladoData {
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  is_active: boolean;
}

interface SimuladoWizardProps {
  simulado?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SimuladoWizard: React.FC<SimuladoWizardProps> = ({
  simulado,
  onSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Usando o hook personalizado para simulados
  const {
    createSimulado,
    updateSimulado,
    getQuestions
  } = useSimulados();

  // Estado para dados básicos
  const [simuladoData, setSimuladoData] = useState<SimuladoData>({
    title: '',
    description: '',
    duration_minutes: 60,
    total_questions: 10,
    difficulty: 'medio',
    is_active: true,
  });

  // Estado para questões
  const [questions, setQuestions] = useState<Question[]>([]);

  // Carregar dados do simulado se estiver editando
  useEffect(() => {
    if (simulado) {
      setSimuladoData({
        title: simulado.title || '',
        description: simulado.description || '',
        duration_minutes: simulado.duration_minutes || 60,
        total_questions: simulado.total_questions || 10,
        difficulty: simulado.difficulty || 'medio',
        is_active: simulado.is_active ?? true,
      });
      loadQuestions();
    }
  }, [simulado]);

  const loadQuestions = async () => {
    if (!simulado?.id) return;

    try {
      const questionsData = await getQuestions(simulado.id);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      text: '',
      type: 'multiple_choice',
      explanation: '',
      order_number: questions.length + 1,
      options: [
        { text: '', is_correct: true, order_number: 1 },
        { text: '', is_correct: false, order_number: 2 },
        { text: '', is_correct: false, order_number: 3 },
        { text: '', is_correct: false, order_number: 4 },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions.map((q, i) => ({ ...q, order_number: i + 1 })));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    
    // Se mudou o tipo para single_answer, resetar opções
    if (field === 'type' && value === 'single_answer') {
      newQuestions[index].options = [];
    } else if (field === 'type' && value === 'multiple_choice' && newQuestions[index].options.length === 0) {
      newQuestions[index].options = [
        { text: '', is_correct: true, order_number: 1 },
        { text: '', is_correct: false, order_number: 2 },
        { text: '', is_correct: false, order_number: 3 },
        { text: '', is_correct: false, order_number: 4 },
      ];
    }
    
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = {
      ...newQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };

    // Se marcou como correta, desmarcar as outras (para multiple choice)
    if (field === 'is_correct' && value && newQuestions[questionIndex].type === 'multiple_choice') {
      newQuestions[questionIndex].options.forEach((opt, i) => {
        if (i !== optionIndex) {
          opt.is_correct = false;
        }
      });
    }

    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    question.options.push({
      text: '',
      is_correct: false,
      order_number: question.options.length + 1,
    });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options
      .filter((_, i) => i !== optionIndex)
      .map((opt, i) => ({ ...opt, order_number: i + 1 }));
    setQuestions(newQuestions);
  };

  const validateStep1 = () => {
    return simuladoData.title.trim() && simuladoData.duration_minutes > 0 && simuladoData.total_questions > 0;
  };

  const validateStep2 = () => {
    return questions.length > 0 && questions.every(q => {
      if (!q.text.trim()) return false;
      if (q.type === 'multiple_choice') {
        return q.options.length >= 2 && 
               q.options.some(opt => opt.is_correct) && 
               q.options.every(opt => opt.text.trim());
      }
      return true;
    });
  };

  const handleSave = async () => {
    if (!validateStep1() || !validateStep2()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Usar a nova API para salvar ou atualizar simulado
      if (simulado?.id) {
        await updateSimulado(simulado.id, simuladoData, questions);
      } else {
        await createSimulado(simuladoData, questions);
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar simulado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o simulado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
        <CardDescription>
          Configure as informações básicas do simulado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Título do Simulado *</Label>
          <Input
            id="title"
            value={simuladoData.title}
            onChange={(e) => setSimuladoData({ ...simuladoData, title: e.target.value })}
            placeholder="Ex: Simulado de Matemática Básica"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={simuladoData.description}
            onChange={(e) => setSimuladoData({ ...simuladoData, description: e.target.value })}
            placeholder="Descreva o conteúdo e objetivos do simulado"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duração (minutos) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={simuladoData.duration_minutes}
              onChange={(e) => setSimuladoData({ ...simuladoData, duration_minutes: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="total_questions">Total de Questões *</Label>
            <Input
              id="total_questions"
              type="number"
              min="1"
              value={simuladoData.total_questions}
              onChange={(e) => setSimuladoData({ ...simuladoData, total_questions: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="difficulty">Dificuldade</Label>
          <Select
            value={simuladoData.difficulty}
            onValueChange={(value: 'facil' | 'medio' | 'dificil') => 
              setSimuladoData({ ...simuladoData, difficulty: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facil">Fácil</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="dificil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={simuladoData.is_active}
            onCheckedChange={(checked) => 
              setSimuladoData({ ...simuladoData, is_active: checked as boolean })
            }
          />
          <Label htmlFor="is_active">Simulado ativo</Label>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Questões do Simulado
            <Button onClick={addQuestion} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Questão
            </Button>
          </CardTitle>
          <CardDescription>
            Crie as questões para o simulado. Suporte a múltipla escolha e resposta única.
          </CardDescription>
        </CardHeader>
      </Card>

      {questions.map((question, questionIndex) => (
        <Card key={questionIndex}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Questão {questionIndex + 1}</CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Questão</Label>
              <Select
                value={question.type}
                onValueChange={(value: 'multiple_choice' | 'single_answer') =>
                  updateQuestion(questionIndex, 'type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="single_answer">Resposta Única</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pergunta *</Label>
              <Textarea
                value={question.text}
                onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                placeholder="Digite a pergunta..."
                rows={3}
              />
            </div>

            {question.type === 'multiple_choice' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Opções de Resposta</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addOption(questionIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Opção
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <RadioGroup
                        value={option.is_correct ? 'correct' : 'incorrect'}
                        onValueChange={(value) => 
                          updateOption(questionIndex, optionIndex, 'is_correct', value === 'correct')
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="correct" id={`correct-${questionIndex}-${optionIndex}`} />
                        </div>
                      </RadioGroup>
                      
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                        placeholder={`Opção ${optionIndex + 1}`}
                        className="flex-1"
                      />
                      
                      {option.is_correct && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Correta
                        </Badge>
                      )}
                      
                      {question.options.length > 2 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Explicação da Resposta</Label>
              <Textarea
                value={question.explanation}
                onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                placeholder="Explique por que esta é a resposta correta..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {questions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Nenhuma questão adicionada</h3>
              <p className="text-muted-foreground mb-4">
                Adicione pelo menos uma questão para o simulado.
              </p>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Questão
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-center space-x-8">
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
          }`}>
            1
          </div>
          <span className="font-medium">Informações Básicas</span>
        </div>
        
        <div className={`w-12 h-px ${currentStep >= 2 ? 'bg-primary' : 'bg-muted-foreground'}`} />
        
        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
          }`}>
            2
          </div>
          <span className="font-medium">Questões</span>
        </div>
      </div>

      <Separator />

      {/* Step content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          {currentStep < 2 ? (
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!validateStep1()}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              disabled={loading || !validateStep2()}
            >
              {loading ? 'Salvando...' : (simulado?.id ? 'Atualizar' : 'Criar Simulado')}
              <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};