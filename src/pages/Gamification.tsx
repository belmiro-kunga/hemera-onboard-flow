import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Target, 
  Award, 
  Star, 
  TrendingUp,
  Calendar,
  BookOpen,
  Zap,
  Crown,
  Rocket,
  GraduationCap
} from "lucide-react";
import { useUserLevel, useUserBadges, useUserPoints, useLeaderboard, useAllBadges } from "@/hooks/useGamification";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  Trophy, Target, Award, Star, TrendingUp, Calendar, BookOpen, Zap,
  Crown, Rocket, GraduationCap
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

export default function Gamification() {
  const { data: userLevel, isLoading: levelLoading } = useUserLevel();
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges();
  const { data: userPoints, isLoading: pointsLoading } = useUserPoints(10);
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(10);
  const { data: allBadges, isLoading: allBadgesLoading } = useAllBadges();

  if (levelLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
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

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Gamificação</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e conquistas
          </p>
        </div>
      </div>

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

      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="badges">Conquistas</TabsTrigger>
          <TabsTrigger value="activity">Atividades</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Earned Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Suas Conquistas ({userBadges?.length || 0})
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
                    {userBadges.map((userBadge) => {
                      const IconComponent = iconMap[userBadge.badge.icon_name as keyof typeof iconMap] || Award;
                      const colorClass = colorMap[userBadge.badge.icon_color as keyof typeof colorMap] || colorMap.primary;
                      
                      return (
                        <div key={userBadge.id} className="flex items-center gap-3 p-3 rounded-lg border bg-green-50">
                          <div className={`p-2 rounded-full ${colorClass}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{userBadge.badge.name}</p>
                            <p className="text-xs text-muted-foreground">{userBadge.badge.description}</p>
                            <p className="text-xs text-green-600">
                              Conquistado em {new Date(userBadge.earned_at).toLocaleDateString('pt-AO')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Ainda não há conquistas. Complete cursos e simulados para ganhar badges!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Available Badges */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Badges Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allBadgesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : allBadges && allBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allBadges.map((badge) => {
                      const IconComponent = iconMap[badge.icon_name as keyof typeof iconMap] || Award;
                      const colorClass = colorMap[badge.icon_color as keyof typeof colorMap] || colorMap.primary;
                      const isEarned = earnedBadgeIds.has(badge.id);
                      
                      return (
                        <div 
                          key={badge.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isEarned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${isEarned ? colorClass : 'bg-gray-300 text-gray-600'}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${isEarned ? 'text-green-700' : 'text-gray-600'}`}>
                              {badge.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                            <p className="text-xs text-blue-600">
                              Meta: {badge.criteria_value} {badge.criteria_type === 'points_total' ? 'pontos' : 
                                      badge.criteria_type === 'courses_completed' ? 'cursos' :
                                      badge.criteria_type === 'simulados_completed' ? 'simulados' :
                                      badge.criteria_type === 'level_reached' ? 'nível' : 'dias consecutivos'}
                            </p>
                          </div>
                          {isEarned && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              ✓ Conquistado
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma badge disponível no momento
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Histórico de Atividades
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
                    <div key={point.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{point.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(point.created_at).toLocaleDateString('pt-AO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                        +{point.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma atividade registrada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-primary'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {entry.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Nível {entry.current_level} • {entry.courses_completed} cursos • {entry.simulados_completed} simulados
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-lg">
                          {entry.total_points} pts
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.badge_count} badges
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Ranking indisponível no momento
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Próximos Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Próximo Nível</h4>
                    <Badge variant="outline">Nível {(userLevel?.current_level || 1) + 1}</Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {userLevel?.points_to_next_level || 0} pontos restantes
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Para obter certificados você precisa de:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 50 pontos mínimos para certificados de cursos</li>
                    <li>• 25 pontos mínimos para certificados de simulados</li>
                    <li>• 100% de conclusão + nota ≥ 70% nos simulados</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}