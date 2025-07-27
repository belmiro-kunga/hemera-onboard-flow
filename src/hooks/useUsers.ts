import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_users_with_details');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
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
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Usuário criado com sucesso",
          description: `${userData.name} foi adicionado ao sistema.`,
        });
        await fetchUsers();
        return { success: true, data: result };
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message,
        variant: "destructive",
      });
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

      toast({
        title: isActive ? "Usuário ativado" : "Usuário desativado",
        description: "Status atualizado com sucesso.",
      });
      
      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createDepartment = async (name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .insert({ name, description });

      if (error) throw error;

      toast({
        title: "Departamento criado",
        description: `${name} foi adicionado.`,
      });
      
      await fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Erro ao criar departamento",
        description: error.message,
        variant: "destructive",
      });
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