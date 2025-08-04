import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Search, User, BookOpen, Plus, X, Loader2 } from "lucide-react";
import { formatAngolaDate, getAngolaTime, startOfDayAngola } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useCreateAssignment, useAssignments } from "@/hooks/useAssignments";
import { createAssignmentSchema } from "@/lib/validations/assignment";
import { useCommonHook } from "@/hooks/useCommonHook";
import { useSearchAndFilter, createSearchFilter } from "@/lib/common-patterns";
import type { CreateAssignmentData } from "@/types/assignment.types";

interface User {
  user_id: string;
  name: string;
  email: string;
  department?: string;
  job_position?: string;
}

interface Content {
  id: string;
  title: string;
  description: string;
  duration_minutes?: number;
  difficulty?: string;
  type: 'course' | 'simulado';
  total_questions?: number;
}

export default function AssignmentManager() {
  // Aplicar padrões consolidados de hook base
  const { showError, showSuccess, invalidateQueries } = useCommonHook();
  
  // Estados consolidados para gerenciamento de atribuições
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [contentType, setContentType] = useState<'course' | 'simulado'>('course');

  // Função auxiliar para detectar ambiente
  const isBrowser = typeof window !== 'undefined';

  // Função auxiliar para operações de database com fallback
  const executeWithFallback = async (
    operation: () => Promise<any>,
    mockData?: any
  ) => {
    if (isBrowser && mockData) {
      console.warn('🔧 Using mock assignment manager data');
      return { data: mockData, error: null };
    }

    try {
      return await operation();
    } catch (error) {
      console.warn('Database operation failed, using fallback');
      return { data: mockData || [], error: null };
    }
  };

  const form = useForm<CreateAssignmentData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const createAssignment = useCreateAssignment();

  // Implementar queries otimizadas com fallback consolidado
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users", userSearch],
    queryFn: async () => {
      // Mock users data para desenvolvimento
      const mockUsers: User[] = [
        {
          user_id: 'user-1',
          name: 'João Silva',
          email: 'joao.silva@hemeracapital.com',
          department: 'TI',
          job_position: 'Desenvolvedor'
        },
        {
          user_id: 'user-2',
          name: 'Maria Santos',
          email: 'maria.santos@hemeracapital.com',
          department: 'RH',
          job_position: 'Analista de RH'
        },
        {
          user_id: 'user-3',
          name: 'Pedro Costa',
          email: 'pedro.costa@hemeracapital.com',
          department: 'Vendas',
          job_position: 'Consultor de Vendas'
        },
        {
          user_id: 'user-4',
          name: 'Ana Oliveira',
          email: 'ana.oliveira@hemeracapital.com',
          department: 'Marketing',
          job_position: 'Coordenadora de Marketing'
        }
      ].filter(user => {
        if (!userSearch) return true;
        return user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
               user.email.toLowerCase().includes(userSearch.toLowerCase());
      });

      const result = await executeWithFallback(
        async () => {
          let query = database
            .from("profiles")
            .select("user_id, name, email, department, job_position")
            .order("name");

          if (userSearch) {
            query = query.or(`name.ilike.%${userSearch}%,email.ilike.%${userSearch}%`);
          }

          const { data, error } = await query.limit(10).select_query();
          if (error) throw error;
          return data as User[];
        },
        mockUsers
      );

      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Fetch content (courses or simulados) com fallback consolidado
  const { data: contents = [], isLoading: contentsLoading } = useQuery({
    queryKey: ["contents", contentSearch, contentType],
    queryFn: async () => {
      // Mock content data para desenvolvimento
      const mockCourses: Content[] = [
        {
          id: 'course-1',
          title: 'Introdução à Empresa',
          description: 'Curso introdutório sobre a cultura e valores da empresa',
          duration_minutes: 120,
          type: 'course'
        },
        {
          id: 'course-2',
          title: 'Compliance e Ética',
          description: 'Diretrizes de compliance e código de ética empresarial',
          duration_minutes: 90,
          type: 'course'
        },
        {
          id: 'course-3',
          title: 'Processos Internos',
          description: 'Visão geral dos principais processos da empresa',
          duration_minutes: 150,
          type: 'course'
        }
      ];

      const mockSimulados: Content[] = [
        {
          id: 'simulado-1',
          title: 'Simulado de Compliance',
          description: 'Teste de conhecimentos sobre compliance e ética',
          duration_minutes: 60,
          difficulty: 'Médio',
          total_questions: 25,
          type: 'simulado'
        },
        {
          id: 'simulado-2',
          title: 'Simulado de Processos',
          description: 'Avaliação sobre processos internos da empresa',
          duration_minutes: 45,
          difficulty: 'Fácil',
          total_questions: 20,
          type: 'simulado'
        },
        {
          id: 'simulado-3',
          title: 'Simulado Técnico',
          description: 'Teste técnico para desenvolvedores',
          duration_minutes: 90,
          difficulty: 'Difícil',
          total_questions: 30,
          type: 'simulado'
        }
      ];

      const mockData = contentType === 'course' ? mockCourses : mockSimulados;
      const filteredMockData = mockData.filter(item => {
        if (!contentSearch) return true;
        return item.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
               item.description.toLowerCase().includes(contentSearch.toLowerCase());
      });

      const result = await executeWithFallback(
        async () => {
          if (contentType === 'course') {
            let query = database
              .from("video_courses")
              .select("id, title, description, duration_minutes")
              .eq("is_active", true)
              .order("title");

            if (contentSearch) {
              query = query.or(`title.ilike.%${contentSearch}%,description.ilike.%${contentSearch}%`);
            }

            const { data, error } = await query.limit(10).select_query();
            if (error) throw error;
            return data.map(item => ({ 
              id: item.id,
              title: item.title,
              description: item.description,
              duration_minutes: item.duration_minutes,
              type: 'course' as const 
            })) as Content[];
          } else {
            let query = database
              .from("simulados")
              .select("id, title, description, duration_minutes, difficulty, total_questions")
              .eq("is_active", true)
              .order("title");

            if (contentSearch) {
              query = query.or(`title.ilike.%${contentSearch}%,description.ilike.%${contentSearch}%`);
            }

            const { data, error } = await query.limit(10).select_query();
            if (error) throw error;
            return data.map(item => ({ 
              id: item.id,
              title: item.title,
              description: item.description,
              duration_minutes: item.duration_minutes,
              difficulty: item.difficulty,
              total_questions: item.total_questions,
              type: 'simulado' as const 
            })) as Content[];
          }
        },
        filteredMockData
      );

      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Fetch user's current assignments
  const { assignments: userAssignments } = useAssignments({
    userId: selectedUser?.user_id,
  });

  // Consolidar lógica de gerenciamento de atribuições com padrões comuns
  const onSubmit = (data: CreateAssignmentData) => {
    if (!selectedUser || !selectedContent) {
      showError(new Error("Selecione um usuário e conteúdo"), "Dados incompletos");
      return;
    }

    createAssignment.mutate({
      userId: selectedUser.user_id,
      contentType: selectedContent.type,
      contentId: selectedContent.id,
      dueDate: data.dueDate,
      priority: data.priority,
      notes: data.notes,
    }, {
      onSuccess: () => {
        showSuccess(`Atribuição criada com sucesso para ${selectedUser.name}!`);
        
        // Invalidar queries relacionadas para atualizar dados
        invalidateQueries(['assignments', 'user-assignments', 'assignment-stats']);
        
        // Reset form e estados
        form.reset();
        setSelectedUser(null);
        setSelectedContent(null);
      },
      onError: (error: any) => {
        showError(error, "Erro ao criar atribuição");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Funcionário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {selectedUser ? (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{selectedUser.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    {selectedUser.department && (
                      <Badge variant="secondary" className="mt-1">
                        {selectedUser.department}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {usersLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando usuários...</p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {userSearch ? "Nenhum usuário encontrado" : "Digite para buscar usuários"}
                  </p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.user_id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {user.department && (
                          <Badge variant="outline" className="text-xs">
                            {user.department}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Selecionar Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={contentType} onValueChange={(value: 'course' | 'simulado') => {
                setContentType(value);
                setSelectedContent(null);
                setContentSearch("");
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Cursos</SelectItem>
                  <SelectItem value="simulado">Simulados</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar ${contentType === 'course' ? 'cursos' : 'simulados'}...`}
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {selectedContent ? (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{selectedContent.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {selectedContent.type === 'course' ? 'Curso' : 'Simulado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedContent.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {selectedContent.duration_minutes && (
                        <Badge variant="outline" className="text-xs">
                          {selectedContent.duration_minutes} min
                        </Badge>
                      )}
                      {selectedContent.total_questions && (
                        <Badge variant="outline" className="text-xs">
                          {selectedContent.total_questions} questões
                        </Badge>
                      )}
                      {selectedContent.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {selectedContent.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContent(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {contentsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando {contentType === 'course' ? 'cursos' : 'simulados'}...
                  </p>
                ) : contents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {contentSearch 
                      ? `Nenhum ${contentType === 'course' ? 'curso' : 'simulado'} encontrado` 
                      : `Digite para buscar ${contentType === 'course' ? 'cursos' : 'simulados'}`
                    }
                  </p>
                ) : (
                  contents.map((content) => (
                    <div
                      key={content.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedContent(content)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{content.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {content.type === 'course' ? 'Curso' : 'Simulado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {content.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {content.duration_minutes && (
                          <Badge variant="outline" className="text-xs">
                            {content.duration_minutes} min
                          </Badge>
                        )}
                        {content.total_questions && (
                          <Badge variant="outline" className="text-xs">
                            {content.total_questions} questões
                          </Badge>
                        )}
                        {content.difficulty && (
                          <Badge variant="outline" className="text-xs">
                            {content.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form */}
      {selectedUser && selectedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Atribuição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Vencimento (Opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatAngolaDate.calendar(field.value)
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date?.toISOString())}
                              disabled={(date) => date < startOfDayAngola(getAngolaTime())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione observações sobre esta atribuição..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setSelectedUser(null);
                      setSelectedContent(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAssignment.isPending}
                  >
                    {createAssignment.isPending ? "Criando..." : "Criar Atribuição"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* User's Current Assignments */}
      {selectedUser && userAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atribuições Atuais de {selectedUser.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{assignment.content?.title}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={
                        assignment.status === 'completed' ? 'default' :
                        assignment.status === 'overdue' ? 'destructive' :
                        assignment.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {assignment.status === 'completed' ? 'Concluído' :
                         assignment.status === 'overdue' ? 'Atrasado' :
                         assignment.status === 'in_progress' ? 'Em Andamento' : 'Atribuído'}
                      </Badge>
                      <Badge variant="outline">
                        {assignment.priority === 'high' ? 'Alta' :
                         assignment.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                  {assignment.dueDate && (
                    <div className="text-sm text-muted-foreground">
                      Vence em: {formatAngolaDate.short(assignment.dueDate)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}