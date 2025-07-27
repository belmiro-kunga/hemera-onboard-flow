import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Target, 
  Award, 
  Star, 
  TrendingUp,
  Calendar,
  BookOpen,
  Zap
} from "lucide-react";
import { useUserLevel, useUserBadges, useUserPoints, useLeaderboard } from "@/hooks/useGamification";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  Trophy, Target, Award, Star, TrendingUp, Calendar, BookOpen, Zap,
  Crown: Trophy, Rocket: TrendingUp, GraduationCap: BookOpen
};

const colorMap = {
  primary: "bg-primary text-primary-foreground",
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  yellow: "bg-yellow-500 text-white",
  red: "bg-red-500 text-white",
  purple: "bg-purple-500 text-white",
  orange: "bg-orange-500 text-white",
  indigo: "bg-indigo-500 text-white",
  pink: "bg-pink-500 text-white",
  cyan: "bg-cyan-500 text-white"
};

export default function GamificationDashboard() {
  const { data: userLevel, isLoading: levelLoading } = useUserLevel();
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges();
  const { data: userPoints, isLoading: pointsLoading } = useUserPoints(5);
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(5);

  if (levelLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const progressPercentage = userLevel?.points_to_next_level 
    ? ((userLevel.total_points / (userLevel.total_points + userLevel.points_to_next_level)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                Nível {userLevel?.current_level || 1}
              </div>
              <p className="text-sm text-muted-foreground">Nível atual</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {userLevel?.total_points || 0}
              </div>
              <p className="text-sm text-muted-foreground">Pontos totais</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {userLevel?.courses_completed || 0}
              </div>
              <p className="text-sm text-muted-foreground">Cursos concluídos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {userLevel?.simulados_completed || 0}
              </div>
              <p className="text-sm text-muted-foreground">Simulados concluídos</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso para o próximo nível</span>
              <span>{userLevel?.points_to_next_level || 0} pontos restantes</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badgesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : userBadges && userBadges.length > 0 ? (
              <div className="space-y-3">
                {userBadges.slice(0, 5).map((userBadge) => {
                  const IconComponent = iconMap[userBadge.badge.icon_name as keyof typeof iconMap] || Award;
                  const colorClass = colorMap[userBadge.badge.icon_color as keyof typeof colorMap] || colorMap.primary;
                  
                  return (
                    <div key={userBadge.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{userBadge.badge.name}</p>
                        <p className="text-xs text-muted-foreground">{userBadge.badge.description}</p>
                      </div>
                    </div>
                  );
                })}
                {userBadges.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{userBadges.length - 5} mais conquistas
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Ainda não há conquistas. Complete cursos e simulados para ganhar badges!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pointsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : userPoints && userPoints.length > 0 ? (
              <div className="space-y-3">
                {userPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{point.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(point.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      +{point.points}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma atividade recente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.user_id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {entry.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Nível {entry.current_level}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {entry.total_points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Ranking indisponível
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}