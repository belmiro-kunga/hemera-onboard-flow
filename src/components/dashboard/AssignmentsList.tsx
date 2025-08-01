import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Play,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CourseAssignment } from "@/types/assignment.types";

interface AssignmentsListProps {
  assignments: CourseAssignment[];
  urgentTasks: CourseAssignment[];
  nextActions: CourseAssignment[];
  isLoading: boolean;
}

export function AssignmentsList({ 
  assignments, 
  urgentTasks, 
  nextActions, 
  isLoading 
}: AssignmentsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <Card key={i} className="gradient-card border-0 shadow-elegant">
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-success" />;
      case "in_progress": return <Clock className="w-4 h-4 text-warning" />;
      default: return <BookOpen className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Tarefas Urgentes */}
      {urgentTasks.length > 0 && (
        <Card className="gradient-card border-0 shadow-elegant border-l-4 border-l-destructive animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Tarefas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentTasks.map((task) => {
              const daysLeft = getDaysUntilDue(task.dueDate);
              return (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {task.contentType === "course" ? "Curso" : "Simulado"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Vence em {daysLeft === 0 ? "hoje" : `${daysLeft} dia${daysLeft > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive">
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Próximas Ações */}
      <Card className="gradient-card border-0 shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Próximas Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
              <p>Parabéns! Todas as tarefas foram concluídas.</p>
            </div>
          ) : (
            nextActions.map((action) => {
              const daysLeft = getDaysUntilDue(action.dueDate);
              return (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-smooth"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(action.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {action.contentType === "course" ? "Curso" : "Simulado"}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {action.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysLeft !== null && daysLeft >= 0
                              ? daysLeft === 0 
                                ? "Vence hoje"
                                : `${daysLeft} dia${daysLeft > 1 ? 's' : ''} restante${daysLeft > 1 ? 's' : ''}`
                              : "Vencido"
                            }
                          </span>
                        )}
                        <Badge variant={getPriorityColor(action.priority)}>
                          {action.priority === "high" ? "Alta" : 
                           action.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                      </div>
                      {action.status === "in_progress" && (
                        <Progress value={Math.random() * 100} className="mt-2 h-2" />
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={action.status === "in_progress" ? "default" : "outline"}
                  >
                    {action.status === "in_progress" ? "Continuar" : "Iniciar"}
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Resumo de Todas as Atribuições */}
      <Card className="gradient-card border-0 shadow-elegant animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Resumo de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/20">
              <p className="text-2xl font-bold text-foreground">{assignments.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">
                {assignments.filter(a => a.status === "completed").length}
              </p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <p className="text-2xl font-bold text-warning">
                {assignments.filter(a => a.status === "in_progress").length}
              </p>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">
                {assignments.filter(a => a.status === "assigned").length}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}