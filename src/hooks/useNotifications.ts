import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'certificate';
  category: string;
  data: any;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  assignment_notifications: boolean;
  certificate_notifications: boolean;
  reminder_notifications: boolean;
  marketing_notifications: boolean;
}

// Hook para buscar notificações do usuário atual
export const useNotifications = (limit = 20) => {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Notification[];
    },
  });
};

// Hook para buscar contagem de notificações não lidas
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_unread_notification_count');
      if (error) throw error;
      return data as number;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

// Hook para marcar notificação como lida
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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

// Hook para criar notificação
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      title,
      message,
      type = 'info',
      category = 'system',
      data = {},
      expiresAt
    }: {
      userId: string;
      title: string;
      message: string;
      type?: string;
      category?: string;
      data?: any;
      expiresAt?: string;
    }) => {
      const { data: result, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: type,
        p_category: category,
        p_data: data,
        p_expires_at: expiresAt
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
};

// Hook para buscar preferências de notificação
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      // Create default preferences if not exists
      if (!data) {
        const { data: newPrefs, error: createError } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.user.id,
            email_notifications: true,
            push_notifications: true,
            assignment_notifications: true,
            certificate_notifications: true,
            reminder_notifications: true,
            marketing_notifications: false,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newPrefs as NotificationPreferences;
      }

      return data as NotificationPreferences;
    },
  });
};

// Hook para atualizar preferências de notificação
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("notification_preferences")
        .update(preferences)
        .eq("user_id", user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
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
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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

      // Setup realtime subscription
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.user.id}`,
          },
          (payload) => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
            
            // Show toast notification
            const notification = payload.new as Notification;
            // You could show a toast here or trigger a browser notification
          }
        )
        .subscribe();

      return channel;
    },
    enabled: true,
    staleTime: Infinity,
  });
};