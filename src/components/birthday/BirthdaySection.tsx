import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift } from "lucide-react";
import BirthdayCard from "./BirthdayCard";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  birthDate: string; // MM-DD format
  avatar?: string;
  email: string;
}

// Mock data for employees
const employees: Employee[] = [
  {
    id: "1",
    name: "Ana Silva",
    department: "Recursos Humanos",
    position: "Gerente de RH",
    birthDate: "01-28",
    email: "ana.silva@hcp.com",
  },
  {
    id: "2",
    name: "Carlos Santos",
    department: "Tecnologia",
    position: "Desenvolvedor Senior",
    birthDate: "01-30",
    email: "carlos.santos@hcp.com",
  },
  {
    id: "3",
    name: "Mariana Costa",
    department: "Marketing",
    position: "Analista de Marketing",
    birthDate: "02-02",
    email: "mariana.costa@hcp.com",
  },
  {
    id: "4",
    name: "João Oliveira",
    department: "Vendas",
    position: "Consultor Comercial",
    birthDate: "02-05",
    email: "joao.oliveira@hcp.com",
  },
  {
    id: "5",
    name: "Fernanda Lima",
    department: "Financeiro",
    position: "Analista Financeira",
    birthDate: "02-08",
    email: "fernanda.lima@hcp.com",
  },
  {
    id: "6",
    name: "Roberto Pereira",
    department: "Operações",
    position: "Supervisor",
    birthDate: "02-12",
    email: "roberto.pereira@hcp.com",
  },
  {
    id: "7",
    name: "Juliana Rocha",
    department: "Qualidade",
    position: "Analista de Qualidade",
    birthDate: "02-15",
    email: "juliana.rocha@hcp.com",
  },
];

const BirthdaySection = () => {
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    return employees
      .map((employee) => {
        const [month, day] = employee.birthDate.split("-").map(Number);
        
        // Calculate days until birthday
        let daysUntil = 0;
        const thisYear = today.getFullYear();
        const birthday = new Date(thisYear, month - 1, day);
        
        if (birthday < today) {
          // Birthday this year has passed, calculate for next year
          birthday.setFullYear(thisYear + 1);
        }
        
        daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const isToday = month === currentMonth && day === currentDay;
        
        return {
          ...employee,
          daysUntil,
          isToday,
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 6);
  };

  const upcomingBirthdays = getUpcomingBirthdays();
  const todayBirthdays = upcomingBirthdays.filter(emp => emp.isToday);

  return (
    <Card className="w-full shadow-lg border-0 bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <Cake className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">Aniversariantes</CardTitle>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Gift className="h-3 w-3" />
            Próximos 6 dias
          </Badge>
          {todayBirthdays.length > 0 && (
            <Badge variant="default" className="gap-1 animate-pulse">
              <Cake className="h-3 w-3" />
              {todayBirthdays.length} hoje!
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {upcomingBirthdays.length > 0 ? (
          upcomingBirthdays.map((employee) => (
            <BirthdayCard
              key={employee.id}
              employee={employee}
              isToday={employee.isToday}
              daysUntil={employee.daysUntil}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Cake className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum aniversário próximo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BirthdaySection;