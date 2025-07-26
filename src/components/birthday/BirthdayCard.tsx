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
    <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-105 ${
      isToday ? "ring-2 ring-primary shadow-glow" : ""
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            {isToday && (
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <Cake className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground text-sm truncate">
                {employee.name}
              </h4>
              {isToday && (
                <Badge variant="default" className="text-xs">
                  Hoje!
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground truncate mb-1">
              {employee.department}
            </p>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(employee.birthDate)}</span>
              {!isToday && (
                <span className="text-primary font-medium">
                  ({daysUntil} dias)
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayCard;