import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Settings, BarChart3 } from "lucide-react";
import BadgesAdmin from "@/components/gamification/BadgesAdmin";
import GamificationDashboard from "@/components/gamification/GamificationDashboard";

export default function GamificationAdmin() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Sistema de Gamificação</h1>
          <p className="text-muted-foreground">
            Gerencie pontos, badges e conquistas dos usuários
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GamificationDashboard />
        </TabsContent>

        <TabsContent value="badges">
          <BadgesAdmin />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pontuação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em desenvolvimento: Configuração de pontos por atividade, multiplicadores e requisitos de certificado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em desenvolvimento: Relatórios de atividade dos usuários, conquistas mais populares e estatísticas de engajamento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}