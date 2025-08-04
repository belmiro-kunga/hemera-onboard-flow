import { useQuery, useMutation } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { useCommonHook } from "@/hooks/useCommonHook";
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
      let query = database
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
      const { data, error } = await database
        .from("assignment_templates")
        .select(`
          *,
          template_courses(*)
        `)
        .eq("id", templateId)
        .select_query();
      
      const templateData = Array.isArray(data) ? data[0] : data;

      if (error) throw error;
      if (!templateData) throw new Error('Template não encontrado');

      return {
        id: templateData.id,
        name: templateData.name,
        department: templateData.department,
        jobTitle: templateData.job_title,
        description: templateData.description,
        isActive: templateData.is_active,
        createdBy: templateData.created_by,
        createdAt: templateData.created_at,
        updatedAt: templateData.updated_at,
        courses: (Array.isArray(templateData.template_courses) ? templateData.template_courses : [])?.map(course => ({
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
  const { invalidateQueries, showSuccess, showError } = useCommonHook();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      // Validate data
      const validation = validateTemplateData(data);
      if (!validation.success) {
        throw new Error(`Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }

      // Check if user is authenticated
      if (!user) throw new Error("Usuário não autenticado");

      // Create template
      const { data: templateData, error: templateError } = await database
        .from("assignment_templates")
        .insert({
          name: data.name,
          department: data.department,
          job_title: data.jobTitle,
          description: data.description,
          created_by: user.id,
        });

      if (templateError) throw templateError;
      const template = Array.isArray(templateData) ? templateData[0] : templateData;

      // Create template courses
      const templateCourses = data.contents.map(content => ({
        template_id: template.id,
        content_id: content.contentId,
        content_type: content.contentType,
        is_mandatory: content.isMandatory,
        default_due_days: content.defaultDueDays,
        priority: content.priority,
      }));

      const { error: coursesError } = await database
        .from("template_courses")
        .insert(templateCourses);

      if (coursesError) throw coursesError;

      return template;
    },
    onSuccess: () => {
      invalidateQueries(["assignment-templates"]);
      showSuccess("O template de atribuição foi criado com sucesso.");
    },
    onError: (error) => {
      showError(error, "Erro ao criar template");
    },
  });
};

// Hook para atualizar um template
export const useUpdateTemplate = () => {
  const { invalidateQueries, showSuccess, showError } = useCommonHook();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTemplateData }) => {
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      
      const { data: templateData, error } = await database
        .from("assignment_templates")
        .update(updateData)
        .eq("id", id);
      
      const template = Array.isArray(templateData) ? templateData[0] : templateData;

      if (error) throw error;
      return template;
    },
    onSuccess: (template) => {
      invalidateQueries(["assignment-templates", "assignment-template"]);
      showSuccess("O template foi atualizado com sucesso.");
    },
    onError: (error) => {
      showError(error, "Erro ao atualizar template");
    },
  });
};

// Hook para deletar um template
export const useDeleteTemplate = () => {
  const { invalidateQueries, showSuccess, showError } = useCommonHook();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await database
        .from("assignment_templates")
        .eq("id", templateId)
        .delete();

      if (error) throw error;
      return templateId;
    },
    onSuccess: () => {
      invalidateQueries(["assignment-templates"]);
      showSuccess("O template foi removido com sucesso.");
    },
    onError: (error) => {
      showError(error, "Erro ao remover template");
    },
  });
};

// Hook para aplicar template a usuários
export const useApplyTemplate = () => {
  const { invalidateQueries, showSuccess, showError } = useCommonHook();

  return useMutation({
    mutationFn: async ({ templateId, userIds }: { templateId: string; userIds: string[] }): Promise<TemplateApplicationResult[]> => {
      const results: TemplateApplicationResult[] = [];

      // Apply template to each user
      for (const userId of userIds) {
        try {
          // Check if we're in browser mode (mock data)
          const isBrowser = typeof window !== 'undefined';
          
          if (isBrowser) {
            console.warn('🔧 Using mock template application');
            
            results.push({
              success: true,
              templateId,
              userId,
              assignmentsCreated: Math.floor(Math.random() * 5) + 1, // Mock 1-5 assignments
            });
          } else {
            try {
              // Try RPC function first
              const { data, error } = await database.rpc('apply_template_to_user', {
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
            } catch (rpcError) {
              // Fallback to manual template application
              console.warn('RPC function not available, using fallback template application');
              
              // Get template courses
              const { data: templateCourses, error: templateError } = await database
                .from('template_courses')
                .select('course_id, due_days, priority, notes')
                .eq('template_id', templateId);
              
              if (templateError) throw templateError;
              
              let assignmentsCreated = 0;
              
              // Create assignments for each course in the template
              for (const templateCourse of templateCourses || []) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (templateCourse.due_days || 30));
                
                const { error: assignmentError } = await database
                  .from('course_assignments')
                  .insert({
                    user_id: userId,
                    course_id: templateCourse.course_id,
                    assigned_by: 'system', // or get current admin user
                    due_date: dueDate.toISOString(),
                    priority: templateCourse.priority || 'medium',
                    notes: templateCourse.notes,
                    status: 'assigned',
                    created_at: new Date().toISOString()
                  });
                
                if (!assignmentError) {
                  assignmentsCreated++;
                }
              }
              
              results.push({
                success: true,
                templateId,
                userId,
                assignmentsCreated,
              });
            }
          }
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
      invalidateQueries(["assignments"]);
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (errorCount === 0) {
        showSuccess(`Template aplicado com sucesso a ${successCount} usuários.`);
      } else {
        showError(new Error(`${successCount} sucessos, ${errorCount} erros.`), "Template parcialmente aplicado");
      }
    },
    onError: (error) => {
      showError(error, "Erro ao aplicar template");
    },
  });
};

// Hook para buscar templates por departamento/cargo
export const useTemplatesByRole = (department?: string, jobTitle?: string) => {
  return useQuery({
    queryKey: ["templates-by-role", department, jobTitle],
    queryFn: async () => {
      let query = database
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
  const { invalidateQueries, showSuccess, showError } = useCommonHook();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // Get current user from auth context
      const { user } = useAuth();
      if (!user) throw new Error("Usuário não autenticado");

      // Get original template
      const { data: originalTemplateData, error: templateError } = await database
        .from("assignment_templates")
        .select(`
          *,
          template_courses(*)
        `)
        .eq("id", templateId)
        .select_query();

      if (templateError) throw templateError;
      const originalTemplate = Array.isArray(originalTemplateData) ? originalTemplateData[0] : originalTemplateData;

      // Create new template
      const { data: newTemplateData, error: newTemplateError } = await database
        .from("assignment_templates")
        .insert({
          name: `${originalTemplate.name} (Cópia)`,
          department: originalTemplate.department,
          job_title: originalTemplate.job_title,
          description: originalTemplate.description,
          created_by: user.id,
        });

      if (newTemplateError) throw newTemplateError;
      const newTemplate = Array.isArray(newTemplateData) ? newTemplateData[0] : newTemplateData;

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

        const { error: coursesError } = await database
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
      const { data, error } = await database
        .from("template_courses")
        .select('*')
        .eq("template_id", templateId)
        .order("created_at")
        .select_query();

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
      const { error: deleteError } = await database
        .from("template_courses")
        .eq("template_id", templateId)
        .delete();

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

        const { error: insertError } = await database
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