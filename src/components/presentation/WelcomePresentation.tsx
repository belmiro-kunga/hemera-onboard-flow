import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Target, 
  Eye, 
  Heart, 
  History, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Play,
  CheckCircle,
  X
} from 'lucide-react';
import { useCompanyPresentation } from '@/hooks/useCompanyPresentation';
import { OrganizationalChart } from './OrganizationalChart';
import { DepartmentView } from './DepartmentView';

interface WelcomePresentationProps {
  onComplete: () => void;
  allowSkip?: boolean;
}

const WelcomePresentation: React.FC<WelcomePresentationProps> = ({ 
  onComplete, 
  allowSkip = false 
}) => {
  const navigate = useNavigate();
  const { 
    presentation, 
    organizationalChart, 
    loading, 
    markPresentationViewed, 
    markPresentationCompleted 
  } = useCompanyPresentation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const steps = [
    { 
      id: 'welcome', 
      title: 'Bem-vindo!', 
      icon: Building2,
      description: 'Conhecha nossa empresa'
    },
    { 
      id: 'mission', 
      title: 'Missão', 
      icon: Target,
      description: 'Nossa razão de existir'
    },
    { 
      id: 'vision', 
      title: 'Visão', 
      icon: Eye,
      description: 'Onde queremos chegar'
    },
    { 
      id: 'values', 
      title: 'Valores', 
      icon: Heart,
      description: 'O que nos guia'
    },
    { 
      id: 'history', 
      title: 'História', 
      icon: History,
      description: 'Nossa trajetória'
    },
    { 
      id: 'organization', 
      title: 'Organização', 
      icon: Users,
      description: 'Nossa estrutura'
    },
    { 
      id: 'departments', 
      title: 'Departamentos', 
      icon: Building2,
      description: 'Nossas áreas'
    },
    { 
      id: 'completion', 
      title: 'Conclusão', 
      icon: CheckCircle,
      description: 'Finalizando'
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    markPresentationViewed();
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await markPresentationCompleted();
    onComplete();
    navigate('/dashboard');
  };

  const handleSkip = () => {
    if (allowSkip) {
      navigate('/dashboard');
    }
  };

  if (loading || !presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="animate-pulse">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando apresentação...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];

    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            {presentation.logo_url && (
              <img 
                src={presentation.logo_url} 
                alt="Logo" 
                className="h-24 w-auto mx-auto mb-6"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Bem-vindo à {presentation.company_name}!
              </h1>
              <p className="text-xl text-muted-foreground">
                É um prazer tê-lo em nossa equipe. Vamos conhecer nossa empresa juntos?
              </p>
            </div>
            {presentation.video_url && (
              <div className="mt-8">
                <Button 
                  onClick={() => setShowVideo(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Play className="h-5 w-5" />
                  Assistir Vídeo Institucional
                </Button>
              </div>
            )}
          </div>
        );

      case 'mission':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <Target className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Nossa Missão</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {presentation.mission || 'Nossa missão é criar valor e impacto positivo.'}
              </p>
            </div>
          </div>
        );

      case 'vision':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <Eye className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Nossa Visão</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {presentation.vision || 'Ser referência no mercado e contribuir para um futuro melhor.'}
              </p>
            </div>
          </div>
        );

      case 'values':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <Heart className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Nossos Valores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {(presentation.values || ['Integridade', 'Excelência', 'Inovação']).map((value, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="p-4 text-base font-medium justify-center"
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <History className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Nossa História</h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed text-left">
                  {presentation.history || 'Uma história de crescimento, inovação e sucesso construída ao longo dos anos com dedicação e comprometimento.'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <Users className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-2">Nossa Organização</h2>
              <p className="text-lg text-muted-foreground">
                Conheça nossa estrutura organizacional
              </p>
            </div>
            <div className="max-w-6xl mx-auto">
              <OrganizationalChart 
                nodes={organizationalChart} 
                highlightUser={true}
                interactive={true}
              />
            </div>
          </div>
        );

      case 'departments':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-2">Nossos Departamentos</h2>
              <p className="text-lg text-muted-foreground">
                Conheça as diferentes áreas da empresa
              </p>
            </div>
            <DepartmentView />
          </div>
        );

      case 'completion':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Apresentação Concluída!</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Agora você conhece melhor nossa empresa. Estamos ansiosos para trabalhar juntos!
              </p>
              <Button onClick={handleComplete} size="lg" className="px-8">
                Ir para o Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {presentation.company_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Apresentação Corporativa
                </p>
              </div>
            </div>
            {allowSkip && (
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Pular
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {steps[currentStep].title}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-xl border-0 bg-card/95 backdrop-blur-md">
          <CardContent className="p-8 md:p-12">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} className="gap-2">
                Finalizar
                <CheckCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={nextStep} className="gap-2">
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && presentation.video_url && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vídeo Institucional</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowVideo(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={presentation.video_url}
                className="w-full h-full rounded"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePresentation;