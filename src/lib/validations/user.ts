import { z } from "zod";

// Validação para números de telefone angolanos
const angolanPhoneRegex = /^(\+244\s?)?[9][0-9]{8}$/;

export const userBasicSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional().refine((phone) => {
    if (!phone || phone.trim() === "") return true;
    const cleanPhone = phone.replace(/\s/g, "");
    return angolanPhoneRegex.test(cleanPhone);
  }, "Número de telefone deve ser no formato angolano (ex: +244 912345678 ou 912345678)"),
});

export const userCredentialsSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const userOrganizationalSchema = z.object({
  department: z.string().optional(),
  job_position: z.string().optional(),
  manager_id: z.string().uuid().optional().or(z.literal("")),
  employee_id: z.string().optional(),
  start_date: z.string().optional(),
  birth_date: z.string().optional().refine((date) => {
    if (!date || date.trim() === "") return true;
    // Aceita formatos DD/MM/YYYY ou YYYY-MM-DD
    const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = date.includes('/') 
      ? new Date(date.split('/').reverse().join('-'))
      : new Date(date);
    
    return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
  }, "Data de nascimento deve estar no formato DD/MM/YYYY ou YYYY-MM-DD e não pode ser futura"),
});

export const userProfileSchema = z.object({
  photo_url: z.string().url().optional().or(z.literal("")),
  role: z.enum(["super_admin", "admin", "funcionario"]),
});

export const userCompleteSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional().refine((phone) => {
    if (!phone || phone.trim() === "") return true;
    const cleanPhone = phone.replace(/\s/g, "");
    return angolanPhoneRegex.test(cleanPhone);
  }, "Número de telefone deve ser no formato angolano (ex: +244 912345678 ou 912345678)"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  department: z.string().optional(),
  job_position: z.string().optional(),
  manager_id: z.string().uuid().optional().or(z.literal("")),
  employee_id: z.string().optional(),
  start_date: z.string().optional(),
  birth_date: z.string().optional().refine((date) => {
    if (!date || date.trim() === "") return true;
    // Aceita formatos DD/MM/YYYY ou YYYY-MM-DD
    const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = date.includes('/') 
      ? new Date(date.split('/').reverse().join('-'))
      : new Date(date);
    
    return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
  }, "Data de nascimento deve estar no formato DD/MM/YYYY ou YYYY-MM-DD e não pode ser futura"),
  photo_url: z.string().url().optional().or(z.literal("")),
  role: z.enum(["super_admin", "admin", "funcionario"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type UserBasicData = z.infer<typeof userBasicSchema>;
export type UserCredentialsData = z.infer<typeof userCredentialsSchema>;
export type UserOrganizationalData = z.infer<typeof userOrganizationalSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type UserCompleteData = z.infer<typeof userCompleteSchema>;