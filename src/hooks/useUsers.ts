import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCommonHook } from "@/hooks/useCommonHook";
import type { UserCompleteData } from "@/lib/validations/user";

export interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  job_position?: string;
  manager_name?: string;
  employee_id?: string;
  start_date?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  is_active: boolean;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useCommonHook();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_users_with_details');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      showError(error, "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error.message);
    }
  };

  const createUser = async (userData: UserCompleteData) => {
    try {
      // Converter data de nascimento para formato YYYY-MM-DD se necessário
      let birthDate = null;
      if (userData.birth_date) {
        if (userData.birth_date.includes('/')) {
          // Converter DD/MM/YYYY para YYYY-MM-DD
          const [day, month, year] = userData.birth_date.split('/');
          birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          birthDate = userData.birth_date;
        }
      }

      const { data, error } = await supabase.rpc('create_user_with_profile', {
        p_email: userData.email,
        p_password: userData.password,
        p_name: userData.name,
        p_phone: userData.phone || null,
        p_role: userData.role as 'super_admin' | 'admin' | 'funcionario',
        p_department: userData.department || null,
        p_job_position: userData.job_position || null,
        p_manager_id: userData.manager_id || null,
        p_employee_id: userData.employee_id || null,
        p_start_date: userData.start_date || new Date().toISOString().split('T')[0],
        p_birth_date: birthDate,
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        // Gerar senha temporária e enviar email de boas-vindas
        try {
          const tempPasswordResult = await supabase.rpc('generate_temporary_password', {
            p_user_id: result.user_id,
            p_expires_hours: 24
          });

          if (tempPasswordResult.data) {
            // Enviar email de boas-vindas
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                name: userData.name,
                email: userData.email,
                temporaryPassword: tempPasswordResult.data,
                loginUrl: window.location.origin,
                companyName: "Hemera Capital"
              }
            });
          }
        } catch (emailError) {
          console.error('Erro ao enviar email de boas-vindas:', emailError);
          // Não falha a criação do usuário se o email não foi enviado
        }

        showSuccess(`${userData.name} foi adicionado ao sistema e receberá um email com as credenciais.`);
        await fetchUsers();
        return { success: true, data: result };
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      showError(error, "Erro ao criar usuário");
      return { success: false, error: error.message };
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId);

      if (error) throw error;

      showSuccess(`Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso.`);
      
      await fetchUsers();
    } catch (error: any) {
      showError(error, "Erro ao atualizar status");
    }
  };

  const createDepartment = async (name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .insert({ name, description });

      if (error) throw error;

      showSuccess(`Departamento ${name} foi adicionado.`);
      
      await fetchDepartments();
    } catch (error: any) {
      showError(error, "Erro ao criar departamento");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  return {
    users,
    departments,
    loading,
    fetchUsers,
    fetchDepartments,
    createUser,
    updateUserStatus,
    createDepartment,
  };
}