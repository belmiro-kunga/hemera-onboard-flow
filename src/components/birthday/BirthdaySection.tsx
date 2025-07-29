import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift } from "lucide-react";
import BirthdayCard from "./BirthdayCard";
import { useBirthdays } from "@/hooks/useBirthdays";

const BirthdaySection = () => {
  const { birthdays, loading } = useBirthdays();
  const todayBirthdays = birthdays.filter(birthday => birthday.is_today);

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
              {loading ? "Carregando..." : `${birthdays.length} próximos`}
            </Badge>
            {!loading && todayBirthdays.length > 0 && (
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
        {loading ? (
          <div className="text-center py-12 text-muted-foreground animate-fade-in-up">
            <p className="text-base font-medium">Carregando aniversariantes...</p>
          </div>
        ) : birthdays.length > 0 ? (
          birthdays.map((birthday, index) => (
            <div 
              key={birthday.user_id} 
              className="animate-fade-in-up"
              style={{animationDelay: `${0.3 + index * 0.1}s`}}
            >
              <BirthdayCard
                employee={{
                  id: birthday.user_id,
                  name: birthday.name,
                  department: birthday.department || "Não informado",
                  position: birthday.job_position || "Não informado",
                  birthDate: birthday.birth_date,
                  avatar: birthday.photo_url,
                  email: birthday.email
                }}
                isToday={birthday.is_today}
                daysUntil={birthday.days_until_birthday}
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