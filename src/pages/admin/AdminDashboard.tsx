
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Award,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const stats = [
    { title: 'Total Usuários', value: '247', change: '+12 novos', icon: Users, color: 'text-blue-600' },
    { title: 'Módulos Ativos', value: '38', change: '5 pendentes', icon: BookOpen, color: 'text-green-600' },
    { title: 'Taxa Conclusão', value: '85%', change: '+5% vs mês ant.', icon: Target, color: 'text-purple-600' },
    { title: 'Engajamento', value: '92%', change: '+3% vs semana ant.', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const engagementData = [
    { name: 'Seg', value: 65 },
    { name: 'Ter', value: 78 },
    { name: 'Qua', value: 82 },
    { name: 'Qui', value: 88 },
    { name: 'Sex', value: 95 },
    { name: 'Sáb', value: 45 },
    { name: 'Dom', value: 32 }
  ];

  const departmentData = [
    { name: 'TI', value: 35, color: '#8884d8' },
    { name: 'RH', value: 25, color: '#82ca9d' },
    { name: 'Vendas', value: 20, color: '#ffc658' },
    { name: 'Marketing', value: 15, color: '#ff7300' },
    { name: 'Outros', value: 5, color: '#8dd1e1' }
  ];

  const alerts = [
    { type: 'warning', message: '15 usuários com progresso atrasado', action: 'Ver Detalhes' },
    { type: 'info', message: '3 módulos precisam de revisão', action: 'Revisar' },
    { type: 'error', message: '8 feedbacks negativos para análise', action: 'Analisar' }
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do sistema de onboarding HCP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Último mês
          </Button>
          <Button variant="corporate" size="sm">
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-corporate hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-success mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-accent/10 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-corporate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Engajamento Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-corporate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Distribuição por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {departmentData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="shadow-corporate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Alertas e Ações Necessárias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  alert.type === 'warning' ? 'bg-warning/20 text-warning' :
                  alert.type === 'error' ? 'bg-destructive/20 text-destructive' :
                  'bg-primary/20 text-primary'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="text-foreground">{alert.message}</span>
              </div>
              <Button variant="outline" size="sm">
                {alert.action}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-corporate hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">Gerenciar Usuários</h3>
            <p className="text-sm text-muted-foreground">Adicionar, editar e organizar usuários</p>
          </CardContent>
        </Card>

        <Card className="shadow-corporate hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">Criar Conteúdo</h3>
            <p className="text-sm text-muted-foreground">Novos módulos e materiais</p>
          </CardContent>
        </Card>

        <Card className="shadow-corporate hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">Relatórios</h3>
            <p className="text-sm text-muted-foreground">Analytics e insights detalhados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
