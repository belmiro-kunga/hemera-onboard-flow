import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase.rpc('get_upcoming_birthdays');
      
      if (error) throw error;
      
      setBirthdays(data || []);
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