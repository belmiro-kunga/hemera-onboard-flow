import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, Clock, Play, Edit, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CourseWizard from '@/components/admin/CourseWizard';
import CourseAssignment from '@/components/admin/CourseAssignment';

const VideoCoursesAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCourseWizard, setShowCourseWizard] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const { toast } = useToast();

  // Fetch video courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['video-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_courses')
        .select(`
          *,
          video_lessons (count),
          course_enrollments (count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories
  const categories = ['all', ...new Set(courses.map(course => course.category).filter(Boolean))];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.is_active).length;
  const totalEnrollments = courses.reduce((sum, course) => sum + (course.course_enrollments?.[0]?.count || 0), 0);
  const totalDuration = courses.reduce((sum, course) => sum + (course.duration_minutes || 0), 0);

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('video_courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Curso excluído",
        description: "O curso foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir curso.",
        variant: "destructive",
      });
    }
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setShowCourseWizard(true);
  };

  const handleAssignCourse = (course: any) => {
    setSelectedCourse(course);
    setShowAssignment(true);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cursos de Vídeo</h1>
          <p className="text-muted-foreground">Gerencie cursos e videoaulas</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowCourseWizard(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Curso
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">{activeCourses} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Matrículas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">funcionários matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalDuration / 60)}h</div>
            <p className="text-xs text-muted-foreground">{totalDuration} minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">média geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'Todas as categorias' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
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
              {!course.is_active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary">Inativo</Badge>
                </div>
              )}
            </div>
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <Badge variant={course.is_active ? "default" : "secondary"}>
                  {course.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-3">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  {course.video_lessons?.[0]?.count || 0} aulas
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.duration_minutes}min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.course_enrollments?.[0]?.count || 0} alunos
                </span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditCourse(course)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAssignCourse(course)}
                  className="flex-1"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Atribuir
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteCourse(course.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros de pesquisa.' 
              : 'Comece criando seu primeiro curso de vídeo.'}
          </p>
          <Button onClick={() => setShowCourseWizard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Curso
          </Button>
        </div>
      )}

      {/* Course Wizard Dialog */}
      <Dialog open={showCourseWizard} onOpenChange={setShowCourseWizard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Editar Curso' : 'Criar Novo Curso'}
            </DialogTitle>
          </DialogHeader>
          <CourseWizard 
            course={selectedCourse}
            onClose={() => {
              setShowCourseWizard(false);
              setSelectedCourse(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Course Assignment Dialog */}
      <Dialog open={showAssignment} onOpenChange={setShowAssignment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Atribuir Curso: {selectedCourse?.title}
            </DialogTitle>
          </DialogHeader>
          <CourseAssignment 
            course={selectedCourse}
            onClose={() => {
              setShowAssignment(false);
              setSelectedCourse(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCoursesAdmin;