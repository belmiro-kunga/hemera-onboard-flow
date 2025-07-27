import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Plus,
  Upload,
  FileText,
  Target
} from "lucide-react";
import { useAssignments } from "@/hooks/useAssignments";
import { useAssignmentTemplates } from "@/hooks/useAssignmentTemplates";
import AssignmentManager from "@/components/assignments/AssignmentManager";
import BulkAssignmentTool from "@/components/assignments/BulkAssignmentTool";
import AssignmentTemplates from "@/components/assignments/AssignmentTemplates";
import AssignmentReports from "@/components/assignments/AssignmentReports";

export default function CourseAssignmentAdmin() {
  const [activeTab, setActiveTab] = useState("individual");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Fetch basic statistics
  const { assignments, loading: assignmentsLoading } = useAssignments({ limit: 1000 });
  const { templates, loading: templatesLoading } = useAssignmentTemplates();

  // Calculate statistics
  const stats = {
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    overdueAssignments: assignments.filter(a => a.status === 'overdue').length,
    inProgressAssignments: assignments.filter(a => a.status === 'in_progress').length,
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.isActive).length,
  };

  const completionRate = stats.totalAssignments > 0 
    ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Atribuição de Cursos</h1>
            <p className="text-muted-foreground">
              Gerencie atribuições de cursos e simulados para funcionários
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setActiveTab("individual");
              setIsCreatingNew(true);
              // Scroll to the assignment form
              setTimeout(() => {
                const element = document.getElementById("assignment-form");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
                // Reset the creating state after a moment
                setTimeout(() => setIsCreatingNew(false), 2000);
              }, 100);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Atribuição
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atribuições</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgressAssignments} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedAssignments} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.overdueAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Ativos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTemplates}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalTemplates} templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Atribuições Individuais
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Atribuições em Massa
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          <Card className={isCreatingNew ? "ring-2 ring-primary ring-opacity-50 shadow-lg" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Atribuições Individuais
                {isCreatingNew && (
                  <Badge variant="secondary" className="ml-2 animate-pulse">
                    Nova Atribuição
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isCreatingNew 
                  ? "Selecione um funcionário e um curso para criar uma nova atribuição"
                  : "Atribua cursos e simulados a funcionários específicos"
                }
              </p>
            </CardHeader>
            <CardContent id="assignment-form">
              <AssignmentManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Atribuições em Massa
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Atribua cursos a múltiplos funcionários ou departamentos
              </p>
            </CardHeader>
            <CardContent>
              <BulkAssignmentTool />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Templates de Atribuição
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie templates de cursos por cargo ou departamento
              </p>
            </CardHeader>
            <CardContent>
              <AssignmentTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios e Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Acompanhe o progresso e gere relatórios detalhados
              </p>
            </CardHeader>
            <CardContent>
              <AssignmentReports />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {stats.overdueAssignments > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Users className="h-5 w-5" />
              Atenção: Atribuições Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Existem {stats.overdueAssignments} atribuições em atraso que requerem atenção.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setActiveTab("reports")}
              >
                Ver Relatório Detalhado
              </Button>
              <Button 
                variant="outline" 
                size="sm"
              >
                Enviar Lembretes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}