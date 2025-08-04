// API client for simulados operations
export interface Simulado {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  is_active: boolean;
  created_at: string;
  _count?: {
    attempts: number;
    questions: number;
  };
}

export interface Question {
  id?: string;
  text: string;
  type: 'multiple_choice' | 'single_answer';
  explanation: string;
  order_number: number;
  options: Option[];
}

export interface Option {
  id?: string;
  text: string;
  is_correct: boolean;
  order_number: number;
}

const API_BASE_URL = 'http://localhost:3001/api';

// Check if we're in browser and if API is available
const isBrowser = typeof window !== 'undefined';

class SimuladosAPI {
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
      console.warn('Simulados API not available, using mock data:', error);
      return this.getMockData(endpoint, options.method);
    }
  }

  private getMockData(endpoint: string, method?: string): any {
    // Mock data for when API is not available
    const mockSimulados: Simulado[] = [
      {
        id: 'mock-simulado-1',
        title: 'Simulado de Matemática Básica',
        description: 'Teste seus conhecimentos em matemática básica',
        duration_minutes: 60,
        total_questions: 10,
        difficulty: 'medio',
        is_active: true,
        created_at: new Date().toISOString(),
        _count: {
          attempts: 15,
          questions: 10
        }
      },
      {
        id: 'mock-simulado-2',
        title: 'Simulado de Português',
        description: 'Avalie seus conhecimentos em língua portuguesa',
        duration_minutes: 45,
        total_questions: 8,
        difficulty: 'facil',
        is_active: true,
        created_at: new Date().toISOString(),
        _count: {
          attempts: 23,
          questions: 8
        }
      },
      {
        id: 'mock-simulado-3',
        title: 'Simulado Avançado de Ciências',
        description: 'Desafie-se com questões avançadas de ciências',
        duration_minutes: 90,
        total_questions: 15,
        difficulty: 'dificil',
        is_active: false,
        created_at: new Date().toISOString(),
        _count: {
          attempts: 7,
          questions: 15
        }
      }
    ];

    if (endpoint === '/simulados') {
      if (method === 'POST') {
        return { success: true, data: { id: `mock-simulado-${Date.now()}` } };
      }
      return { success: true, data: mockSimulados };
    }
    if (endpoint.includes('/simulados/') && method === 'PUT') {
      return { success: true, message: 'Simulado updated successfully' };
    }
    if (endpoint.includes('/simulados/') && method === 'DELETE') {
      return { success: true, message: 'Simulado deleted successfully' };
    }

    return { success: false, error: 'Endpoint not found' };
  }

  async getSimulados(): Promise<Simulado[]> {
    console.log('🔄 SimuladosAPI: Making request to /simulados');
    const response = await this.request('/simulados');
    console.log('✅ SimuladosAPI: Response received:', response);
    return response.data || [];
  }

  async createSimulado(simuladoData: any, questions: Question[]): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.request('/simulados', {
        method: 'POST',
        body: JSON.stringify({ simulado: simuladoData, questions }),
      });
      return response;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateSimulado(simuladoId: string, simuladoData: any, questions: Question[]): Promise<void> {
    await this.request(`/simulados/${simuladoId}`, {
      method: 'PUT',
      body: JSON.stringify({ simulado: simuladoData, questions }),
    });
  }

  async deleteSimulado(simuladoId: string): Promise<void> {
    await this.request(`/simulados/${simuladoId}`, {
      method: 'DELETE',
    });
  }

  async toggleSimuladoStatus(simuladoId: string, isActive: boolean): Promise<void> {
    await this.request(`/simulados/${simuladoId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async getQuestions(simuladoId: string): Promise<Question[]> {
    const response = await this.request(`/simulados/${simuladoId}/questions`);
    return response.data || [];
  }
}

export const simuladosAPI = new SimuladosAPI();