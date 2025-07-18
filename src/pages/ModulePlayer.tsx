
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Clock,
  Award,
  MessageSquare,
  StickyNote
} from 'lucide-react';
import VideoPlayer from '@/components/video/VideoPlayer';

const ModulePlayer = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  // Mock module data
  const module = {
    id: moduleId,
    title: 'Cultura e Valores HCP',
    description: 'Conheça a cultura organizacional da Hemera Capital Partners',
    duration: '45 min',
    points: 150,
    level: 'Iniciante',
    videoUrl: '/placeholder.svg', // In real app, this would be actual video URL
    sections: [
      { id: 1, title: 'Introdução', duration: '5 min', completed: true },
      { id: 2, title: 'História da Empresa', duration: '10 min', completed: true },
      { id: 3, title: 'Nossos Valores', duration: '15 min', completed: false },
      { id: 4, title: 'Código de Conduta', duration: '10 min', completed: false },
      { id: 5, title: 'Quiz Final', duration: '5 min', completed: false }
    ]
  };

  const handleProgress = (progressPercent: number) => {
    setProgress(progressPercent);
  };

  const handleComplete = () => {
    console.log('Module completed!');
    // Here you would typically update the user's progress in the backend
  };

  const addBookmark = (timestamp: number) => {
    setBookmarks(prev => [...prev, timestamp]);
  };

  const completedSections = module.sections.filter(s => s.completed).length;
  const totalSections = module.sections.length;
  const moduleProgress = (completedSections / totalSections) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/modules')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{module.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {module.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {module.points} pontos
                  </span>
                  <Badge variant="outline">{module.level}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{Math.round(progress)}% concluído</p>
                <Progress value={progress} className="w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card className="shadow-elegant">
              <CardContent className="p-6">
                <VideoPlayer
                  src={module.videoUrl}
                  title={module.title}
                  onProgress={handleProgress}
                  onComplete={handleComplete}
                  bookmarks={bookmarks}
                  onBookmark={addBookmark}
                />
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="shadow-corporate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Sobre este módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{module.description}</p>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="shadow-corporate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-primary" />
                  Suas Anotações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Faça suas anotações sobre este módulo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    Salvar Anotações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="shadow-corporate">
              <CardHeader>
                <CardTitle className="text-lg">Progresso do Módulo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Seções concluídas</span>
                    <span>{completedSections}/{totalSections}</span>
                  </div>
                  <Progress value={moduleProgress} />
                </div>
                
                <div className="space-y-2">
                  {module.sections.map((section) => (
                    <div key={section.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/5 border border-border">
                      <div className="flex items-center gap-2">
                        {section.completed ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={`text-sm ${section.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {section.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{section.duration}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Discussion Card */}
            <Card className="shadow-corporate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Discussão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Participe da discussão sobre este módulo com outros colegas.
                </div>
                <Button variant="outline" className="w-full">
                  Abrir Chat
                </Button>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="shadow-corporate">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Módulo Anterior
                  </Button>
                  <Button 
                    variant="corporate" 
                    className="w-full"
                    onClick={() => navigate('/modules')}
                  >
                    Marcar como Concluído
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="w-full">
                    Próximo Módulo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePlayer;
