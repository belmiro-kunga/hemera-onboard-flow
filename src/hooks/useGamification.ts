import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  total_points: number;
  points_to_next_level: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string | null;
  courses_completed: number;
  simulados_completed: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  icon_color: string;
  criteria_type: string;
  criteria_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface UserPoint {
  id: string;
  user_id: string;
  points: number;
  activity_type: string;
  source_id: string | null;
  description: string | null;
  multiplier: number;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_points: number;
  current_level: number;
  courses_completed: number;
  simulados_completed: number;
  badge_count: number;
}

export const useUserLevel = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-level"],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      console.warn('🔧 Using mock user level data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock user level data
      return {
        id: 'mock-level-1',
        user_id: user.id,
        current_level: 3,
        total_points: 750,
        points_to_next_level: 250,
        current_streak_days: 5,
        longest_streak_days: 12,
        last_activity_date: new Date().toISOString(),
        courses_completed: 4,
        simulados_completed: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },
    enabled: !!user,
  });
};

export const useUserBadges = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-badges"],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      console.warn('🔧 Using mock user badges data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Return mock user badges data
      return [
        {
          id: 'mock-user-badge-1',
          user_id: user.id,
          badge_id: 'badge-1',
          earned_at: new Date().toISOString(),
          badge: {
            id: 'badge-1',
            name: 'Primeiro Login',
            description: 'Fez o primeiro login no sistema',
            icon_name: 'Trophy',
            icon_color: 'primary',
            criteria_type: 'login_count',
            criteria_value: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      ] as UserBadge[];
    },
    enabled: !!user,
  });
};

export const useUserPoints = (limit = 10) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-points", limit],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      console.warn('🔧 Using mock user points data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock user points data
      return [
        {
          id: 'mock-point-1',
          user_id: user.id,
          points: 50,
          activity_type: 'course_completion',
          source_id: 'course-1',
          description: 'Completou o curso de Cultura HCP',
          multiplier: 1,
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 'mock-point-2',
          user_id: user.id,
          points: 25,
          activity_type: 'quiz_completion',
          source_id: 'quiz-1',
          description: 'Completou quiz de Compliance',
          multiplier: 1,
          created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ] as UserPoint[];
    },
    enabled: !!user,
  });
};

export const useLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      console.warn('🔧 Using mock leaderboard data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Return mock leaderboard data
      return [
        {
          user_id: 'user-1',
          name: 'Ana Silva',
          total_points: 1250,
          current_level: 5,
          courses_completed: 8,
          simulados_completed: 4,
          badge_count: 6
        },
        {
          user_id: 'user-2',
          name: 'Carlos Santos',
          total_points: 980,
          current_level: 4,
          courses_completed: 6,
          simulados_completed: 3,
          badge_count: 4
        },
        {
          user_id: 'user-3',
          name: 'Maria Oliveira',
          total_points: 750,
          current_level: 3,
          courses_completed: 4,
          simulados_completed: 2,
          badge_count: 3
        }
      ] as LeaderboardEntry[];
    },
  });
};

export const useAllBadges = () => {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      console.warn('🔧 Using mock all badges data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock badges data
      return [
        {
          id: 'badge-1',
          name: 'Primeiro Login',
          description: 'Fez o primeiro login no sistema',
          icon_name: 'Trophy',
          icon_color: 'primary',
          criteria_type: 'login_count',
          criteria_value: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'badge-2',
          name: 'Primeiro Curso',
          description: 'Completou o primeiro curso',
          icon_name: 'BookOpen',
          icon_color: 'blue',
          criteria_type: 'courses_completed',
          criteria_value: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'badge-3',
          name: 'Estudante Dedicado',
          description: 'Completou 5 cursos',
          icon_name: 'GraduationCap',
          icon_color: 'green',
          criteria_type: 'courses_completed',
          criteria_value: 5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as Badge[];
    },
  });
};

export const useGamificationSettings = () => {
  return useQuery({
    queryKey: ["gamification-settings"],
    queryFn: async () => {
      console.warn('🔧 Using mock gamification settings data');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Return mock settings data
      return {
        points_per_course: 50,
        points_per_quiz: 25,
        points_per_simulado: 100,
        level_threshold: 100,
        streak_bonus_multiplier: 1.5
      };
    },
  });
};

// Admin hooks
export const useCreateBadge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (badge: Omit<Badge, "id" | "created_at" | "updated_at">) => {
      console.warn('🔧 Using mock create badge');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock created badge
      const newBadge = {
        ...badge,
        id: `mock-badge-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newBadge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-badges"] });
      toast({
        title: "Badge criada",
        description: "Nova badge foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar badge.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBadge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Badge> & { id: string }) => {
      console.warn('🔧 Using mock update badge');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock updated badge
      const updatedBadge = {
        id,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      return updatedBadge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-badges"] });
      toast({
        title: "Badge atualizada",
        description: "Badge foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar badge.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBadge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.warn('🔧 Using mock delete badge');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock successful deletion
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-badges"] });
      toast({
        title: "Badge excluída",
        description: "Badge foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao excluir badge.",
        variant: "destructive",
      });
    },
  });
};