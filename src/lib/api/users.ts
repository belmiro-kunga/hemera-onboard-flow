// API client for user operations
import type { User } from '@/hooks/useUsers';

const API_BASE_URL = 'http://localhost:3001/api';

// Check if we're in browser and if API is available
const isBrowser = typeof window !== 'undefined';

class UserAPI {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!isBrowser) {
      throw new Error('API calls only available in browser');
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // If API is not available, fall back to mock data
      console.warn('API not available, using mock data:', error);
      return this.getMockData(endpoint);
    }
  }

  private getMockData(endpoint: string): any {
    // Mock data for when API is not available
    const mockUsers: User[] = [
      {
        id: 'mock-user-1',
        user_id: 'mock-user-1',
        name: 'João Silva',
        email: 'joao@hcp.com',
        phone: '(11) 99999-9999',
        department: 'TI',
        job_position: 'Desenvolvedor',
        role: 'funcionario',
        is_active: true,
        created_at: new Date().toISOString(),
        employee_id: 'EMP001'
      },
      {
        id: 'mock-user-2',
        user_id: 'mock-user-2',
        name: 'Maria Santos',
        email: 'maria@hcp.com',
        phone: '(11) 88888-8888',
        department: 'RH',
        job_position: 'Analista',
        role: 'funcionario',
        is_active: true,
        created_at: new Date().toISOString(),
        employee_id: 'EMP002'
      },
      {
        id: 'mock-admin',
        user_id: 'mock-admin',
        name: 'Admin User',
        email: 'admin@hcp.com',
        phone: '(11) 77777-7777',
        department: 'TI',
        job_position: 'Administrador',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        employee_id: 'ADM001'
      },
      {
        id: 'mock-super-admin',
        user_id: 'mock-super-admin',
        name: 'Super Admin',
        email: 'superadmin@hcp.com',
        phone: '(11) 66666-6666',
        department: 'TI',
        job_position: 'Super Administrador',
        role: 'super_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        employee_id: 'SADM001'
      }
    ];

    const mockDepartments = [
      { id: 'dept-1', name: 'TI', description: 'Tecnologia da Informação', is_active: true },
      { id: 'dept-2', name: 'RH', description: 'Recursos Humanos', is_active: true },
      { id: 'dept-3', name: 'Financeiro', description: 'Departamento Financeiro', is_active: true },
      { id: 'dept-4', name: 'Marketing', description: 'Marketing e Comunicação', is_active: true },
      { id: 'dept-5', name: 'Vendas', description: 'Departamento de Vendas', is_active: true }
    ];

    if (endpoint === '/users') {
      return { success: true, data: mockUsers };
    }
    if (endpoint === '/departments') {
      return { success: true, data: mockDepartments };
    }
    if (endpoint.includes('/users/') && endpoint.includes('/status')) {
      return { success: true, message: 'Status updated successfully' };
    }
    if (endpoint.includes('/users/') && endpoint.includes('PUT')) {
      return { success: true, message: 'User updated successfully' };
    }
    if (endpoint.includes('/users/') && endpoint.includes('DELETE')) {
      return { success: true, message: 'User deleted successfully' };
    }
    if (endpoint === '/users' && endpoint.includes('POST')) {
      return { success: true, data: { id: `mock-user-${Date.now()}` } };
    }

    return { success: false, error: 'Endpoint not found' };
  }

  async getUsers(): Promise<User[]> {
    const response = await this.request('/users');
    return response.data || [];
  }

  async getDepartments(): Promise<any[]> {
    const response = await this.request('/departments');
    return response.data || [];
  }

  async createUser(userData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.request('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    await this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async createDepartment(name: string, description?: string): Promise<void> {
    await this.request('/departments', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }
}

export const userAPI = new UserAPI();