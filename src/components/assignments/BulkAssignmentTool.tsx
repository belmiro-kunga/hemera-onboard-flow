import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  Search, 
  Users, 
  BookOpen, 
  Upload, 
  Download,
  Building,
  UserCheck,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import CSVImportTool from "./CSVImportTool";
import { formatAngolaDate, getAngolaTime, startOfDayAngola } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useBulkAssignments } from "@/hooks/useAssignments";
import { bulkAssignmentSchema } from "@/lib/validations/assignment";
import type { BulkAssignmentData, ContentType } from "@/types/assignment.types";

interface User {
  user_id: string;
  name: string;
  email: string;
  department?: string;
  job_position?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration_minutes?: number;
  difficulty?: string;
}

export default function BulkAssignmentTool() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [bulkMode, setBulkMode] = useState<"individual" | "department" | "csv">("individual");

  const form = useForm<BulkAssignmentData>({
    resolver: zodResolver(bulkAssignmentSchema),
    defaultValues: {
      priority: "medium",
      userIds: [],
    },
  });

  const bulkAssignments = useBulkAssignments();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users", userSearch, selectedDepartment],
    queryFn: async () => {
      let query = database
        .from("profiles")
        .select("user_id, name, email, department, job_position")
        .order("name");

      if (userSearch) {
        query = query.or(`name.ilike.%${userSearch}%,email.ilike.%${userSearch}%`);
      }

      if (selectedDepartment) {
        query = query.eq("department", selectedDepartment);
      }

      const { data, error } = await query.limit(50).select_query();
      if (error) throw error;
      return data as User[];
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await database
        .from("profiles")
        .select("department")
        .not("department", "is", null)
        .order("department")
        .select_query();

      if (error) throw error;
      
      // Get unique departments
      const uniqueDepartments = [...new Set(data.map(d => d.department))];
      return uniqueDepartments.filter(Boolean) as string[];
    },
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", courseSearch],
    queryFn: async () => {
      let query = database
        .from("video_courses")
        .select("id, title, description, duration_minutes")
        .eq("is_active", true)
        .order("title");

      if (courseSearch) {
        query = query.or(`title.ilike.%${courseSearch}%,description.ilike.%${courseSearch}%`);
      }

      const { data, error } = await query.limit(20).select_query();
      if (error) throw error;
      return (data || []) as Course[];
    },
  });

  const handleUserToggle = (user: User, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, user]);
    } else {
      setSelectedUsers(prev => prev.filter(u => u.user_id !== user.user_id));
    }
  };

  const handleSelectAllDepartment = () => {
    if (selectedDepartment) {
      const departmentUsers = users.filter(u => u.department === selectedDepartment);
      setSelectedUsers(departmentUsers);
    }
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const onSubmit = (data: BulkAssignmentData) => {
    if (!selectedCourse || selectedUsers.length === 0) return;

    bulkAssignments.mutate({
      ...data,
      userIds: selectedUsers.map(u => u.user_id),
      contentType: 'course' as ContentType,
      contentId: selectedCourse.id,
    }, {
      onSuccess: () => {
        form.reset();
        setSelectedUsers([]);
        setSelectedCourse(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={bulkMode} onValueChange={(value) => setBulkMode(value as "individual" | "department" | "csv")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Seleção Individual
          </TabsTrigger>
          <TabsTrigger value="department" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Por Departamento
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Importação CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Selecionar Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar funcionários por nome ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.length} funcionário(s) selecionado(s)
                </p>
                {selectedUsers.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearSelection}>
                    Limpar Seleção
                  </Button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {usersLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando funcionários...</p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {userSearch ? "Nenhum funcionário encontrado" : "Digite para buscar funcionários"}
                  </p>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedUsers.some(u => u.user_id === user.user_id);
                    return (
                      <div
                        key={user.user_id}
                        className="flex items-center space-x-3 p-3 border rounded-lg"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleUserToggle(user, checked as boolean)}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {user.department && (
                          <Badge variant="outline" className="text-xs">
                            {user.department}
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Selecionar por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedDepartment && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {users.filter(u => u.department === selectedDepartment).length} funcionário(s) no departamento
                    </p>
                    <Button variant="outline" size="sm" onClick={handleSelectAllDepartment}>
                      Selecionar Todos
                    </Button>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {users
                      .filter(u => u.department === selectedDepartment)
                      .map((user) => {
                        const isSelected = selectedUsers.some(u => u.user_id === user.user_id);
                        return (
                          <div
                            key={user.user_id}
                            className="flex items-center space-x-3 p-2 border rounded"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleUserToggle(user, checked as boolean)}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{user.name}</h4>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Importação via CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CSVImportTool 
                onImportComplete={(result) => {
                  // Handle import completion
                  console.log('Import completed:', result);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Selecionar Curso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {selectedCourse ? (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{selectedCourse.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedCourse.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {selectedCourse.duration_minutes && (
                      <Badge variant="outline" className="text-xs">
                        {selectedCourse.duration_minutes} min
                      </Badge>
                    )}
                    {selectedCourse.difficulty && (
                      <Badge variant="outline" className="text-xs">
                        {selectedCourse.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourse(null)}
                >
                  Alterar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {coursesLoading ? (
                <p className="text-sm text-muted-foreground">Carregando cursos...</p>
              ) : courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {courseSearch ? "Nenhum curso encontrado" : "Digite para buscar cursos"}
                </p>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <h4 className="font-medium">{course.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {course.duration_minutes && (
                        <Badge variant="outline" className="text-xs">
                          {course.duration_minutes} min
                        </Badge>
                      )}
                      {course.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {course.difficulty}
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

      {/* Assignment Configuration */}
      {selectedUsers.length > 0 && selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Configurar Atribuição em Massa
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
                          placeholder="Adicione observações sobre esta atribuição em massa..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preview */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Resumo da Atribuição
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Curso:</strong> {selectedCourse.title}</p>
                    <p><strong>Funcionários:</strong> {selectedUsers.length} selecionados</p>
                    <p><strong>Prioridade:</strong> {
                      form.watch("priority") === "high" ? "Alta" :
                      form.watch("priority") === "medium" ? "Média" : "Baixa"
                    }</p>
                    {form.watch("dueDate") && (
                      <p><strong>Vencimento:</strong> {formatAngolaDate.short(form.watch("dueDate")!)}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setSelectedUsers([]);
                      setSelectedCourse(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={bulkAssignments.isPending}
                  >
                    {bulkAssignments.isPending ? "Processando..." : `Atribuir a ${selectedUsers.length} Funcionários`}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}