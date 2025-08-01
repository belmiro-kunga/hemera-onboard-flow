import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Trophy, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import type { UserBadge } from "@/hooks/useGamification";

interface RecentAchievementsProps {
  badges: UserBadge[];
  recentPoints: Array<{
    id: string;
    points: number;
    activity_type: string;
    description: string | null;
    created_at: string;
  }>;
  isLoading: boolean;
}

export function RecentAchievements({ badges, recentPoints, isLoading }: RecentAchievementsProps) {
  if (isLoading) {
    return (
      <Card className="gradient-card border-0 shadow-elegant">
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "course_completion":
        return "📚";
      case "simulado_completion":
        return "🎯";
      case "login_bonus":
        return "⚡";
      case "streak_bonus":
        return "🔥";
      default:
        return "⭐";
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case "course_completion":
        return "Curso Concluído";
      case "simulado_completion":
        return "Simulado Concluído";
      case "login_bonus":
        return "Bônus de Login";
      case "streak_bonus":
        return "Bônus de Sequência";
      default:
        return "Atividade";
    }
  };

  return (
    <div className="space-y-6">
      {/* Badges Recentes */}
      <Card className="gradient-card border-0 shadow-elegant animate-slide-in-right">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Conquistas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>Nenhuma conquista ainda.</p>
              <p className="text-sm">Continue estudando para desbloquear badges!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {badges.map((userBadge) => (
                <div 
                  key={userBadge.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-smooth"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{userBadge.badge.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(userBadge.earned_at), "d 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {userBadge.badge.criteria_value} pts
                  </Badge>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/gamification">
                  <Award className="w-4 h-4 mr-2" />
                  Ver Todas as Conquistas
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pontos Recentes */}
      <Card className="gradient-card border-0 shadow-elegant animate-slide-in-right animate-delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recentPoints || recentPoints.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>Nenhuma atividade recente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPoints.map((point) => (
                <div 
                  key={point.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActivityIcon(point.activity_type)}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {getActivityLabel(point.activity_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(point.created_at), "d/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">+{point.points}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}