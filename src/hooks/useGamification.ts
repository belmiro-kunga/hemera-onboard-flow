import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  return useQuery({
    queryKey: ["user-level"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_levels")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      // Create initial level if doesn't exist
      if (!data) {
        const { data: newLevel, error: createError } = await supabase
          .from("user_levels")
          .insert({
            user_id: user.user.id,
            current_level: 1,
            total_points: 0,
            points_to_next_level: 100
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newLevel;
      }
      
      return data;
    },
  });
};

export const useUserBadges = () => {
  return useQuery({
    queryKey: ["user-badges"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          badge:badges(*)
        `)
        .eq("user_id", user.user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as UserBadge[];
    },
  });
};

export const useUserPoints = (limit = 10) => {
  return useQuery({
    queryKey: ["user-points", limit],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as UserPoint[];
    },
  });
};

export const useLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", {
        p_limit: limit
      });

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });
};

export const useAllBadges = () => {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("criteria_value", { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });
};

export const useGamificationSettings = () => {
  return useQuery({
    queryKey: ["gamification-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gamification_settings")
        .select("*");

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
      const { data, error } = await supabase
        .from("badges")
        .insert(badge)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("badges")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from("badges")
        .delete()
        .eq("id", id);

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