import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Since we don't have notifications and notification_preferences tables yet,
// we'll use assignment_notifications as the base for notifications
export interface Notification {
  id: string;
  assignment_id: string;
  notification_type: string;
  email_sent: boolean;
  in_app_read: boolean;
  sent_at?: string;
  created_at: string;
}

// Hook para buscar notificações de assignments
export const useAssignmentNotifications = (limit = 20) => {
  return useQuery({
    queryKey: ["assignment-notifications", limit],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("assignment_notifications")
        .select(`
          *,
          course_assignments!inner(user_id)
        `)
        .eq("course_assignments.user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as any[];
    },
  });
};

// Hook para buscar contagem de notificações não lidas
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      const { count, error } = await supabase
        .from("assignment_notifications")
        .select("*", { count: "exact", head: true })
        .eq("in_app_read", false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

// Hook para marcar notificação como lida
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from("assignment_notifications")
        .update({ in_app_read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
};

// Hook para marcar todas as notificações como lidas
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("assignment_notifications")
        .update({ in_app_read: true })
        .eq("in_app_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    },
  });
};

// Hook para criar notificação de assignment
export const useCreateAssignmentNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      notificationType,
      emailSent = false
    }: {
      assignmentId: string;
      notificationType: string;
      emailSent?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("assignment_notifications")
        .insert({
          assignment_id: assignmentId,
          notification_type: notificationType,
          email_sent: emailSent,
          in_app_read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
};

// Hook para deletar notificação
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("assignment_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      toast({
        title: "Notificação removida",
        description: "A notificação foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a notificação.",
        variant: "destructive",
      });
    },
  });
};

// Hook para notificações em tempo real
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["realtime-notifications"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      // Setup realtime subscription for assignment notifications
      const channel = supabase
        .channel('assignment_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'assignment_notifications',
          },
          (payload) => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
          }
        )
        .subscribe();

      return channel;
    },
    enabled: true,
    staleTime: Infinity,
  });
};