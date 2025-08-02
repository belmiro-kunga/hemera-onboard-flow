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

      const { data, error } = await database
        .from("user_levels")
        .select("*")
        .eq("user_id", user.id)
        .select_query();

      if (error) throw error;
      
      const userLevel = Array.isArray(data) ? data[0] : data;
      
      // Create initial level if doesn't exist
      if (!userLevel) {
        const { data: newLevelData, error: createError } = await database
          .from("user_levels")
          .insert({
            user_id: user.id,
            current_level: 1,
            total_points: 0,
            points_to_next_level: 100
          });
        
        if (createError) throw createError;
        const newLevel = Array.isArray(newLevelData) ? newLevelData[0] : newLevelData;
        return newLevel;
      }
      
      return userLevel;
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

      const { data, error } = await database
        .from("user_badges")
        .select(`
          *,
          badge:badges(*)
        `)
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .select_query();

      if (error) throw error;
      return data as UserBadge[];
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

      const { data, error } = await database
        .from("user_points")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)
        .select_query();

      if (error) throw error;
      return data as UserPoint[];
    },
    enabled: !!user,
  });
};

export const useLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      // Since get_leaderboard function may not exist yet, let's simulate it with a query
      const { data, error } = await database
        .from("user_levels")
        .select(`
          user_id,
          current_level,
          total_points,
          courses_completed,
          simulados_completed,
          profiles!inner(name)
        `)
        .order("total_points", { ascending: false })
        .limit(limit)
        .select_query();

      if (error) throw error;
      
      // Transform the data to match LeaderboardEntry interface
      const leaderboardData: LeaderboardEntry[] = data?.map(entry => ({
        user_id: entry.user_id,
        name: (entry.profiles as any)?.name || "Unknown",
        total_points: entry.total_points,
        current_level: entry.current_level,
        courses_completed: entry.courses_completed,
        simulados_completed: entry.simulados_completed,
        badge_count: 0 // Will need to be calculated separately
      })) || [];

      return leaderboardData;
    },
  });
};

export const useAllBadges = () => {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data, error } = await database
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("criteria_value", { ascending: true })
        .select_query();

      if (error) throw error;
      return data as Badge[];
    },
  });
};

export const useGamificationSettings = () => {
  return useQuery({
    queryKey: ["gamification-settings"],
    queryFn: async () => {
      const { data, error } = await database
        .from("gamification_settings")
        .select("*")
        .select_query();

      if (error) throw error;
      return data;
    },
  });
};

// Admin hooks
export const useCreateBadge = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (badge: Omit<Badge, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await database
        .from("badges")
        .insert(badge);

      if (error) throw error;
      const newBadge = Array.isArray(data) ? data[0] : data;
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
      const { data, error } = await database
        .from("badges")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      const updatedBadge = Array.isArray(data) ? data[0] : data;
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
      const { error } = await database
        .from("badges")
        .eq("id", id)
        .delete();

      if (error) throw error;
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