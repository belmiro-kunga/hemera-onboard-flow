import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Hook for search and filter functionality
export function useSearchAndFilter(initialCategory = 'all', initialFilter = 'all') {
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
}

// Create a search filter function
export function createSearchFilter(searchTerm: string) {
  return (item: any, fields: string[]) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return true;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return fields.some(field => {
      const value = getNestedValue(item, field);
      return value && value.toString().toLowerCase().includes(lowerSearchTerm);
    });
  };
}

// Create a category filter function
export function createCategoryFilter(category: string) {
  return (item: any, field: string) => {
    if (category === 'all') {
      return true;
    }

    const value = getNestedValue(item, field);
    return value === category;
  };
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Error handling utility
export function handleError(error: any, toast: any, defaultMessage = 'Ocorreu um erro') {
  console.error('Error:', error);
  
  const message = error?.message || error?.error || defaultMessage;
  
  toast({
    title: 'Erro',
    description: message,
    variant: 'destructive',
  });
}

// Success handling utility
export function handleSuccess(toast: any, message: string) {
  toast({
    title: 'Sucesso',
    description: message,
    variant: 'default',
  });
}

// Mock query hooks for videos (these would normally come from React Query)
export function useVideosQuery() {
  return {
    data: [],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

export function useVideoCategoriesQuery() {
  return {
    data: [],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}
