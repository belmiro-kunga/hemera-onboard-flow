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
      .slice(0, 5);
  };

  const upcomingBirthdays = getUpcomingBirthdays();
  const todayBirthdays = upcomingBirthdays.filter(emp => emp.isToday);

  return (
    <Card className="w-full shadow-2xl border-0 bg-card/95 backdrop-blur-md hover:shadow-glow transition-all duration-500 hover:scale-[1.01]">
      <CardHeader className="text-center pb-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 shadow-lg animate-pulse">
              <Cake className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Aniversariantes
            </CardTitle>
          </div>
          
          <div className="flex items-center justify-center gap-3 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Badge variant="secondary" className="gap-2 px-3 py-1.5 hover:scale-105 transition-transform duration-200">
              <Gift className="h-4 w-4" />
              Próximos 5 dias
            </Badge>
            {todayBirthdays.length > 0 && (
              <Badge variant="default" className="gap-2 px-3 py-1.5 animate-pulse hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary to-accent">
                <Cake className="h-4 w-4" />
                {todayBirthdays.length} hoje!
              </Badge>
            )}
          </div>
          
          {/* Decorative Line */}
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full"></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-6 pb-6">
        {upcomingBirthdays.length > 0 ? (
          upcomingBirthdays.map((employee, index) => (
            <div 
              key={employee.id} 
              className="animate-fade-in-up"
              style={{animationDelay: `${0.3 + index * 0.1}s`}}
            >
              <BirthdayCard
                employee={employee}
                isToday={employee.isToday}
                daysUntil={employee.daysUntil}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground animate-fade-in-up">
            <div className="relative">
              <Cake className="h-16 w-16 mx-auto mb-4 opacity-30 animate-float" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
            </div>
            <p className="text-base font-medium">Nenhum aniversário próximo</p>
            <p className="text-sm mt-1">Mas sempre há motivos para celebrar! 🎉</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BirthdaySection;