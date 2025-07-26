import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Cake, Calendar } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  birthDate: string;
  avatar?: string;
  email: string;
}

interface BirthdayCardProps {
  employee: Employee;
  isToday?: boolean;
  daysUntil: number;
}

const BirthdayCard = ({ employee, isToday, daysUntil }: BirthdayCardProps) => {
  const formatDate = (dateStr: string) => {
    const [month, day] = dateStr.split("-");
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("pt-BR", { 
      day: "numeric", 
      month: "short" 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] border-0 bg-card/90 backdrop-blur-md hover:-translate-y-1 cursor-pointer ${
      isToday ? "ring-2 ring-primary shadow-glow animate-pulse" : "hover:ring-1 hover:ring-primary/30"
    }`}>
      <CardContent className="p-5 relative overflow-hidden">
        {/* Background Gradient Effect */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isToday 
            ? "bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-100" 
            : "bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100"
        }`}></div>
        
        <div className="relative z-10 flex items-center gap-4">
          {/* Enhanced Avatar */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isToday ? "bg-primary/20 animate-pulse" : "bg-primary/10 group-hover:bg-primary/15"
            }`}></div>
            <Avatar className="h-14 w-14 relative z-10 transition-transform duration-300 group-hover:scale-110">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold text-lg border border-primary/30">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            {isToday && (
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <Cake className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Enhanced Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-foreground text-base truncate group-hover:text-primary transition-colors duration-300">
                {employee.name}
              </h4>
              {isToday && (
                <Badge variant="default" className="text-xs px-2 py-1 bg-gradient-to-r from-primary to-accent animate-pulse">
                  🎉 Hoje!
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground truncate mb-2 group-hover:text-foreground/80 transition-colors duration-300">
              {employee.department}
            </p>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{formatDate(employee.birthDate)}</span>
              </div>
              {!isToday && (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span className="text-primary font-bold text-sm">
                    {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayCard;