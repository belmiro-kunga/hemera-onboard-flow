import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CSVImportData, CSVImportResult, BulkOperationResult } from '@/types/assignment.types';

interface ImportAssignmentsParams {
  data: CSVImportData[];
  validateOnly?: boolean;
}

export const useCSVImport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importAssignments = useMutation({
    mutationFn: async ({ data, validateOnly = false }: ImportAssignmentsParams): Promise<CSVImportResult> => {
      const errors: CSVImportResult['errors'] = [];
      let successCount = 0;
      const createdAssignments: string[] = [];

      // Step 1: Validate data format
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 because of header and 0-based index

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.userEmail)) {
          errors.push({
            row: rowNumber,
            data: row,
            error: 'Email inválido'
          });
          continue;
        }

        // Validate course title
        if (!row.courseTitle || row.courseTitle.trim().length === 0) {
          errors.push({
            row: rowNumber,
            data: row,
            error: 'Título do curso é obrigatório'
          });
          continue;
        }

        // Validate due date if provided
        if (row.dueDate) {
          const date = new Date(row.dueDate);
          const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Luanda" }));
          if (isNaN(date.getTime()) || date < now) {
            errors.push({
              row: rowNumber,
              data: row,
              error: 'Data de vencimento inválida ou no passado'
            });
            continue;
          }
        }

        // Validate priority
        if (row.priority && !['low', 'medium', 'high'].includes(row.priority)) {
          errors.push({
            row: rowNumber,
            data: row,
            error: 'Prioridade deve ser: low, medium ou high'
          });
          continue;
        }
      }

      // If validation only, return early
      if (validateOnly) {
        return {
          success: errors.length === 0,
          totalRows: data.length,
          successCount: data.length - errors.length,
          errorCount: errors.length,
          errors,
          preview: data.slice(0, 5),
        };
      }

      // If there are validation errors, don't proceed with import
      if (errors.length > 0) {
        return {
          success: false,
          totalRows: data.length,
          successCount: 0,
          errorCount: errors.length,
          errors,
        };
      }

      // Step 2: Process each row for actual import
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2;

        try {
          // Find user by email
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', row.userEmail)
            .single();

          if (userError || !userData) {
            errors.push({
              row: rowNumber,
              data: row,
              error: 'Usuário não encontrado com este email'
            });
            continue;
          }

          // Find course by title (try both video_courses and simulados)
          let contentId: string | null = null;
          let contentType: 'course' | 'simulado' = 'course';

          // First try video_courses
          const { data: courseData } = await supabase
            .from('video_courses')
            .select('id')
            .eq('title', row.courseTitle)
            .eq('is_active', true)
            .single();

          if (courseData) {
            contentId = courseData.id;
            contentType = 'course';
          } else {
            // Try simulados
            const { data: simuladoData } = await supabase
              .from('simulados')
              .select('id')
              .eq('title', row.courseTitle)
              .eq('is_active', true)
              .single();

            if (simuladoData) {
              contentId = simuladoData.id;
              contentType = 'simulado';
            }
          }

          if (!contentId) {
            errors.push({
              row: rowNumber,
              data: row,
              error: 'Curso/Simulado não encontrado com este título'
            });
            continue;
          }

          // Check if assignment already exists
          const { data: existingAssignment } = await supabase
            .from('course_assignments')
            .select('id')
            .eq('user_id', userData.user_id)
            .eq('content_id', contentId)
            .eq('content_type', contentType)
            .single();

          if (existingAssignment) {
            errors.push({
              row: rowNumber,
              data: row,
              error: 'Atribuição já existe para este usuário e curso'
            });
            continue;
          }

          // Create assignment
          const assignmentData = {
            user_id: userData.user_id,
            content_type: contentType,
            content_id: contentId,
            assigned_by: (await supabase.auth.getUser()).data.user?.id || '',
            due_date: row.dueDate || null,
            priority: row.priority || 'medium',
            notes: row.notes || null,
            status: 'assigned' as const,
          };

          const { data: newAssignment, error: assignmentError } = await supabase
            .from('course_assignments')
            .insert(assignmentData)
            .select('id')
            .single();

          if (assignmentError || !newAssignment) {
            errors.push({
              row: rowNumber,
              data: row,
              error: 'Erro ao criar atribuição: ' + (assignmentError?.message || 'Erro desconhecido')
            });
            continue;
          }

          createdAssignments.push(newAssignment.id);
          successCount++;

        } catch (error) {
          errors.push({
            row: rowNumber,
            data: row,
            error: 'Erro inesperado: ' + (error instanceof Error ? error.message : 'Erro desconhecido')
          });
        }
      }

      return {
        success: errors.length === 0,
        totalRows: data.length,
        successCount,
        errorCount: errors.length,
        errors,
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${result.successCount} atribuições criadas com sucesso.`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.invalidateQueries({ queryKey: ['assignment-stats'] });
      } else if (result.errorCount > 0) {
        toast({
          title: "Importação com erros",
          description: `${result.successCount} sucessos, ${result.errorCount} erros.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro durante a importação. Tente novamente.",
        variant: "destructive",
      });
      console.error('CSV Import error:', error);
    },
  });

  return {
    importAssignments: importAssignments.mutate,
    isImporting: importAssignments.isPending,
    importError: importAssignments.error,
  };
};

// Utility function to validate CSV format
export const validateCSVFormat = (csvText: string): { isValid: boolean; error?: string } => {
  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return { isValid: false, error: 'Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados' };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['useremail', 'coursetitle'];
    
    const hasRequiredHeaders = requiredHeaders.every(header => 
      headers.includes(header)
    );

    if (!hasRequiredHeaders) {
      return { isValid: false, error: 'Arquivo deve conter as colunas obrigatórias: userEmail, courseTitle' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Erro ao processar arquivo CSV' };
  }
};

// Utility function to parse CSV text to data
export const parseCSVToData = (csvText: string): CSVImportData[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const data: CSVImportData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    const userEmailIndex = headers.indexOf('useremail');
    const courseTitleIndex = headers.indexOf('coursetitle');
    const dueDateIndex = headers.indexOf('duedate');
    const priorityIndex = headers.indexOf('priority');
    const notesIndex = headers.indexOf('notes');
    
    if (userEmailIndex >= 0 && courseTitleIndex >= 0 && values.length > Math.max(userEmailIndex, courseTitleIndex)) {
      const row: CSVImportData = {
        userEmail: values[userEmailIndex] || '',
        courseTitle: values[courseTitleIndex] || '',
        dueDate: dueDateIndex >= 0 && values[dueDateIndex] ? values[dueDateIndex] : undefined,
        priority: (priorityIndex >= 0 && values[priorityIndex] ? values[priorityIndex] as 'low' | 'medium' | 'high' : 'medium'),
        notes: notesIndex >= 0 && values[notesIndex] ? values[notesIndex] : undefined,
      };
      data.push(row);
    }
  }
  
  return data;
};