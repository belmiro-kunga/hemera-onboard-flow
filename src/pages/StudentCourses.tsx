import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Clock, Calendar, Award, Search, BookOpen } from 'lucide-react';
import VideoLessonPlayer from '@/components/video/VideoLessonPlayer';

const StudentCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Fetch user's course enrollments
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-course-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          video_courses (
            *,
            video_lessons (count)
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_certificates')
        .select(`
          *,
          video_courses (title, category)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      return data;
    }
  });

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const course = enrollment.video_courses;
    return course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           course.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Categorize enrollments
  const inProgressCourses = filteredEnrollments.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100);
  const notStartedCourses = filteredEnrollments.filter(e => e.progress_percentage === 0);
  const completedCourses = filteredEnrollments.filter(e => e.progress_percentage === 100);

  const getStatusBadge = (enrollment: any) => {
    if (enrollment.progress_percentage === 100) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Concluído</Badge>;
    } else if (enrollment.progress_percentage > 0) {
      return <Badge variant="default">Em Andamento</Badge>;
    } else {
      return <Badge variant="outline">Não Iniciado</Badge>;
    }
  };

  const getDueDateStatus = (dueDate: string) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Badge variant="destructive">Atrasado</Badge>;
    } else if (diffDays <= 3) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Vencimento Próximo</Badge>;
    }
    return null;
  };

  const handleStartCourse = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowPlayer(true);
  };

  if (isLoading) {
    return <div>Carregando cursos...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meus Cursos</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso nos cursos de treinamento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCourses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 max-w-md"
          />
        </div>
      </div>

      {/* Course Sections */}
      {inProgressCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Cursos em Andamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.map((enrollment) => (
              <CourseCard 
                key={enrollment.id} 
                enrollment={enrollment} 
                onStart={handleStartCourse}
                getDueDateStatus={getDueDateStatus}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      )}

      {notStartedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Novos Cursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notStartedCourses.map((enrollment) => (
              <CourseCard 
                key={enrollment.id} 
                enrollment={enrollment} 
                onStart={handleStartCourse}
                getDueDateStatus={getDueDateStatus}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      )}

      {completedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Cursos Concluídos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map((enrollment) => (
              <CourseCard 
                key={enrollment.id} 
                enrollment={enrollment} 
                onStart={handleStartCourse}
                getDueDateStatus={getDueDateStatus}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      )}

      {filteredEnrollments.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Tente ajustar sua pesquisa.' : 'Você ainda não possui cursos atribuídos.'}
          </p>
        </div>
      )}

      {/* Video Player Dialog */}
      <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedEnrollment?.video_courses?.title}</DialogTitle>
          </DialogHeader>
          {selectedEnrollment && (
            <VideoLessonPlayer 
              enrollment={selectedEnrollment}
              onClose={() => setShowPlayer(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ enrollment, onStart, getDueDateStatus, getStatusBadge }: any) => {
  const course = enrollment.video_courses;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button onClick={() => onStart(enrollment)} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            {enrollment.progress_percentage > 0 ? 'Continuar' : 'Iniciar'}
          </Button>
        </div>
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          <div className="flex flex-col gap-1">
            {getStatusBadge(enrollment)}
            {getDueDateStatus(enrollment.due_date)}
          </div>
        </div>
        <CardDescription className="line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso</span>
              <span>{enrollment.progress_percentage}%</span>
            </div>
            <Progress value={enrollment.progress_percentage} className="h-2" />
          </div>

          {/* Course Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {course.video_lessons?.[0]?.count || 0} aulas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.duration_minutes}min
            </span>
            {enrollment.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(enrollment.due_date).toLocaleDateString('pt-AO')}
              </span>
            )}
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => onStart(enrollment)} 
            className="w-full gap-2"
            variant={enrollment.progress_percentage === 100 ? "outline" : "default"}
          >
            <Play className="h-4 w-4" />
            {enrollment.progress_percentage === 100 
              ? 'Revisar' 
              : enrollment.progress_percentage > 0 
                ? 'Continuar' 
                : 'Iniciar Curso'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCourses;