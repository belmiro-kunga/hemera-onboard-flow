// Utilitários comuns para eliminar duplicações

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { database } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

// Hook comum para estados de busca e filtro
export const useSearchAndFilter = (initialCategory = 'all', initialFilter = 'all') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedFilter,
    setSelectedFilter,
  };
};

// Hook comum para tabs
export const useTabState = (initialTab: string) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  return { activeTab, setActiveTab };
};

// Hook comum para autenticação de usuário
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      // TODO: Implement with local auth context
      throw new Error('Use useAuth hook from AuthContext instead');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Função comum para filtros de busca
export const createSearchFilter = (searchTerm: string) => {
  return (item: any, searchFields: string[]) => {
    if (!searchTerm) return true;
    
    return searchFields.some(field => {
      const value = getNestedValue(item, field);
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  };
};

// Função auxiliar para acessar propriedades aninhadas
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Função comum para filtros de categoria
export const createCategoryFilter = (selectedCategory: string) => {
  return (item: any, categoryField: string) => {
    if (selectedCategory === 'all') return true;
    return getNestedValue(item, categoryField) === selectedCategory;
  };
};

// Hook comum para queries de usuários
export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await database
        .from('profiles')
        .select('user_id, name, email, department, job_position, photo_url, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .select_query();
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook comum para queries de cursos
export const useCoursesQuery = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await database
        .from('video_courses')
        .select('id, title, description, duration_hours, difficulty, is_active')
        .eq('is_active', true)
        .order('title', { ascending: true })
        .select_query();
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook comum para queries de simulados
export const useSimuladosQuery = () => {
  return useQuery({
    queryKey: ['simulados'],
    queryFn: async () => {
      const { data, error } = await database
        .from('simulados')
        .select('id, title, description, duration_minutes, difficulty, total_questions, is_active')
        .eq('is_active', true)
        .order('title', { ascending: true })
        .select_query();
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook comum para queries de departamentos
export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await database
        .from('profiles')
        .select('department')
        .not('department', 'is', null)
        .eq('is_active', true)
        .select_query();
      
      if (error) throw error;
      
      // Remove duplicatas e retorna array único
      const uniqueDepartments = [...new Set(data.map(item => item.department))];
      return uniqueDepartments.filter(Boolean);
    },
  });
};

// Hook comum para queries de categorias de curso
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await database
        .from('video_courses')
        .select('category')
        .not('category', 'is', null)
        .eq('is_active', true)
        .select_query();
      
      if (error) throw error;
      
      // Remove duplicatas e retorna array único
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      return uniqueCategories.filter(Boolean);
    },
  });
};

// Padrão comum para inicialização de hooks personalizados
export const createCustomHook = (hookName: string) => {
  return () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    
    return {
      queryClient,
      toast,
      // Adicione outras funcionalidades comuns aqui
    };
  };
};

// Função comum para tratamento de erros
export const handleError = (error: any, toast: any, defaultMessage = 'Ocorreu um erro inesperado') => {
  console.error(error);
  toast({
    title: 'Erro',
    description: error.message || defaultMessage,
    variant: 'destructive',
  });
};

// Função comum para sucesso
export const handleSuccess = (toast: any, message: string) => {
  toast({
    title: 'Sucesso',
    description: message,
  });
};

// Hook comum para queries de vídeos
export const useVideosQuery = () => {
  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      // Por enquanto retornando dados mock, mas pode ser conectado ao Supabase
      return [
        {
          id: 1,
          title: 'Boas-vindas do CEO',
          description: 'Mensagem de boas-vindas do CEO da Hemera Capital Partners',
          thumbnail: '/placeholder.svg',
          duration: '5:30',
          category: 'Cultura',
          uploadDate: '2024-01-15',
          views: 247,
          status: 'published',
          fileSize: '125 MB',
          resolution: '1080p'
        },
        {
          id: 2,
          title: 'Cultura e Valores HCP',
          description: 'Apresentação detalhada da cultura organizacional',
          thumbnail: '/placeholder.svg',
          duration: '12:45',
          category: 'Cultura',
          uploadDate: '2024-01-14',
          views: 198,
          status: 'published',
          fileSize: '340 MB',
          resolution: '1080p'
        },
        {
          id: 3,
          title: 'Compliance e Ética',
          description: 'Diretrizes de compliance e código de ética',
          thumbnail: '/placeholder.svg',
          duration: '8:20',
          category: 'Compliance',
          uploadDate: '2024-01-13',
          views: 156,
          status: 'draft',
          fileSize: '220 MB',
          resolution: '720p'
        },
        {
          id: 4,
          title: 'Processos Internos',
          description: 'Visão geral dos principais processos da empresa',
          thumbnail: '/placeholder.svg',
          duration: '15:10',
          category: 'Processos',
          uploadDate: '2024-01-12',
          views: 89,
          status: 'published',
          fileSize: '450 MB',
          resolution: '1080p'
        }
      ];
    },
  });
};

// Hook comum para categorias de vídeo
export const useVideoCategoriesQuery = () => {
  return useQuery({
    queryKey: ['video-categories'],
    queryFn: async () => {
      return ['all', 'Cultura', 'Compliance', 'Processos', 'Técnico'];
    },
  });
};

// Tipos comuns
export interface SearchAndFilterState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

export interface TabState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}