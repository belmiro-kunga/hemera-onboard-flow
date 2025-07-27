import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowLeft, ArrowRight } from "lucide-react";
import { userCompleteSchema, type UserCompleteData } from "@/lib/validations/user";
import { useUsers } from "@/hooks/useUsers";
import BasicInfoStep from "./wizard/BasicInfoStep";
import CredentialsStep from "./wizard/CredentialsStep";
import OrganizationalStep from "./wizard/OrganizationalStep";
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
  { id: 4, title: "Perfil", component: ProfileStep },
  { id: 5, title: "Revisão", component: ReviewStep },
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          
          {/* Steps Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center space-y-2">
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  ) : (
                    <Circle 
                      className={`h-8 w-8 ${
                        currentStep === step.id ? 'text-primary fill-primary/10' : 'text-muted-foreground'
                      }`} 
                    />
                  )}
                  <span className={`text-sm font-medium ${
                    currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-16 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="min-h-[400px]">
            {CurrentStepComponent && (
              <CurrentStepComponent form={form} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
              >
                Cancelar
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? "Criando..." : "Criar Usuário"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}