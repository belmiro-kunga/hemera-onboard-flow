import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Play, Youtube, Upload, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CourseWizardProps {
  course?: any;
  onClose: () => void;
}

interface LessonForm {
  title: string;
  description: string;
  video_url: string;
  video_type: 'youtube' | 'local';
  duration_minutes: number;
  is_required: boolean;
  min_watch_time_seconds: number;
}

const CourseWizard = ({ course, onClose }: CourseWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonForm | null>(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: course ? {
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail_url: course.thumbnail_url,
      is_active: course.is_active
    } : {
      title: '',
      description: '',
      category: '',
      thumbnail_url: '',
      is_active: true
    }
  });

  const { register: registerLesson, handleSubmit: handleLessonSubmit, formState: { errors: lessonErrors }, reset: resetLesson } = useForm<LessonForm>({
    defaultValues: {
      title: '',
      description: '',
      video_url: '',
      video_type: 'youtube',
      duration_minutes: 0,
      is_required: true,
      min_watch_time_seconds: 0
    }
  });

  // Extract YouTube video ID
  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const addLesson = (lessonData: LessonForm) => {
    if (editingIndex >= 0) {
      const updatedLessons = [...lessons];
      updatedLessons[editingIndex] = lessonData;
      setLessons(updatedLessons);
      setEditingIndex(-1);
    } else {
      setLessons([...lessons, lessonData]);
    }
    setShowLessonDialog(false);
    setEditingLesson(null);
    resetLesson();
  };

  const editLesson = (index: number) => {
    const lesson = lessons[index];
    setEditingLesson(lesson);
    setEditingIndex(index);
    Object.keys(lesson).forEach(key => {
      setValue(key as any, lesson[key as keyof LessonForm]);
    });
    setShowLessonDialog(true);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const moveLessonUp = (index: number) => {
    if (index > 0) {
      const newLessons = [...lessons];
      [newLessons[index - 1], newLessons[index]] = [newLessons[index], newLessons[index - 1]];
      setLessons(newLessons);
    }
  };

  const moveLessonDown = (index: number) => {
    if (index < lessons.length - 1) {
      const newLessons = [...lessons];
      [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
      setLessons(newLessons);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      let courseId;

      // Calculate total duration
      const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration_minutes, 0);

      if (course) {
        // Update existing course
        const { error } = await supabase
          .from('video_courses')
          .update({
            ...data,
            duration_minutes: totalDuration,
          })
          .eq('id', course.id);

        if (error) throw error;
        courseId = course.id;

        // Delete existing lessons
        await supabase
          .from('video_lessons')
          .delete()
          .eq('course_id', courseId);
      } else {
        // Create new course
        const { data: newCourse, error } = await supabase
          .from('video_courses')
          .insert({
            ...data,
            duration_minutes: totalDuration,
          })
          .select()
          .single();

        if (error) throw error;
        courseId = newCourse.id;
      }

      // Insert lessons
      if (lessons.length > 0) {
        const lessonsToInsert = lessons.map((lesson, index) => ({
          ...lesson,
          course_id: courseId,
          order_number: index + 1,
        }));

        const { error: lessonError } = await supabase
          .from('video_lessons')
          .insert(lessonsToInsert);

        if (lessonError) throw lessonError;
      }

      toast({
        title: course ? "Curso atualizado" : "Curso criado",
        description: course ? "O curso foi atualizado com sucesso." : "O curso foi criado com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['video-courses'] });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar curso.",
        variant: "destructive",
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título do Curso *</Label>
        <Input 
          id="title"
          {...register('title', { required: 'Título é obrigatório' })}
          placeholder="Ex: Treinamento de Segurança"
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description"
          {...register('description')}
          placeholder="Descreva o objetivo e conteúdo do curso..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Input 
          id="category"
          {...register('category')}
          placeholder="Ex: Segurança, Compliance, Técnico"
        />
      </div>

      <div>
        <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
        <Input 
          id="thumbnail_url"
          {...register('thumbnail_url')}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="is_active"
          {...register('is_active')}
        />
        <Label htmlFor="is_active">Curso ativo</Label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Videoaulas ({lessons.length})</h3>
        <Button onClick={() => setShowLessonDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Aula
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma aula adicionada ainda.</p>
            <Button 
              variant="outline" 
              onClick={() => setShowLessonDialog(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Aula
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveLessonUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveLessonDown(index)}
                      disabled={index === lessons.length - 1}
                    >
                      ↓
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={lesson.video_type === 'youtube' ? 'default' : 'secondary'}>
                          {lesson.video_type === 'youtube' ? <Youtube className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                          {lesson.video_type === 'youtube' ? 'YouTube' : 'Local'}
                        </Badge>
                        {lesson.is_required && (
                          <Badge variant="outline">Obrigatória</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{lesson.duration_minutes} min</span>
                      {lesson.min_watch_time_seconds > 0 && (
                        <span>Min: {Math.round(lesson.min_watch_time_seconds / 60)}min</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editLesson(index)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLesson(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => {
    const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration_minutes, 0);
    const requiredLessons = lessons.filter(lesson => lesson.is_required).length;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Revisão do Curso</h3>
          
          <Card>
            <CardHeader>
              <CardTitle>{watch('title')}</CardTitle>
              {watch('description') && (
                <p className="text-muted-foreground">{watch('description')}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Categoria:</span>
                  <p className="text-muted-foreground">{watch('category') || 'Não definida'}</p>
                </div>
                <div>
                  <span className="font-medium">Total de Aulas:</span>
                  <p className="text-muted-foreground">{lessons.length}</p>
                </div>
                <div>
                  <span className="font-medium">Aulas Obrigatórias:</span>
                  <p className="text-muted-foreground">{requiredLessons}</p>
                </div>
                <div>
                  <span className="font-medium">Duração Total:</span>
                  <p className="text-muted-foreground">{totalDuration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {lessons.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Aulas do Curso</h4>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">{lesson.duration_minutes} min</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={lesson.video_type === 'youtube' ? 'default' : 'secondary'} className="text-xs">
                      {lesson.video_type === 'youtube' ? 'YouTube' : 'Local'}
                    </Badge>
                    {lesson.is_required && (
                      <Badge variant="outline" className="text-xs">Obrigatória</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            <span className={`text-sm ${currentStep >= step ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step === 1 ? 'Informações' : step === 2 ? 'Videoaulas' : 'Revisão'}
            </span>
            {step < 3 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                type="button" 
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              >
                Próximo
              </Button>
            ) : (
              <Button type="submit">
                {course ? 'Atualizar Curso' : 'Criar Curso'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Aula' : 'Adicionar Nova Aula'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLessonSubmit(addLesson)} className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Título da Aula *</Label>
              <Input 
                id="lesson-title"
                {...registerLesson('title', { required: 'Título é obrigatório' })}
                placeholder="Ex: Introdução à Segurança"
              />
              {lessonErrors.title && <p className="text-sm text-destructive">{lessonErrors.title.message as string}</p>}
            </div>

            <div>
              <Label htmlFor="lesson-description">Descrição</Label>
              <Textarea 
                id="lesson-description"
                {...registerLesson('description')}
                placeholder="Descreva o conteúdo da aula..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="video-type">Tipo de Vídeo</Label>
              <Select {...registerLesson('video_type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="local">Arquivo Local</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="video-url">URL do Vídeo *</Label>
              <Input 
                id="video-url"
                {...registerLesson('video_url', { required: 'URL é obrigatória' })}
                placeholder="https://youtube.com/watch?v=... ou caminho do arquivo"
              />
              {lessonErrors.video_url && <p className="text-sm text-destructive">{lessonErrors.video_url.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duração (minutos) *</Label>
                <Input 
                  id="duration"
                  type="number"
                  min="1"
                  {...registerLesson('duration_minutes', { required: 'Duração é obrigatória', min: 1 })}
                  placeholder="Ex: 15"
                />
                {lessonErrors.duration_minutes && <p className="text-sm text-destructive">{lessonErrors.duration_minutes.message as string}</p>}
              </div>

              <div>
                <Label htmlFor="min-watch">Tempo mín. visualização (seg)</Label>
                <Input 
                  id="min-watch"
                  type="number"
                  min="0"
                  {...registerLesson('min_watch_time_seconds')}
                  placeholder="Ex: 300"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="is-required"
                {...registerLesson('is_required')}
              />
              <Label htmlFor="is-required">Aula obrigatória</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowLessonDialog(false);
                setEditingLesson(null);
                setEditingIndex(-1);
                resetLesson();
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingLesson ? 'Atualizar' : 'Adicionar'} Aula
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseWizard;