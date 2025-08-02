import { useQuery } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLevel, useUserBadges, useUserPoints } from "./useGamification";
import { useMyAssignments } from "./useAssignments";

// Hook personalizado para dados do dashboard do funcionário
export const useDashboardData = () => {
  const { user } = useAuth();
  
  // Dados de gamificação
  const { data: userLevel, isLoading: levelLoading } = useUserLevel();
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges();
  const { data: recentPoints, isLoading: pointsLoading } = useUserPoints(5);
  
  // Atribuições do usuário
  const { data: assignments, isLoading: assignmentsLoading } = useMyAssignments();
  
  // Ranking posição do usuário
  const { data: userRanking, isLoading: rankingLoading } = useQuery({
    queryKey: ["user-ranking", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await database
        .from("user_levels")
        .select("user_id, total_points, profiles!inner(name)")
        .order("total_points", { ascending: false })
        .select_query();
      
      if (error) throw error;
      
      const userPosition = data.findIndex(entry => entry.user_id === user.id) + 1;
      return userPosition > 0 ? userPosition : null;
    },
    enabled: !!user?.id,
  });

  // Dados de engajamento (atividade dos últimos 7 dias)
  const { data: weeklyActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["weekly-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await database
        .from("user_points")
        .select("points, created_at, activity_type")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true })
        .select_query();
      
      if (error) throw error;
      
      // Agrupar por dia
      const dailyActivity = data.reduce((acc, point) => {
        const date = new Date(point.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, points: 0, activities: 0 };
        }
        acc[date].points += point.points;
        acc[date].activities += 1;
        return acc;
      }, {} as Record<string, { date: string; points: number; activities: number }>);
      
      return Object.values(dailyActivity);
    },
    enabled: !!user?.id,
  });

  // Progresso por categoria
  const { data: progressByCategory, isLoading: categoryLoading } = useQuery({
    queryKey: ["progress-by-category", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Buscar progresso de cursos por categoria
      const { data: courseProgress, error: courseError } = await database
        .from("course_enrollments")
        .select(`
          progress_percentage,
          video_courses!inner(category)
        `)
        .eq("user_id", user.id)
        .select_query();
      
      if (courseError) throw courseError;
      
      // Agrupar por categoria
      const categoryProgress = courseProgress.reduce((acc, enrollment) => {
        const category = (enrollment.video_courses as any)?.category || "Geral";
        if (!acc[category]) {
          acc[category] = { total: 0, completed: 0, courses: 0 };
        }
        acc[category].total += enrollment.progress_percentage;
        acc[category].courses += 1;
        if (enrollment.progress_percentage === 100) {
          acc[category].completed += 1;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number; courses: number }>);
      
      return Object.entries(categoryProgress).map(([category, data]) => ({
        category,
        averageProgress: data.courses > 0 ? Math.round(data.total / data.courses) : 0,
        completedCourses: data.completed,
        totalCourses: data.courses,
      }));
    },
    enabled: !!user?.id,
  });

  // Próximas ações prioritárias
  const nextActions = assignments
    ?.filter(a => a.status !== "completed")
    ?.sort((a, b) => {
      // Priorizar por: high > medium > low, depois por data de vencimento
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    ?.slice(0, 5) || [];

  // Notificações de prazo
  const urgentTasks = assignments
    ?.filter(a => {
      if (a.status === "completed" || !a.dueDate) return false;
      const dueDate = new Date(a.dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue >= 0;
    }) || [];

  const isLoading = levelLoading || badgesLoading || pointsLoading || 
                   assignmentsLoading || rankingLoading || activityLoading || categoryLoading;

  return {
    // Dados básicos do usuário
    user,
    userLevel,
    userBadges: userBadges?.slice(0, 3) || [], // Últimas 3 badges
    recentPoints,
    
    // Posição no ranking
    userRanking,
    
    // Atribuições e ações
    assignments,
    nextActions,
    urgentTasks,
    
    // Dados analíticos
    weeklyActivity: weeklyActivity || [],
    progressByCategory: progressByCategory || [],
    
    // Estados de carregamento
    isLoading,
    
    // Estatísticas derivadas
    stats: {
      totalPoints: userLevel?.total_points || 0,
      currentLevel: userLevel?.current_level || 1,
      pointsToNext: userLevel?.points_to_next_level || 100,
      completedCourses: userLevel?.courses_completed || 0,
      completedSimulados: userLevel?.simulados_completed || 0,
      totalAssignments: assignments?.length || 0,
      completedAssignments: assignments?.filter(a => a.status === "completed").length || 0,
      pendingAssignments: assignments?.filter(a => a.status !== "completed").length || 0,
      badgeCount: userBadges?.length || 0,
    }
  };
};