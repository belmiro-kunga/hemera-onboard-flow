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
  UseAssignmentTemplatesReturn,
  ContentType,
  AssignmentPriority
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
          template_courses(*)
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
      
      const templates = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        department: template.department,
        jobTitle: template.job_title,
        description: template.description,
        isActive: template.is_active,
        createdBy: template.created_by,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        courses: (Array.isArray(template.template_courses) ? template.template_courses : [])?.map(course => ({
          id: course.id,
          templateId: course.template_id,
          contentType: course.content_type as ContentType,
          contentId: course.content_id,
          isMandatory: course.is_mandatory,
          defaultDueDays: course.default_due_days,
          priority: course.priority as AssignmentPriority,
          createdAt: course.created_at
        })) || []
      })) as AssignmentTemplate[];
      
      return {
        templates,
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
          template_courses(*)
        `)
        .eq("id", templateId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Template não encontrado');

      return {
        id: data.id,
        name: data.name,
        department: data.department,
        jobTitle: data.job_title,
        description: data.description,
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        courses: (Array.isArray(data.template_courses) ? data.template_courses : [])?.map(course => ({
          id: course.id,
          templateId: course.template_id,
          contentType: course.content_type as ContentType,
          contentId: course.content_id,
          isMandatory: course.is_mandatory,
          defaultDueDays: course.default_due_days,
          priority: course.priority as AssignmentPriority,
          createdAt: course.created_at
        })) || []
      } as AssignmentTemplate;
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
      const templateCourses = data.contents.map(content => ({
        template_id: template.id,
        content_id: content.contentId,
        content_type: content.contentType,
        is_mandatory: content.isMandatory,
        default_due_days: content.defaultDueDays,
        priority: content.priority,
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
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      
      const { data: template, error } = await supabase
        .from("assignment_templates")
        .update(updateData)
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
      const results: TemplateApplicationResult[] = [];

      // Apply template to each user
      for (const userId of userIds) {
        try {
          const { data, error } = await supabase.rpc('apply_template_to_user', {
            p_template_id: templateId,
            p_user_id: userId
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

// Hook para buscar templates por departamento/cargo
export const useTemplatesByRole = (department?: string, jobTitle?: string) => {
  return useQuery({
    queryKey: ["templates-by-role", department, jobTitle],
    queryFn: async () => {
      let query = supabase
        .from("assignment_templates")
        .select(`
          *,
          template_courses(*)
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
      
      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        department: template.department,
        jobTitle: template.job_title,
        description: template.description,
        isActive: template.is_active,
        createdBy: template.created_by,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
        courses: (Array.isArray(template.template_courses) ? template.template_courses : [])?.map(course => ({
          id: course.id,
          templateId: course.template_id,
          contentType: course.content_type as ContentType,
          contentId: course.content_id,
          isMandatory: course.is_mandatory,
          defaultDueDays: course.default_due_days,
          priority: course.priority as AssignmentPriority,
          createdAt: course.created_at
        })) || []
      })) as AssignmentTemplate[];
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
          template_courses(*)
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
      if (Array.isArray(originalTemplate.template_courses) && originalTemplate.template_courses.length > 0) {
        const templateCourses = originalTemplate.template_courses.map((course: any) => ({
          template_id: newTemplate.id,
          content_id: course.content_id,
          content_type: course.content_type,
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
        .select('*')
        .eq("template_id", templateId)
        .order("created_at");

      if (error) throw error;

      return (data || []).map(course => ({
        id: course.id,
        templateId: course.template_id,
        contentType: course.content_type as ContentType,
        contentId: course.content_id,
        isMandatory: course.is_mandatory,
        defaultDueDays: course.default_due_days,
        priority: course.priority as AssignmentPriority,
        createdAt: course.created_at
      })) as TemplateCourse[];
    },
    enabled: !!templateId,
  });
};

// Hook para atualizar cursos de um template
export const useUpdateTemplateCourses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      courses 
    }: { 
      templateId: string; 
      courses: Omit<TemplateCourse, "id" | "createdAt" | "templateId">[] 
    }) => {
      // Delete existing courses
      const { error: deleteError } = await supabase
        .from("template_courses")
        .delete()
        .eq("template_id", templateId);

      if (deleteError) throw deleteError;

      // Insert new courses
      if (courses.length > 0) {
        const coursesToInsert = courses.map(course => ({
          template_id: templateId,
          content_id: course.contentId,
          content_type: course.contentType,
          is_mandatory: course.isMandatory,
          default_due_days: course.defaultDueDays,
          priority: course.priority
        }));

        const { error: insertError } = await supabase
          .from("template_courses")
          .insert(coursesToInsert);

        if (insertError) throw insertError;
      }

      return { templateId, coursesCount: courses.length };
    },
    onSuccess: ({ templateId }) => {
      queryClient.invalidateQueries({ queryKey: ["template-courses", templateId] });
      queryClient.invalidateQueries({ queryKey: ["assignment-template", templateId] });
      queryClient.invalidateQueries({ queryKey: ["assignment-templates"] });
      toast({
        title: "Cursos atualizados",
        description: "Os cursos do template foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cursos",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};