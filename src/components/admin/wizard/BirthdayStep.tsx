import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Cake } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserCompleteData } from "@/lib/validations/user";

interface BirthdayStepProps {
  form: UseFormReturn<UserCompleteData>;
}

const BirthdayStep = ({ form }: BirthdayStepProps) => {
  const birthDate = form.watch("birth_date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    birthDate ? new Date(birthDate) : undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      form.setValue("birth_date", formattedDate);
    } else {
      form.setValue("birth_date", "");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Cake className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Data de Aniversário</h3>
        <p className="text-muted-foreground">
          Informe a data de nascimento (opcional)
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <div className="flex gap-2">
            {/* Input manual */}
            <Input
              id="birth_date"
              type="date"
              value={birthDate || ""}
              onChange={(e) => {
                form.setValue("birth_date", e.target.value);
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value));
                } else {
                  setSelectedDate(undefined);
                }
              }}
              max={new Date().toISOString().split('T')[0]}
              className="flex-1"
            />
            
            {/* Calendar picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Escolher data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta informação será usada para exibir aniversários na página de login.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthdayStep;