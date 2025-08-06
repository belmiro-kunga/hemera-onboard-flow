import axios, { AxiosResponse } from 'axios';
import { User } from '../types/entities';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Local user interface that matches our API response
interface ApiUser {
  id: string | number;
  name: string;
  email: string;
  role: 'funcionario' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'pending';
  birthday?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'funcionario' | 'admin' | 'superadmin';
  department?: string;
  birthday?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string | number;
}

// Helper to normalize user data from API to our User type
const normalizeUser = (user: ApiUser): User => ({
  ...user,
  id: String(user.id), // Ensure ID is always a string
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  lastLogin: user.last_login
});

const userApi = {
  async getAll(): Promise<User[]> {
    const response = await axios.get<ApiResponse<ApiUser[]>>(`${API_URL}/users`);
    const users = response.data.success ? response.data.data : [];
    return Array.isArray(users) ? users.map(normalizeUser) : [];
  },

  async getById(id: string | number): Promise<User | null> {
    try {
      const response = await axios.get<ApiResponse<ApiUser>>(`${API_URL}/users/${id}`);
      return response.data.success ? normalizeUser(response.data.data) : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async create(userData: CreateUserData): Promise<User | null> {
    try {
      const response = await axios.post<ApiResponse<ApiUser>>(`${API_URL}/users`, userData);
      return response.data.success ? normalizeUser(response.data.data) : null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async update({ id, ...userData }: UpdateUserData): Promise<User | null> {
    try {
      const response = await axios.put<ApiResponse<ApiUser>>(
        `${API_URL}/users/${id}`, 
        userData
      );
      return response.data.success ? normalizeUser(response.data.data) : null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async delete(id: string | number): Promise<boolean> {
    try {
      const response = await axios.delete<ApiResponse<boolean>>(`${API_URL}/users/${id}`);
      return response.data.success && response.data.data === true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  async importUsers(users: CreateUserData[]): Promise<User[]> {
    try {
      const response = await axios.post<ApiResponse<ApiUser[]>>(
        `${API_URL}/users/import`, 
        { users }
      );
      return response.data.success && Array.isArray(response.data.data)
        ? response.data.data.map(normalizeUser)
        : [];
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  }
};

export default userApi;
