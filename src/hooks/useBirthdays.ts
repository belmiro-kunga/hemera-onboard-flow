import { useState, useEffect } from "react";
import { database } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

export interface Birthday {
  user_id: string;
  name: string;
  email: string;
  department: string;
  job_position: string;
  birth_date: string;
  photo_url?: string;
  days_until_birthday: number;
  is_today: boolean;
}

export function useBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUpcomingBirthdays = async () => {
    setLoading(true);
    try {
      // Always use mock data for now since we're in development
      console.warn('🔧 Using mock birthdays data');

      // Generate some mock birthday data
      const mockBirthdays: Birthday[] = [
        {
          user_id: 'mock-user-1',
          name: 'João Silva',
          email: 'joao.silva@hcp.com',
          department: 'TI',
          job_position: 'Desenvolvedor',
          birth_date: '1990-03-15',
          days_until_birthday: 2,
          is_today: false
        },
        {
          user_id: 'mock-user-2',
          name: 'Maria Santos',
          email: 'maria.santos@hcp.com',
          department: 'RH',
          job_position: 'Analista de RH',
          birth_date: '1985-03-13',
          days_until_birthday: 0,
          is_today: true
        },
        {
          user_id: 'mock-user-3',
          name: 'Carlos Oliveira',
          email: 'carlos.oliveira@hcp.com',
          department: 'Financeiro',
          job_position: 'Analista Financeiro',
          birth_date: '1988-03-20',
          days_until_birthday: 7,
          is_today: false
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBirthdays(mockBirthdays);
    } catch (error: any) {
      console.error('Erro ao carregar aniversariantes:', error.message);
      
      // Set empty array on error to prevent crashes
      setBirthdays([]);
      
      toast({
        title: "Erro",
        description: "Não foi possível carregar os aniversariantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingBirthdays();
  }, []);

  return {
    birthdays,
    loading,
    refetch: fetchUpcomingBirthdays,
  };
}