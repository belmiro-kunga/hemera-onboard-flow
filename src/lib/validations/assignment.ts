import { z } from "zod";
import type { AssignmentPriority, AssignmentStatus, NotificationType } from "@/types/assignment.types";

// Base schemas for enums
export const assignmentPrioritySchema = z.enum(['low', 'medium', 'high'] as const);
export const assignmentStatusSchema = z.enum(['assigned', 'in_progress', 'completed', 'overdue'] as const);
export const notificationTypeSchema = z.enum(['assignment_created', 'due_soon', 'overdue', 'completed', 'reminder'] as const);

// Course Assignment Schemas
export const createAssignmentSchema = z.object({
  userId: z.string().uuid("ID do usuário deve ser um UUID válido"),
  courseId: z.string().uuid("ID do curso deve ser um UUID válido"),
  dueDate: z.string().datetime("Data de vencimento deve ser uma data válida").optional(),
  priority: assignmentPrioritySchema.default('medium'),
  notes: z.string().max(1000, "Notas não podem exceder 1000 caracteres").optional(),
});

export const updateAssignmentSchema = z.object({
  dueDate: z.string().datetime("Data de vencimento deve ser uma data válida").optional(),
  priority: assignmentPrioritySchema.optional(),
  status: assignmentStatusSchema.optional(),
  notes: z.string().max(1000, "Notas não podem exceder 1000 caracteres").optional(),
});

export const bulkAssignmentSchema = z.object({
  userIds: z.array(z.string().uuid("ID do usuário deve ser um UUID válido"))
    .min(1, "Pelo menos um usuário deve ser selecionado")
    .max(100, "Máximo de 100 usuários por operação em lote"),
  courseId: z.string().uuid("ID do curso deve ser um UUID válido"),
  dueDate: z.string().datetime("Data de vencimento deve ser uma data válida").optional(),
  priority: assignmentPrioritySchema.default('medium'),
  notes: z.string().max(1000, "Notas não podem exceder 1000 caracteres").optional(),
});

// Assignment Template Schemas
export const templateCourseSchema = z.object({
  courseId: z.string().uuid("ID do curso deve ser um UUID válido"),
  isMandatory: z.boolean().default(true),
  defaultDueDays: z.number().int().min(1, "Prazo deve ser pelo menos 1 dia").max(365, "Prazo não pode exceder 365 dias").default(30),
  priority: assignmentPrioritySchema.default('medium'),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome não pode exceder 255 caracteres"),
  department: z.string().max(100, "Departamento não pode exceder 100 caracteres").optional(),
  jobTitle: z.string().max(100, "Cargo não pode exceder 100 caracteres").optional(),
  description: z.string().max(1000, "Descrição não pode exceder 1000 caracteres").optional(),
  courses: z.array(templateCourseSchema).min(1, "Pelo menos um curso deve ser incluído no template"),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome não pode exceder 255 caracteres").optional(),
  department: z.string().max(100, "Departamento não pode exceder 100 caracteres").optional(),
  jobTitle: z.string().max(100, "Cargo não pode exceder 100 caracteres").optional(),
  description: z.string().max(1000, "Descrição não pode exceder 1000 caracteres").optional(),
  isActive: z.boolean().optional(),
});

// Filter Schemas
export const assignmentFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  assignedBy: z.string().uuid().optional(),
  status: z.array(assignmentStatusSchema).optional(),
  priority: z.array(assignmentPrioritySchema).optional(),
  department: z.string().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  search: z.string().max(255).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['assignedAt', 'dueDate', 'priority', 'status']).default('assignedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const templateFiltersSchema = z.object({
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(255).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'department', 'jobTitle']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// CSV Import Schema
export const csvImportRowSchema = z.object({
  userEmail: z.string().email("Email do usuário deve ser válido"),
  courseTitle: z.string().min(1, "Título do curso é obrigatório"),
  dueDate: z.string().datetime("Data de vencimento deve ser uma data válida").optional(),
  priority: assignmentPrioritySchema.optional(),
  notes: z.string().max(1000, "Notas não podem exceder 1000 caracteres").optional(),
});

export const csvImportSchema = z.array(csvImportRowSchema).min(1, "Pelo menos uma linha deve ser importada");

// Notification Preferences Schema
export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
  reminderDaysBefore: z.number().int().min(1).max(30).default(3),
  overdueReminders: z.boolean().default(true),
  completionNotifications: z.boolean().default(true),
});

// Export Options Schema
export const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'pdf']),
  filters: assignmentFiltersSchema.optional(),
  includeUserDetails: z.boolean().default(true),
  includeCourseDetails: z.boolean().default(true),
  includeProgress: z.boolean().default(true),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).optional(),
});

// Template Application Schema
export const applyTemplateSchema = z.object({
  templateId: z.string().uuid("ID do template deve ser um UUID válido"),
  userIds: z.array(z.string().uuid("ID do usuário deve ser um UUID válido"))
    .min(1, "Pelo menos um usuário deve ser selecionado")
    .max(50, "Máximo de 50 usuários por aplicação de template"),
});

// Validation helper functions
export const validateAssignmentData = (data: unknown) => {
  return createAssignmentSchema.safeParse(data);
};

export const validateBulkAssignmentData = (data: unknown) => {
  return bulkAssignmentSchema.safeParse(data);
};

export const validateTemplateData = (data: unknown) => {
  return createTemplateSchema.safeParse(data);
};

export const validateFilters = (data: unknown) => {
  return assignmentFiltersSchema.safeParse(data);
};

export const validateCSVImport = (data: unknown) => {
  return csvImportSchema.safeParse(data);
};

// Custom validation functions
export const validateDueDateNotInPast = (dueDate: string) => {
  const date = new Date(dueDate);
  // Use Angola timezone for comparison
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Luanda" }));
  return date > now;
};

export const validateUserHasAccess = async (userId: string, courseId: string) => {
  // This would typically check if user has permission to access the course
  // Implementation would depend on your business logic
  return true;
};

export const validateNoDuplicateAssignment = async (userId: string, courseId: string) => {
  // This would check if the assignment already exists
  // Implementation would query the database
  return true;
};

// Type exports for use in components
export type CreateAssignmentData = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentData = z.infer<typeof updateAssignmentSchema>;
export type BulkAssignmentData = z.infer<typeof bulkAssignmentSchema>;
export type CreateTemplateData = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateData = z.infer<typeof updateTemplateSchema>;
export type AssignmentFilters = z.infer<typeof assignmentFiltersSchema>;
export type TemplateFilters = z.infer<typeof templateFiltersSchema>;
export type CSVImportRow = z.infer<typeof csvImportRowSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type ExportOptions = z.infer<typeof exportOptionsSchema>;
export type ApplyTemplateData = z.infer<typeof applyTemplateSchema>;