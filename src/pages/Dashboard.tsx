import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { PersonalStats } from "@/components/dashboard/PersonalStats";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { AssignmentsList } from "@/components/dashboard/AssignmentsList";
import { RecentAchievements } from "@/components/dashboard/RecentAchievements";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    userLevel,
    userBadges,
    recentPoints,
    userRanking,
    assignments,
    nextActions,
    urgentTasks,
    weeklyActivity,
    progressByCategory,
    isLoading,
    stats
  } = useDashboardData();

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Usuário";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Olá, {userName}! 👋
          </h2>
          <p className="text-lg text-muted-foreground">
            {urgentTasks.length > 0 
              ? `Você tem ${urgentTasks.length} tarefa${urgentTasks.length > 1 ? 's' : ''} urgente${urgentTasks.length > 1 ? 's' : ''}!`
              : "Continue sua jornada de aprendizado."}
          </p>
        </div>

        {/* Personal Stats */}
        <div className="mb-8">
          <PersonalStats stats={stats} userRanking={userRanking} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Assignments and Activity */}
          <div className="lg:col-span-2 space-y-8">
            <AssignmentsList 
              assignments={assignments || []}
              urgentTasks={urgentTasks}
              nextActions={nextActions}
              isLoading={false}
            />
            
            <ActivityChart 
              data={weeklyActivity}
              isLoading={false}
            />
          </div>

          {/* Right Column - Achievements and Progress */}
          <div className="space-y-6">
            <RecentAchievements 
              badges={userBadges}
              recentPoints={recentPoints || []}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;