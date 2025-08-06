import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Gift } from 'lucide-react';

interface BirthdayUser {
  id: string;
  name: string;
  birthday: string;
  avatar?: string;
}

interface BirthdayCardProps {
  upcomingBirthdays: BirthdayUser[];
}

export function BirthdayCard({ upcomingBirthdays }: BirthdayCardProps) {
  // Function to format date to display as "DD/MM"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Function to get days until birthday
  const getDaysUntilBirthday = (birthday: string) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'é hoje!';
    if (diffDays === 1) return 'é amanhã!';
    return `em ${diffDays} dias`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Próximos Aniversários
        </CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {upcomingBirthdays.length > 0 ? (
          <div className="space-y-4">
            {upcomingBirthdays.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(user.birthday)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getDaysUntilBirthday(user.birthday)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum aniversário próximo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
