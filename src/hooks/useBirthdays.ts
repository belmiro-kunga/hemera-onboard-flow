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
      // Check if we're in browser mode (mock data)
      const isBrowser = typeof window !== 'undefined';

      if (isBrowser) {
        // Mock data for browser
        console.warn('🔧 Using mock birthdays data');

        // Generate some mock birthday data
        const mockBirthdays: Birthday[] = [
          {
            user_id: 'mock-user-1',
            name: 'João Silva',
            email: 'joao@example.com',
            department: 'TI',
            job_position: 'Desenvolvedor',
            birth_date: '1990-03-15',
            days_until_birthday: 2,
            is_today: false
          },
          {
            user_id: 'mock-user-2',
            name: 'Maria Santos',
            email: 'maria@example.com',
            department: 'RH',
            job_position: 'Analista',
            birth_date: '1985-03-13',
            days_until_birthday: 0,
            is_today: true
          }
        ];

        setBirthdays(mockBirthdays);
      } else {
        // Server-side implementation
        try {
          // Try to use RPC function if available
          const { data, error } = await database.rpc('get_upcoming_birthdays');

          if (error) throw error;

          setBirthdays(data || []);
        } catch (rpcError) {
          // Fallback to manual query if RPC doesn't exist
          console.warn('RPC function not available, using fallback query');

          const { data, error } = await database
            .from('profiles')
            .select(`
              user_id,
              name,
              email,
              department,
              job_position,
              birth_date,
              photo_url
            `)
            .not('birth_date', 'is', null)
            .order('birth_date');

          if (error) throw error;

          // Calculate days until birthday manually
          const today = new Date();
          const birthdaysWithCalculation = (data || []).map((profile: any) => {
            const birthDate = new Date(profile.birth_date);
            const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

            // If birthday already passed this year, calculate for next year
            if (thisYearBirthday < today) {
              thisYearBirthday.setFullYear(today.getFullYear() + 1);
            }

            const timeDiff = thisYearBirthday.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            return {
              ...profile,
              days_until_birthday: daysDiff,
              is_today: daysDiff === 0
            };
          }).filter((birthday: any) => birthday.days_until_birthday <= 30) // Show upcoming 30 days
            .sort((a: any, b: any) => a.days_until_birthday - b.days_until_birthday);

          setBirthdays(birthdaysWithCalculation);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar aniversariantes:', error.message);
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