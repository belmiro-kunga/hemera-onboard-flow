import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCommonHook } from "@/hooks/useCommonHook";
import type { 
  CourseAssignment, 
  CreateAssignmentData, 
  UpdateAssignmentData, 
  BulkAssignmentData,
  AssignmentFilters,
  BulkOperationResult,
  AssignmentListResponse,
  UseAssignmentsReturn,
  ContentType,
  AssignmentPriority,
  AssignmentStatus
} from "@/types/assignment.types";
import { validateAssignmentData, validateBulkAssignmentData } from "@/lib/validations/assignment";

// Hook para buscar atribuições com filtros
export const useAssignments = (filters?: AssignmentFilters): UseAssignmentsReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["assignments", filters],
    queryFn: async () => {
      let query = supabase
        .from("course_assignments")
        .select('*');

      // Apply filters
      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      
      if (filters?.courseId) {
        query = query.eq("content_id", filters.courseId);
      }
      
      if (filters?.assignedBy) {
        query = query.eq("assigned_by", filters.assignedBy);
      }
      
      if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }
      
      if (filters?.priority && filters.priority.length > 0) {
        query = query.in("priority", filters.priority);
      }
      
      if (filters?.dueDateFrom) {
        query = query.gte("due_date", filters.dueDateFrom);
      }
      
      if (filters?.dueDateTo) {
        query = query.lte("due_date", filters.dueDateTo);
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'assigned_at';
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
      
      const assignments = (data || []).map(assignment => ({
        id: assignment.id,
        userId: assignment.user_id,
        contentType: assignment.content_type as ContentType,
        contentId: assignment.content_id,
        assignedBy: assignment.assigned_by,
        assignedAt: assignment.assigned_at,
        dueDate: assignment.due_date,
        priority: assignment.priority as AssignmentPriority,
        status: assignment.status as AssignmentStatus,
        completedAt: assignment.completed_at,
        notes: assignment.notes,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at
      })) as CourseAssignment[];
      
      return {
        assignments,
        total: count || 0,
        page,
        limit
      } as AssignmentListResponse;
    },
  });

  return {
    assignments: data?.assignments || [],
    loading: isLoading,
    error: error?.message || null,
    total: data?.total || 0,
    hasMore: data ? (data.page * data.limit) < data.total : false,
    refetch,
    loadMore: () => {
      // This would be implemented for infinite scroll
      // For now, just refetch
      refetch();
    }
  };
};

// Hook para buscar uma atribuição específica
export const useAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_assignments")
        .select('*')
        .eq("id", assignmentId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Assignment não encontrado');

      return {
        id: data.id,
        userId: data.user_id,
        contentType: data.content_type as ContentType,
        contentId: data.content_id,
        assignedBy: data.assigned_by,
        assignedAt: data.assigned_at,
        dueDate: data.due_date,
        priority: data.priority as AssignmentPriority,
        status: data.status as AssignmentStatus,
        completedAt: data.completed_at,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as CourseAssignment;
    },
    enabled: !!assignmentId,
  });
};

// Hook para criar uma nova atribuição
export const useCreateAssignment = () => {
  const { invalidateQueries, showError, showSuccess } = useCommonHook();

  return useMutation({
    mutationFn: async (data: CreateAssignmentData) => {
      // Validate data
      const validation = validateAssignmentData(data);
      if (!validation.success) {
        throw new Error(`Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      // Create assignment
      const { data: assignment, error } = await supabase
        .from("course_assignments")
        .insert({
          user_id: data.userId,
          content_type: data.contentType,
          content_id: data.contentId,
          assigned_by: user.user.id,
          due_date: data.dueDate,
          priority: data.priority,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabase
        .from("assignment_notifications")
        .insert({
          assignment_id: assignment.id,
          notification_type: "assignment_created",
        });

      return assignment;
    },
    onSuccess: (assignment) => {
      invalidateQueries(["assignments", `user-assignments-${assignment.user_id}`]);
      showSuccess("O curso foi atribuído com sucesso ao usuário.");
    },
    onError: (error) => {
      showError(error, "Erro ao criar atribuição");
    },
  });
};

// Hook para atualizar uma atribuição
export const useUpdateAssignment = () => {
  const { invalidateQueries, showError, showSuccess } = useCommonHook();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssignmentData }) => {
      const updateData: any = {};
      
      if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;
      
      const { data: assignment, error } = await supabase
        .from("course_assignments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return assignment;
    },
    onSuccess: (assignment) => {
      invalidateQueries(["assignments", `assignment-${assignment.id}`, `user-assignments-${assignment.user_id}`]);
      showSuccess("A atribuição foi atualizada com sucesso.");
    },
    onError: (error) => {
      showError(error, "Erro ao atualizar atribuição");
    },
  });
};

// Hook para deletar uma atribuição
export const useDeleteAssignment = () => {
  const { invalidateQueries, showError, showSuccess } = useCommonHook();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("course_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
      return assignmentId;
    },
    onSuccess: () => {
      invalidateQueries(["assignments"]);
      showSuccess("A atribuição foi removida com sucesso.");
    },
    onError: (error) => {
      showError(error, "Erro ao remover atribuição");
    },
  });
};

// Hook para atribuições em massa
export const useBulkAssignments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BulkAssignmentData): Promise<BulkOperationResult> => {
      // Validate data
      const validation = validateBulkAssignmentData(data);
      if (!validation.success) {
        throw new Error(`Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }

      // Get current user
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const results: BulkOperationResult = {
        success: true,
        successCount: 0,
        errorCount: 0,
        errors: [],
        createdAssignments: [],
      };

      // Process each user assignment
      for (const userId of data.userIds) {
        try {
          // Check if assignment already exists
          const { data: existing } = await supabase
            .from("course_assignments")
            .select("id")
            .eq("user_id", userId)
            .eq("content_id", data.contentId)
            .single();

          if (existing) {
            results.errorCount++;
            results.errors.push({
              userId,
              error: "Atribuição já existe para este usuário",
            });
            continue;
          }

          // Create assignment
          const { data: assignment, error } = await supabase
            .from("course_assignments")
            .insert({
              user_id: userId,
              content_type: data.contentType,
              content_id: data.contentId,
              assigned_by: user.user.id,
              due_date: data.dueDate,
              priority: data.priority,
              notes: data.notes,
            })
            .select()
            .single();

          if (error) throw error;

          // Create notification
          await supabase
            .from("assignment_notifications")
            .insert({
              assignment_id: assignment.id,
              notification_type: "assignment_created",
            });

          results.successCount++;
          results.createdAssignments?.push(assignment.id);

        } catch (error) {
          results.errorCount++;
          results.errors.push({
            userId,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          });
        }
      }

      results.success = results.errorCount === 0;
      return results;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      
      if (result.success) {
        toast({
          title: "Atribuições criadas",
          description: `${result.successCount} atribuições foram criadas com sucesso.`,
        });
      } else {
        toast({
          title: "Atribuições parcialmente criadas",
          description: `${result.successCount} sucessos, ${result.errorCount} erros.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro nas atribuições em massa",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para buscar atribuições de um usuário específico
export const useUserAssignments = (userId: string) => {
  return useQuery({
    queryKey: ["user-assignments", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_assignments")
        .select('*')
        .eq("user_id", userId)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(assignment => ({
        id: assignment.id,
        userId: assignment.user_id,
        contentType: assignment.content_type as ContentType,
        contentId: assignment.content_id,
        assignedBy: assignment.assigned_by,
        assignedAt: assignment.assigned_at,
        dueDate: assignment.due_date,
        priority: assignment.priority as AssignmentPriority,
        status: assignment.status as AssignmentStatus,
        completedAt: assignment.completed_at,
        notes: assignment.notes,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at
      })) as CourseAssignment[];
    },
    enabled: !!userId,
  });
};

// Hook para buscar atribuições do usuário atual (para estudantes)
export const useMyAssignments = () => {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("course_assignments")
        .select('*')
        .eq("user_id", user.user.id)
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      return (data || []).map(assignment => ({
        id: assignment.id,
        userId: assignment.user_id,
        contentType: assignment.content_type as ContentType,
        contentId: assignment.content_id,
        assignedBy: assignment.assigned_by,
        assignedAt: assignment.assigned_at,
        dueDate: assignment.due_date,
        priority: assignment.priority as AssignmentPriority,
        status: assignment.status as AssignmentStatus,
        completedAt: assignment.completed_at,
        notes: assignment.notes,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at
      })) as CourseAssignment[];
    },
  });
};

// Hook para marcar atribuição como iniciada
export const useStartAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { data, error } = await supabase
        .from("course_assignments")
        .update({ status: "in_progress" })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", assignment.id] });
    },
  });
};