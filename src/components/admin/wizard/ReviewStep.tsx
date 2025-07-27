import React from "react";
import { UseFormReturn } from "react-hook-form";
import { UserCompleteData } from "@/lib/validations/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Users, 
  Calendar, 
  Hash,
  Shield,
  ShieldCheck,
  Crown
} from "lucide-react";

interface ReviewStepProps {
  form: UseFormReturn<UserCompleteData>;
}

export default function ReviewStep({ form }: ReviewStepProps) {
  const formData = form.getValues();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrador";
      case "admin":
        return "Administrador";
      default:
        return "Funcionário";
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive" as const;
      case "admin":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  const formDataTyped = {
    ...formData,
    name: String(formData.name || ''),
    email: String(formData.email || ''),
    phone: String(formData.phone || ''),
    role: String(formData.role || 'funcionario'),
    department: String(formData.department || ''),
    job_position: String(formData.job_position || ''),
    employee_id: String(formData.employee_id || ''),
    start_date: String(formData.start_date || ''),
    photo_url: String(formData.photo_url || ''),
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Revisão dos Dados</h3>
        <p className="text-muted-foreground">
          Revise todas as informações antes de criar o usuário.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {formDataTyped.photo_url && (
                  <AvatarImage src={formDataTyped.photo_url} alt={formDataTyped.name} />
                )}
                <AvatarFallback>
                  {formDataTyped.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{formDataTyped.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {formDataTyped.email}
                </div>
                {formDataTyped.phone && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {formDataTyped.phone}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role and Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Função e Permissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getRoleVariant(formDataTyped.role)} className="flex items-center gap-2 w-fit">
              {getRoleIcon(formDataTyped.role)}
              {getRoleLabel(formDataTyped.role)}
            </Badge>
          </CardContent>
        </Card>

        {/* Organizational Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados Organizacionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formDataTyped.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Departamento:</span>
                <span>{formDataTyped.department}</span>
              </div>
            )}
            {formDataTyped.job_position && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Cargo:</span>
                <span>{formDataTyped.job_position}</span>
              </div>
            )}
            {formDataTyped.employee_id && (
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Matrícula:</span>
                <span>{formDataTyped.employee_id}</span>
              </div>
            )}
            {formDataTyped.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data de Início:</span>
                <span>{new Date(formDataTyped.start_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Senha:</span>
              <span className="ml-2 text-muted-foreground">
                {"•".repeat(String(formData.password || '').length)} (Definida)
              </span>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              O usuário receberá um email com as credenciais de acesso e poderá alterar a senha no primeiro login.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Importante</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• O usuário será criado com status ativo</li>
          <li>• Um email de boas-vindas será enviado automaticamente</li>
          <li>• As credenciais de acesso serão enviadas por email seguro</li>
          <li>• O usuário poderá alterar sua senha no primeiro acesso</li>
        </ul>
      </div>
    </div>
  );
}