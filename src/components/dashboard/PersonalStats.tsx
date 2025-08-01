import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Star, 
  TrendingUp, 
  Award,
  BookOpen,
  Trophy,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

interface PersonalStatsProps {
  stats: {
    totalPoints: number;
    currentLevel: number;
    pointsToNext: number;
    completedCourses: number;
    completedSimulados: number;
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    badgeCount: number;
  };
  userRanking: number | null;
}

export function PersonalStats({ stats, userRanking }: PersonalStatsProps) {
  const progressToNext = stats.pointsToNext > 0 ? 
    Math.round(((100 - stats.pointsToNext) / 100) * 100) : 100;

  const completionRate = stats.totalAssignments > 0 ? 
    Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Progresso Geral */}
      <Card className="gradient-card border-0 shadow-elegant animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Progresso Geral</p>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
          <Progress value={completionRate} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            {stats.completedAssignments} de {stats.totalAssignments} tarefas
          </p>
        </CardContent>
      </Card>

      {/* Pontos e Nível */}
      <Card className="gradient-card border-0 shadow-elegant animate-fade-in animate-delay-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pontos Totais</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-accent" />
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Nível {stats.currentLevel}</span>
              <span>Nível {stats.currentLevel + 1}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.pointsToNext} pontos para o próximo nível
          </p>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card className="gradient-card border-0 shadow-elegant animate-fade-in animate-delay-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Conquistas</p>
              <p className="text-2xl font-bold text-foreground">{stats.badgeCount}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {stats.completedCourses} cursos
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {stats.completedSimulados} simulados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card className="gradient-card border-0 shadow-elegant animate-fade-in animate-delay-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ranking Atual</p>
              <p className="text-2xl font-bold text-foreground">
                {userRanking ? `${userRanking}°` : '--'}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/gamification">
              <Trophy className="w-4 h-4 mr-2" />
              Ver Ranking
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Tarefas Pendentes */}
      {stats.pendingAssignments > 0 && (
        <Card className="gradient-card border-0 shadow-elegant animate-fade-in animate-delay-400 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tarefas Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingAssignments}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}