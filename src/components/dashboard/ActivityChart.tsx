import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Activity } from "lucide-react";

interface ActivityData {
  date: string;
  points: number;
  activities: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  isLoading: boolean;
}

const chartConfig = {
  points: {
    label: "Pontos",
    color: "hsl(var(--primary))",
  },
  activities: {
    label: "Atividades",
    color: "hsl(var(--accent))",
  },
};

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="gradient-card border-0 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Atividade Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="gradient-card border-0 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Atividade Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Nenhuma atividade registrada nos últimos 7 dias
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico (últimos 7 dias)
  const chartData = data.map(item => ({
    ...item,
    day: new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
  }));

  return (
    <Card className="gradient-card border-0 shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Atividade Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="day" 
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="points" 
                fill="var(--color-points)"
                radius={[4, 4, 0, 0]}
                name="Pontos"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Estatísticas adicionais */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {data.reduce((sum, day) => sum + day.points, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total de Pontos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {data.reduce((sum, day) => sum + day.activities, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Atividades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {data.length}
            </p>
            <p className="text-xs text-muted-foreground">Dias Ativos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}