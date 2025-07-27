import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Download,
  Calendar,
  BookOpen,
  Clock
} from "lucide-react";
import { useAssignments } from "@/hooks/useAssignments";
import { formatAngolaDate } from "@/lib/date-utils";

export default function AssignmentReports() {
  const [timeRange, setTimeRange] = useState("30");
  const [department, setDepartment] = useState("all");
  
  const { assignments, loading } = useAssignments({ limit: 1000 });

  // Calculate statistics
  const stats = {
    total: assignments.length,
    completed: assignments.filter(a => a.status === 'completed').length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
    assigned: assignments.filter(a => a.status === 'assigned').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Group by department
  const departmentStats = assignments.reduce((acc, assignment) => {
    const dept = assignment.user?.department || 'Sem Departamento';
    if (!acc[dept]) {
      acc[dept] = { total: 0, completed: 0, overdue: 0 };
    }
    acc[dept].total++;
    if (assignment.status === 'completed') acc[dept].completed++;
    if (assignment.status === 'overdue') acc[dept].overdue++;
    return acc;
  }, {} as Record<string, { total: number; completed: number; overdue: number }>);

  // Recent assignments
  const recentAssignments = assignments
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
    .slice(0, 10);

  // Overdue assignments
  const overdueAssignments = assignments
    .filter(a => a.status === 'overdue')
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Departamentos</SelectItem>
            {Object.keys(departmentStats).map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atribuições</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.assigned} aguardando início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              funcionários estudando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Desempenho por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departmentStats).map(([dept, data]) => {
                const completionRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dept}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {completionRate}%
                        </Badge>
                        {data.overdue > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {data.overdue} atrasadas
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{data.completed} de {data.total} concluídas</span>
                      <span>{data.total} total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atribuições Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atribuição recente
                </p>
              ) : (
                recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{assignment.course?.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {assignment.user?.name} • {assignment.user?.department}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAngolaDate.long(assignment.assignedAt)}
                      </p>
                    </div>
                    <Badge variant={
                      assignment.status === 'completed' ? 'default' :
                      assignment.status === 'overdue' ? 'destructive' :
                      assignment.status === 'in_progress' ? 'secondary' : 'outline'
                    } className="text-xs">
                      {assignment.status === 'completed' ? 'Concluído' :
                       assignment.status === 'overdue' ? 'Atrasado' :
                       assignment.status === 'in_progress' ? 'Em Andamento' : 'Atribuído'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Assignments Alert */}
      {overdueAssignments.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Atribuições Atrasadas ({overdueAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{assignment.course?.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {assignment.user?.name} • {assignment.user?.department}
                    </p>
                    {assignment.dueDate && (
                      <p className="text-xs text-destructive">
                        Venceu em: {formatAngolaDate.short(assignment.dueDate)}
                      </p>
                    )}
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Atrasado
                  </Badge>
                </div>
              ))}
              {overdueAssignments.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  E mais {overdueAssignments.length - 5} atribuições atrasadas...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}