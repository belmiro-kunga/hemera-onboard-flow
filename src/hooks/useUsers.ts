import { useState, useEffect } from "react";
import { userAPI } from "@/lib/api/users";
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await userAPI.getUsers();
      setUsers(usersData);
    } catch (error: any) {
      showError(error, "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const departmentsData = await userAPI.getDepartments();
      setDepartments(departmentsData);
    } catch (error: any) {
      showError(error, "Erro ao carregar departamentos");
    }
  };

  const createUser = async (userData: UserCompleteData) => {
    try {
      const result = await userAPI.createUser(userData);
      
      if (result.success) {
        showSuccess(`${userData.name} foi adicionado ao sistema com sucesso!`);
        invalidateQueries(['users']);
        await fetchUsers();
        return { success: true, data: result };
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      showError(error, "Erro ao criar usuário");
      return { success: false, error: error.message };
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await userAPI.updateUserStatus(userId, isActive);
      showSuccess(`Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso.`);
      invalidateQueries(['users']);
      await fetchUsers();
    } catch (error: any) {
      showError(error, "Erro ao atualizar status");
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      await userAPI.updateUser(userId, userData);
      showSuccess("Usuário atualizado com sucesso.");
      invalidateQueries(['users']);
      await fetchUsers();
    } catch (error: any) {
      showError(error, "Erro ao atualizar usuário");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await userAPI.deleteUser(userId);
      showSuccess("Usuário excluído com sucesso.");
      invalidateQueries(['users']);
      await fetchUsers();
    } catch (error: any) {
      showError(error, "Erro ao excluir usuário");
    }
  };

  const createDepartment = async (name: string, description?: string) => {
    try {
      await userAPI.createDepartment(name, description);
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