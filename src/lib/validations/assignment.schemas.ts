import { z } from 'zod';

// Enum schemas
export const assignmentPrioritySchema = z.enum(['low', 'medium', 'high']);
export const assignmentStatusSchema = z.enum(['assigned', 'in_progress', 'completed', 'overdue']);
export const notificationTypeSchema = z.enum(['assignment_created', 'due_soon', 'overdue', 'completed', 'reminder']);
export const contentTypeSchema = z.enum(['course', 'simulado']);

// Core assignment schemas
export const createAssignmentSchema = z.object({
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  contentType: contentTypeSchema,
  contentId: z.string().uuid('ID do conteúdo deve ser um UUID válido'),
  dueDate: z.string().datetime('Data de vencimento deve ser uma data válida').optional(),
  priority: assignmentPrioritySchema.default('medium'),
  notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional(),
});

export const updateAssignmentSchema = z.object({
  dueDate: z.string().datetime('Data de vencimento deve ser uma data válida').optional(),
  priority: assignmentPrioritySchema.optional(),
  status: assignmentStatusSchema.optional(),
  notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional(),
});

export const bulkAssignmentSchema = z.object({
  userIds: z.array(z.string().uuid('ID do usuário deve ser um UUID válido'))
    .min(1, 'Pelo menos um usuário deve ser selecionado')
    .max(100, 'Máximo de 100 usuários por operação em lote'),
  contentType: contentTypeSchema,
  contentId: z.string().uuid('ID do conteúdo deve ser um UUID válido'),
  dueDate: z.string().datetime('Data de vencimento deve ser uma data válida').optional(),
  priority: assignmentPrioritySchema.default('medium'),
  notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional(),
});

// Template schemas
export const templateCourseSchema = z.object({
  contentType: contentTypeSchema,
  contentId: z.string().uuid('ID do conteúdo deve ser um UUID válido'),
  isMandatory: z.boolean().default(true),
  defaultDueDays: z.number()
    .int('Dias de prazo deve ser um número inteiro')
    .min(1, 'Prazo mínimo é 1 dia')
    .max(365, 'Prazo máximo é 365 dias')
    .default(30),
  priority: assignmentPrioritySchema.default('medium'),
});

export const createTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  department: z.string()
    .max(50, 'Departamento não pode exceder 50 caracteres')
    .optional(),
  jobTitle: z.string()
    .max(50, 'Cargo não pode exceder 50 caracteres')
    .optional(),
  description: z.string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional(),
  contents: z.array(templateCourseSchema)
    .min(1, 'Pelo menos um conteúdo deve ser adicionado ao template')
    .max(50, 'Máximo de 50 conteúdos por template'),
});

export const updateTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .optional(),
  department: z.string()
    .max(50, 'Departamento não pode exceder 50 caracteres')
    .optional(),
  jobTitle: z.string()
    .max(50, 'Cargo não pode exceder 50 caracteres')
    .optional(),
  description: z.string()
    .max(500, 'Descrição não pode exceder 500 caracteres')
    .optional(),
  isActive: z.boolean().optional(),
});

// Filter schemas
export const assignmentFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  assignedBy: z.string().uuid().optional(),
  status: z.array(assignmentStatusSchema).optional(),
  priority: z.array(assignmentPrioritySchema).optional(),
  department: z.string().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['assignedAt', 'dueDate', 'priority', 'status']).default('assignedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const templateFiltersSchema = z.object({
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'department', 'jobTitle']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// CSV import schema
export const csvImportRowSchema = z.object({
  userEmail: z.string().email('Email deve ser válido'),
  courseTitle: z.string().min(1, 'Título do curso é obrigatório'),
  dueDate: z.string().datetime('Data de vencimento deve ser uma data válida').optional(),
  priority: assignmentPrioritySchema.default('medium'),
  notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional(),
});

export const csvImportSchema = z.object({
  data: z.array(csvImportRowSchema)
    .min(1, 'Pelo menos uma linha de dados é necessária')
    .max(1000, 'Máximo de 1000 linhas por importação'),
  validateOnly: z.boolean().default(false),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
  reminderDaysBefore: z.number()
    .int('Dias de lembrete deve ser um número inteiro')
    .min(1, 'Mínimo de 1 dia de antecedência')
    .max(30, 'Máximo de 30 dias de antecedência')
    .default(3),
  overdueReminders: z.boolean().default(true),
  completionNotifications: z.boolean().default(true),
});

// Export options schema
export const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'pdf']),
  filters: assignmentFiltersSchema.optional(),
  includeUserDetails: z.boolean().default(true),
  includeCourseDetails: z.boolean().default(true),
  includeProgress: z.boolean().default(true),
  dateRange: z.object({
    from: z.string().datetime('Data inicial deve ser uma data válida'),
    to: z.string().datetime('Data final deve ser uma data válida'),
  }).optional(),
});

// Validation utility functions
export const validateAssignmentData = (data: unknown) => {
  return createAssignmentSchema.safeParse(data);
};

export const validateBulkAssignmentData = (data: unknown) => {
  return bulkAssignmentSchema.safeParse(data);
};

export const validateTemplateData = (data: unknown) => {
  return createTemplateSchema.safeParse(data);
};

export const validateAssignmentFilters = (data: unknown) => {
  return assignmentFiltersSchema.safeParse(data);
};

export const validateTemplateFilters = (data: unknown) => {
  return templateFiltersSchema.safeParse(data);
};

export const validateCSVImportData = (data: unknown) => {
  return csvImportSchema.safeParse(data);
};

export const validateNotificationPreferences = (data: unknown) => {
  return notificationPreferencesSchema.safeParse(data);
};

export const validateExportOptions = (data: unknown) => {
  return exportOptionsSchema.safeParse(data);
};

// Custom validation functions
export const validateDueDateNotInPast = (dueDate: string) => {
  const date = new Date(dueDate);
  // Use Angola timezone for comparison
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Luanda" }));
  return date > now;
};

export const validateUserHasAccess = async (userId: string, contentType: string, contentId: string) => {
  // This would typically check if user has access to the content
  // Implementation depends on your access control logic
  return true;
};

export const validateTemplateUniqueness = async (name: string, department?: string, jobTitle?: string, excludeId?: string) => {
  // This would check if a template with the same name/department/jobTitle already exists
  // Implementation depends on your business rules
  return true;
};

// Type inference helpers
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type BulkAssignmentInput = z.infer<typeof bulkAssignmentSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type AssignmentFiltersInput = z.infer<typeof assignmentFiltersSchema>;
export type TemplateFiltersInput = z.infer<typeof templateFiltersSchema>;
export type CSVImportInput = z.infer<typeof csvImportSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;