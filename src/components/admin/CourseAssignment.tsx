import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Calendar, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CourseAssignmentProps {
  course: any;
  onClose: () => void;
}

const CourseAssignment = ({ course, onClose }: CourseAssignmentProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users who are not admins
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_admin_users_with_emails')
        .neq('role', 'super_admin')
        .neq('role', 'admin');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch already enrolled users for this course
  const { data: enrolledUsers = [] } = useQuery({
    queryKey: ['course-enrollments', course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', course.id);
      
      if (error) throw error;
      return data.map(enrollment => enrollment.user_id);
    },
    enabled: !!course?.id
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const notEnrolled = !enrolledUsers.includes(user.user_id);
    return matchesSearch && notEnrolled;
  });

  const availableUsers = filteredUsers.filter(user => !enrolledUsers.includes(user.user_id));
  const alreadyEnrolledUsers = users.filter(user => enrolledUsers.includes(user.user_id));

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === availableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(availableUsers.map(user => user.user_id));
    }
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Nenhum usuário selecionado",
        description: "Selecione pelo menos um funcionário para atribuir o curso.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);

    try {
      const enrollments = selectedUsers.map(userId => ({
        user_id: userId,
        course_id: course.id,
        due_date: dueDate || null,
      }));

      const { error } = await supabase
        .from('course_enrollments')
        .insert(enrollments);

      if (error) throw error;

      // Create initial lesson progress entries for each user
      for (const userId of selectedUsers) {
        // Get lessons for this course
        const { data: lessons, error: lessonsError } = await supabase
          .from('video_lessons')
          .select('id')
          .eq('course_id', course.id)
          .order('order_number');

        if (lessonsError) throw lessonsError;

        if (lessons.length > 0) {
          // Get the enrollment ID
          const { data: enrollment, error: enrollmentError } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', course.id)
            .single();

          if (enrollmentError) throw enrollmentError;

          // Create progress entries
          const progressEntries = lessons.map(lesson => ({
            user_id: userId,
            lesson_id: lesson.id,
            enrollment_id: enrollment.id,
          }));

          const { error: progressError } = await supabase
            .from('lesson_progress')
            .insert(progressEntries);

          if (progressError) throw progressError;
        }
      }

      toast({
        title: "Curso atribuído com sucesso",
        description: `O curso foi atribuído para ${selectedUsers.length} funcionário(s).`,
      });

      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atribuir curso.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{course.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span>Duração: {course.duration_minutes} min</span>
            <Badge variant="outline">{course.category}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Settings */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="due-date">Data de Conclusão (opcional)</Label>
          <Input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* User Search */}
      <div>
        <Label htmlFor="search">Buscar Funcionários</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Available Users */}
      {availableUsers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Funcionários Disponíveis ({availableUsers.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedUsers.length === availableUsers.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div key={user.user_id} className="flex items-center space-x-3 p-2 rounded border">
                  <Checkbox
                    checked={selectedUsers.includes(user.user_id)}
                    onCheckedChange={(checked) => handleUserSelect(user.user_id, checked as boolean)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Enrolled Users */}
      {alreadyEnrolledUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Já Matriculados ({alreadyEnrolledUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alreadyEnrolledUsers.map((user) => (
                <div key={user.user_id} className="flex items-center space-x-3 p-2 rounded border bg-muted/50">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">Matriculado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {availableUsers.length === 0 && alreadyEnrolledUsers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum funcionário encontrado.' : 'Todos os funcionários já estão matriculados neste curso.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        
        <Button 
          onClick={handleAssign} 
          disabled={selectedUsers.length === 0 || isAssigning}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {isAssigning ? 'Atribuindo...' : `Atribuir para ${selectedUsers.length} funcionário(s)`}
        </Button>
      </div>
    </div>
  );
};

export default CourseAssignment;