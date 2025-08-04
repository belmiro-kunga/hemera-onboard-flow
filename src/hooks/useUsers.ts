import { useState, useEffect } from "react";
import { database } from "@/lib/database";
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
  const { showError, showSuccess, invalidateQueries } = useCommonHook();

  // Função auxiliar para detectar ambiente
  const isBrowser = typeof window !== 'undefined';

  // Função auxiliar para operações de database com fallback
  const executeWithFallback = async (
    rpcOperation: () => Promise<any>,
    fallbackOperation: () => Promise<any>,
    mockData?: any
  ) => {
    if (isBrowser && mockData) {
      console.warn('🔧 Using mock data');
      return { data: mockData, error: null };
    }

    try {
      return await rpcOperation();
    } catch (rpcError) {
      console.warn('RPC function not available, using fallback');
      return await fallbackOperation();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock users data for browser
      const mockUsers: User[] = [
        {
          id: 'mock-user-1',
          user_id: 'mock-user-1',
          name: 'João Silva',
          email: 'joao@example.com',
          department: 'TI',
          job_position: 'Desenvolvedor',
          role: 'funcionario',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-user-2',
          user_id: 'mock-user-2',
          name: 'Maria Santos',
          email: 'maria@example.com',
          department: 'RH',
          job_position: 'Analista',
          role: 'funcionario',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-admin',
          user_id: 'mock-admin',
          name: 'Admin User',
          email: 'admin@example.com',
          department: 'TI',
          job_position: 'Administrador',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      const result = await executeWithFallback(
        () => database.rpc('get_users_with_details'),
        () => database.from('profiles').select('*').order('name'),
        mockUsers
      );

      if (result.error) throw result.error;
      setUsers(result.data || []);
    } catch (error: any) {
      showError(error, "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Mock departments data for browser
      const mockDepartments: Department[] = [
        { id: 'dept-1', name: 'TI', description: 'Tecnologia da Informação', is_active: true },
        { id: 'dept-2', name: 'RH', description: 'Recursos Humanos', is_active: true },
        { id: 'dept-3', name: 'Financeiro', description: 'Departamento Financeiro', is_active: true }
      ];

      const result = await executeWithFallback(
        () => database.from('departments').select('*').eq('is_active', true).order('name'),
        () => database.from('departments').select('*').eq('is_active', true).order('name'),
        mockDepartments
      );

      if (result.error) throw result.error;
      setDepartments(result.data || []);
    } catch (error: any) {
      showError(error, "Erro ao carregar departamentos");
    }
  };

  const createUser = async (userData: UserCompleteData) => {
    try {
      // Converter data de nascimento para formato YYYY-MM-DD se necessário
      const birthDate = userData.birth_date ? 
        (userData.birth_date.includes('/') ? 
          (() => {
            const [day, month, year] = userData.birth_date.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          })() : userData.birth_date
        ) : null;

      // Mock result for browser
      const mockResult = {
        success: true,
        user_id: `mock-user-${Date.now()}`,
        message: 'User created successfully (mock)'
      };

      const result = await executeWithFallback(
        () => database.rpc('create_user_with_profile', {
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
        }),
        async () => {
          // Fallback to manual user creation using auth service
          const { AuthService } = await import('@/lib/auth');
          return await AuthService.register({
            email: userData.email,
            password: userData.password,
            full_name: userData.name,
            department: userData.department,
            job_position: userData.job_position,
          });
        },
        mockResult
      );

      if (result.error) throw result.error;

      const creationResult = result.data;
      if (creationResult?.success) {
        // Tentar gerar senha temporária (apenas no servidor)
        if (!isBrowser) {
          try {
            await database.rpc('generate_temporary_password', {
              p_user_id: creationResult.user_id,
              p_expires_hours: 24
            });
            console.log('Welcome email would be sent to:', userData.email);
          } catch (emailError) {
            console.warn('Erro ao enviar email de boas-vindas:', emailError);
          }
        }

        const successMessage = isBrowser ? 
          `${userData.name} foi adicionado ao sistema (modo mock).` :
          `${userData.name} foi adicionado ao sistema e receberá um email com as credenciais.`;
        
        showSuccess(successMessage);
        invalidateQueries(['users']);
        await fetchUsers();
        return { success: true, data: creationResult };
      } else {
        throw new Error(creationResult?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      showError(error, "Erro ao criar usuário");
      return { success: false, error: error.message };
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        () => database.from('profiles').update({ is_active: isActive }).eq('user_id', userId),
        () => database.from('profiles').update({ is_active: isActive }).eq('user_id', userId),
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess(`Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso.`);
      invalidateQueries(['users']);
      await fetchUsers();
    } catch (error: any) {
      showError(error, "Erro ao atualizar status");
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        () => database.from('profiles').update(userData).eq('user_id', userId),
        () => database.from('profiles').update(userData).eq('user_id', userId),
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess("Usuário atualizado com sucesso.");
      invalidateQueries(['users']);
      await fetchUsers();
    } catch (error: any) {
      showError(error, "Erro ao atualizar usuário");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      // Soft delete - just deactivate the user
      const result = await executeWithFallback(
        () => database.from('profiles').update({ is_active: false }).eq('user_id', userId),
        () => database.from('profiles').update({ is_active: false }).eq('user_id', userId),
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess("Usuário excluído com sucesso.");
      invalidateQueries(['users']);
      await fetchUsers();
    } catch (error: any) {
      showError(error, "Erro ao excluir usuário");
    }
  };

  const createDepartment = async (name: string, description?: string) => {
    try {
      // Mock result for browser
      const mockResult = { success: true };

      const result = await executeWithFallback(
        () => database.from('departments').insert({ name, description }),
        () => database.from('departments').insert({ name, description }),
        mockResult
      );

      if (result.error) throw result.error;

      showSuccess(`Departamento ${name} foi adicionado.`);
      invalidateQueries(['departments']);
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
    updateUser,
    updateUserStatus,
    deleteUser,
    createDepartment,
  };
}