import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  CheckCircle, 
  Circle,
  Clock,
  Youtube,
  Upload,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoLessonPlayerProps {
  enrollment: any;
  onClose: () => void;
}

const VideoLessonPlayer = ({ enrollment, onClose }: VideoLessonPlayerProps) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedTime, setWatchedTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch course lessons and progress
  const { data: lessonsData, isLoading } = useQuery({
    queryKey: ['course-lessons', enrollment.course_id],
    queryFn: async () => {
      const { data: lessons, error: lessonsError } = await supabase
        .from('video_lessons')
        .select('*')
        .eq('course_id', enrollment.course_id)
        .order('order_number');

      if (lessonsError) throw lessonsError;

      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id);

      if (progressError) throw progressError;

      return { lessons, progress };
    }
  });

  const lessons = lessonsData?.lessons || [];
  const progress = lessonsData?.progress || [];
  const currentLesson = lessons[currentLessonIndex];

  // Get progress for current lesson
  const currentProgress = progress.find(p => p.lesson_id === currentLesson?.id);

  // Update lesson progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, watchedSeconds, isCompleted }: any) => {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          lesson_id: lessonId,
          enrollment_id: enrollment.id,
          watched_seconds: watchedSeconds,
          last_position_seconds: Math.floor(currentTime),
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['my-course-enrollments'] });
    }
  });

  // Extract YouTube video ID
  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle time updates
  useEffect(() => {
    if (!currentLesson) return;

    const interval = setInterval(() => {
      if (isPlaying) {
        setWatchedTime(prev => prev + 1);
        
        // Auto-save progress every 30 seconds
        if (watchedTime > 0 && watchedTime % 30 === 0) {
          const isCompleted = watchedTime >= (currentLesson.min_watch_time_seconds || currentLesson.duration_minutes * 60 * 0.8);
          updateProgressMutation.mutate({
            lessonId: currentLesson.id,
            watchedSeconds: watchedTime,
            isCompleted
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, watchedTime, currentLesson]);

  // Load saved position
  useEffect(() => {
    if (currentProgress?.last_position_seconds) {
      setCurrentTime(currentProgress.last_position_seconds);
      setWatchedTime(currentProgress.watched_seconds || 0);
    } else {
      setCurrentTime(0);
      setWatchedTime(0);
    }
  }, [currentLessonIndex, currentProgress]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handleMarkAsCompleted = () => {
    if (!currentLesson) return;

    updateProgressMutation.mutate({
      lessonId: currentLesson.id,
      watchedSeconds: Math.max(watchedTime, currentLesson.duration_minutes * 60 * 0.8),
      isCompleted: true
    });

    toast({
      title: "Aula concluída!",
      description: "Seu progresso foi salvo.",
    });

    // Auto-advance to next lesson
    if (currentLessonIndex < lessons.length - 1) {
      setTimeout(() => setCurrentLessonIndex(currentLessonIndex + 1), 1000);
    }
  };

  const getLessonIcon = (lesson: any) => {
    const lessonProgress = progress.find(p => p.lesson_id === lesson.id);
    return lessonProgress?.is_completed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <Circle className="h-4 w-4 text-muted-foreground" />
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div>Carregando aulas...</div>;
  }

  if (!currentLesson) {
    return <div>Nenhuma aula encontrada.</div>;
  }

  const progressPercentage = currentLesson.duration_minutes > 0 
    ? Math.min((watchedTime / (currentLesson.duration_minutes * 60)) * 100, 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      {/* Video Player */}
      <div className="lg:col-span-2 space-y-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          {currentLesson.video_type === 'youtube' ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${extractYouTubeId(currentLesson.video_url)}?autoplay=${isPlaying ? 1 : 0}&start=${Math.floor(currentTime)}`}
              className="w-full h-full"
              allowFullScreen
              title={currentLesson.title}
            />
          ) : (
            <video
              ref={videoRef}
              src={currentLesson.video_url}
              className="w-full h-full"
              controls
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* Video Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
                <p className="text-muted-foreground">{currentLesson.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={currentLesson.video_type === 'youtube' ? 'default' : 'secondary'}>
                  {currentLesson.video_type === 'youtube' ? <Youtube className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                  {currentLesson.video_type === 'youtube' ? 'YouTube' : 'Local'}
                </Badge>
                {currentLesson.is_required && (
                  <Badge variant="outline">Obrigatória</Badge>
                )}
                {currentProgress?.is_completed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluída
                  </Badge>
                )}
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso da Aula</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(watchedTime)}</span>
                  <span>{formatTime(currentLesson.duration_minutes * 60)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousLesson}
                    disabled={currentLessonIndex === 0}
                  >
                    <SkipBack className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex === lessons.length - 1}
                  >
                    Próxima
                    <SkipForward className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {!currentProgress?.is_completed && (
                  <Button 
                    onClick={handleMarkAsCompleted}
                    disabled={updateProgressMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar como Concluída
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson List Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Aulas do Curso ({lessons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const lessonProgress = progress.find(p => p.lesson_id === lesson.id);
                  const isCurrentLesson = index === currentLessonIndex;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isCurrentLesson 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getLessonIcon(lesson)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${isCurrentLesson ? 'text-primary' : ''}`}>
                            {index + 1}. {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration_minutes}min
                            {lesson.is_required && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                Obrigatória
                              </Badge>
                            )}
                          </div>
                          {lessonProgress && lessonProgress.watched_seconds > 0 && (
                            <div className="mt-2">
                              <Progress 
                                value={Math.min((lessonProgress.watched_seconds / (lesson.duration_minutes * 60)) * 100, 100)} 
                                className="h-1" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progresso do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Conclusão Geral</span>
                  <span>{enrollment.progress_percentage}%</span>
                </div>
                <Progress value={enrollment.progress_percentage} className="h-2" />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>{progress.filter(p => p.is_completed).length} de {lessons.length} aulas concluídas</p>
              </div>

              {enrollment.progress_percentage === 100 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Curso Concluído!</p>
                    <p className="text-xs text-green-600">Parabéns pela conclusão</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoLessonPlayer;