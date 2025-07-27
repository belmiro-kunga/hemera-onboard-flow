import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { 
  AssignmentTemplate, 
  TemplateCourse,
  CreateTemplateData, 
  UpdateTemplateData,
  TemplateFilters,
  TemplateListResponse,
  TemplateApplicationResult,
  UseAssignmentTemplatesReturn
} from "@/types/assignment.types";
import { validateTemplateData } from "@/lib/validations/assignment";

// Hook para buscar templates com filtros
export const useAssignmentTemplates = (filters?: TemplateFilters): UseAssignmentTemplatesReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["assignment-templates", filters],
    queryFn: async () => {
      let query = supabase
        .from("assignment_templates")
        .select(`
          *,
          createdByUser:profiles!assignment_templates_created_by_fkey(
            user_id,
            name,
            email
          ),
          courses:template_courses(
            *,
            course:video_courses!template_courses_course_id_fkey(
              id,
              title,
              description,
              duration_minutes,
              difficulty
            )
          )
        `);

      // Apply filters
      if (filters?.department) {
        query = query.eq("department", filters.department);
      }
      
      if (filters?.jobTitle) {
        query = query.eq("job_title", filters.jobTitle);
      }
      
      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        templates: data as AssignmentTemplate[],
        total: count || 0,
        page,
        limit
      } as TemplateListResponse;
    },
  });

  return {
    templates: data?.templates || [],
    loading: isLoading,
    error: error?.message || null,
    total: data?.total || 0,
    refetch,
  };
};

// Hook para buscar um template específico
export const useAssignmentTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ["assignment-template", templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignment_templates")
        .select(`
          *,
          createdByUser:profiles!assignment_templates_created_by_fkey(
            user_id,
            name,
            email
          ),
          courses:template_courses(
            *,
            course:video_courses!template_courses_course_id_fkey(
              id,
              title,
              description,
              duration_minutes,
              difficulty
            )
          )
        `)
        .eq("id", templateId)
        .single();

      if (error) throw error;
      return data as AssignmentTemplate;
    },
    enabled: !!templateId,
  });
};

// Hook para criar um novo template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      // Validate data
      const validation = validateTemplateData(data);
      if (!validation.success) {
        throw new Error(`Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      // Create template
      const { data: template, error: templateError } = await supabase
        .from("assignment_templates")
        .insert({
          name: data.name,
          department: data.department,
          job_title: data.jobTitle,
          description: data.description,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Create template courses
      const templateCourses = data.courses.map(course => ({
        template_id: template.id,
        course_id: course.courseId,
        is_mandatory: course.isMandatory,
        default_due_days: course.defaultDueDays,
        priority: course.priority,
      }));

      const { error: coursesError } = await supabase
        .from("template_courses")
        .insert(templateCourses);

      if (coursesError) throw coursesError;

      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-templates"] });
      toast({
        title: "Template criado",
        description: "O template de atribuição foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar um template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTemplateData }) => {
      const { data: template, error } = await supabase
        .from("assignment_templates")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ["assignment-templates"] });
      queryClient.invalidateQueries({ queryKey: ["assignment-template", template.id] });
      toast({
        title: "Template atualizado",
        description: "O template foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para deletar um template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("assignment_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-templates"] });
      toast({
        title: "Template removido",
        description: "O template foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para aplicar template a usuários
export const useApplyTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ templateId, userIds }: { templateId: string; userIds: string[] }): Promise<TemplateApplicationResult[]> => {
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const results: TemplateApplicationResult[] = [];

      // Apply template to each user
      for (const userId of userIds) {
        try {
          const { data, error } = await supabase.rpc('apply_template_to_user', {
            p_template_id: templateId,
            p_user_id: userId,
            p_assigned_by: user.user.id,
          });

          if (error) throw error;

          results.push({
            success: true,
            templateId,
            userId,
            assignmentsCreated: data || 0,
          });

        } catch (error) {
          results.push({
            success: false,
            templateId,
            userId,
            assignmentsCreated: 0,
            errors: [error instanceof Error ? error.message : "Erro desconhecido"],
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (errorCount === 0) {
        toast({
          title: "Template aplicado",
          description: `Template aplicado com sucesso a ${successCount} usuários.`,
        });
      } else {
        toast({
          title: "Template parcialmente aplicado",
          description: `${successCount} sucessos, ${errorCount} erros.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao aplicar template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para buscar estatísticas de uso do template
export const useTemplateUsage = (templateId: string) => {
  return useQuery({
    queryKey: ["template-usage", templateId],
    queryFn: async () => {
      // Get template courses count
      const { data: templateCourses, error: coursesError } = await supabase
        .from("template_courses")
        .select("id")
        .eq("template_id", templateId);

      if (coursesError) throw coursesError;

      // Get assignments created from this template (approximation)
      const { data: assignments, error: assignmentsError } = await supabase
        .from("course_assignments")
        .select("id, user_id")
        .in("course_id", templateCourses?.map(tc => tc.id) || [])
        .eq("notes", "Atribuído automaticamente via template");

      if (assignmentsError) throw assignmentsError;

      // Get unique users affected
      const uniqueUsers = new Set(assignments?.map(a => a.user_id) || []);

      return {
        courseCount: templateCourses?.length || 0,
        assignmentCount: assignments?.length || 0,
        userCount: uniqueUsers.size,
      };
    },
    enabled: !!templateId,
  });
};

// Hook para buscar templates por departamento/cargo
export const useTemplatesByRole = (department?: string, jobTitle?: string) => {
  return useQuery({
    queryKey: ["templates-by-role", department, jobTitle],
    queryFn: async () => {
      let query = supabase
        .from("assignment_templates")
        .select(`
          *,
          courses:template_courses(
            *,
            course:video_courses!template_courses_course_id_fkey(
              id,
              title,
              description
            )
          )
        `)
        .eq("is_active", true);

      if (department) {
        query = query.or(`department.eq.${department},department.is.null`);
      }

      if (jobTitle) {
        query = query.or(`job_title.eq.${jobTitle},job_title.is.null`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as AssignmentTemplate[];
    },
    enabled: !!(department || jobTitle),
  });
};

// Hook para duplicar um template
export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      // Get original template
      const { data: originalTemplate, error: templateError } = await supabase
        .from("assignment_templates")
        .select(`
          *,
          courses:template_courses(*)
        `)
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // Create new template
      const { data: newTemplate, error: newTemplateError } = await supabase
        .from("assignment_templates")
        .insert({
          name: `${originalTemplate.name} (Cópia)`,
          department: originalTemplate.department,
          job_title: originalTemplate.job_title,
          description: originalTemplate.description,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (newTemplateError) throw newTemplateError;

      // Copy template courses
      if (originalTemplate.courses && originalTemplate.courses.length > 0) {
        const templateCourses = originalTemplate.courses.map((course: any) => ({
          template_id: newTemplate.id,
          course_id: course.course_id,
          is_mandatory: course.is_mandatory,
          default_due_days: course.default_due_days,
          priority: course.priority,
        }));

        const { error: coursesError } = await supabase
          .from("template_courses")
          .insert(templateCourses);

        if (coursesError) throw coursesError;
      }

      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-templates"] });
      toast({
        title: "Template duplicado",
        description: "O template foi duplicado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao duplicar template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para buscar cursos de um template
export const useTemplateCourses = (templateId: string) => {
  return useQuery({
    queryKey: ["template-courses", templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_courses")
        .select(`
          *,
          course:video_courses!template_courses_course_id_fkey(
            id,
            title,
            description,
            duration_minutes,
            difficulty,
            is_active
          )
        `)
        .eq("template_id", templateId)
        .order("created_at");

      if (error) throw error;
      return data as TemplateCourse[];
    },
    enabled: !!templateId,
  });
};

// Hook para atualizar cursos de um template
export const useUpdateTemplateCourses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ templateId, courses }: { templateId: string; courses: Omit<TemplateCourse, 'id' | 'templateId' | 'createdAt'>[] }) => {
      // Delete existing courses
      const { error: deleteError } = await supabase
        .from("template_courses")
        .delete()
        .eq("template_id", templateId);

      if (deleteError) throw deleteError;

      // Insert new courses
      if (courses.length > 0) {
        const templateCourses = courses.map(course => ({
          template_id: templateId,
          course_id: course.courseId,
          is_mandatory: course.isMandatory,
          default_due_days: course.defaultDueDays,
          priority: course.priority,
        }));

        const { error: insertError } = await supabase
          .from("template_courses")
          .insert(templateCourses);

        if (insertError) throw insertError;
      }

      return templateId;
    },
    onSuccess: (templateId) => {
      queryClient.invalidateQueries({ queryKey: ["assignment-templates"] });
      queryClient.invalidateQueries({ queryKey: ["assignment-template", templateId] });
      queryClient.invalidateQueries({ queryKey: ["template-courses", templateId] });
      toast({
        title: "Cursos do template atualizados",
        description: "Os cursos do template foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cursos do template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};