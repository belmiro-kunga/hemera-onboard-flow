import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { CheckCircle2, Circle, ArrowLeft, ArrowRight } from "lucide-react";
import { userCompleteSchema, type UserCompleteData } from "@/lib/validations/user";
import { useUsers } from "@/hooks/useUsers";
import BasicInfoStep from "./wizard/BasicInfoStep";
import CredentialsStep from "./wizard/CredentialsStep";
import OrganizationalStep from "./wizard/OrganizationalStep";
import BirthdayStep from "./wizard/BirthdayStep";
import ProfileStep from "./wizard/ProfileStep";
import ReviewStep from "./wizard/ReviewStep";

interface UserWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: "Informações Básicas", component: BasicInfoStep },
  { id: 2, title: "Credenciais", component: CredentialsStep },
  { id: 3, title: "Dados Organizacionais", component: OrganizationalStep },
  { id: 4, title: "Aniversário", component: BirthdayStep },
  { id: 5, title: "Perfil", component: ProfileStep },
  { id: 6, title: "Revisão", component: ReviewStep },
];

export default function UserWizard({ open, onOpenChange }: UserWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createUser } = useUsers();

  const form = useForm<UserCompleteData>({
    resolver: zodResolver(userCompleteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      department: "",
      job_position: "",
      manager_id: "",
      employee_id: "",
      start_date: new Date().toISOString().split('T')[0],
      birth_date: "",
      photo_url: "",
      role: "funcionario",
    },
  });

  const handleNext = async () => {
    const currentStepData = getCurrentStepFields();
    const isValid = await form.trigger(currentStepData);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ["name", "email", "phone"] as const;
      case 2:
        return ["password", "confirmPassword"] as const;
      case 3:
        return ["department", "job_position", "manager_id", "employee_id", "start_date"] as const;
      case 4:
        return ["birth_date"] as const;
      case 5:
        return ["photo_url", "role"] as const;
      default:
        return [] as const;
    }
  };

  const onSubmit = async (data: UserCompleteData) => {
    setIsSubmitting(true);
    try {
      const result = await createUser(data);
      if (result.success) {
        onOpenChange(false);
        form.reset();
        setCurrentStep(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setCurrentStep(1);
  };

  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold">Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex-shrink-0 space-y-3 pb-4">
          <Progress value={progress} className="w-full h-2" />
          
          {/* Steps Indicator - Responsive */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center space-y-1">
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Circle 
                      className={`h-6 w-6 ${
                        currentStep === step.id ? 'text-primary fill-primary/10' : 'text-muted-foreground'
                      }`} 
                    />
                  )}
                  <span className={`text-xs font-medium text-center ${
                    currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-8 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile Steps Indicator */}
          <div className="md:hidden flex items-center justify-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">
              Passo {currentStep} de {steps.length}
            </span>
            <span className="text-sm font-semibold text-primary">
              {steps[currentStep - 1]?.title}
            </span>
          </div>
        </div>

        {/* Step Content - Flexible height */}
        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {CurrentStepComponent && (
                  <CurrentStepComponent form={form} />
                )}
              </div>

              {/* Navigation Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 flex justify-between pt-4 mt-4 border-t bg-background">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    size="sm"
                  >
                    Cancelar
                  </Button>

                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <span className="hidden sm:inline">Próximo</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      {isSubmitting ? "Criando..." : "Criar Usuário"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}