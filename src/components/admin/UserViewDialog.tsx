import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Shield, 
  Clock,
  UserCheck,
  Edit,
  Trash2
} from "lucide-react";
import type { User as UserType } from "@/hooks/useUsers";

interface UserViewDialogProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (user: UserType) => void;
  onDelete?: (user: UserType) => void;
}

export default function UserViewDialog({ 
  user, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete 
}: UserViewDialogProps) {
  
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: "destructive",
      admin: "default",
      funcionario: "secondary"
    } as const;
    
    const labels = {
      super_admin: "Super Admin",
      admin: "Admin",
      funcionario: "Funcionário"
    };

    return (
      <Badge variant={variants[role as keyof typeof variants] || "secondary"}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photo_url} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    {getRoleBadge(user.role)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(user)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Nome Completo</span>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Email</span>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  {user.phone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Telefone</span>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  )}
                  
                  {user.employee_id && (
                    <div>
                      <span className="text-sm text-muted-foreground">ID do Funcionário</span>
                      <p className="font-medium">{user.employee_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizational Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Dados Organizacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {user.department && (
                    <div>
                      <span className="text-sm text-muted-foreground">Departamento</span>
                      <p className="font-medium">{user.department}</p>
                    </div>
                  )}
                  
                  {user.job_position && (
                    <div>
                      <span className="text-sm text-muted-foreground">Cargo</span>
                      <p className="font-medium">{user.job_position}</p>
                    </div>
                  )}
                  
                  {user.manager_name && (
                    <div>
                      <span className="text-sm text-muted-foreground">Gestor</span>
                      <p className="font-medium">{user.manager_name}</p>
                    </div>
                  )}
                  
                  {user.start_date && (
                    <div>
                      <span className="text-sm text-muted-foreground">Data de Início</span>
                      <p className="font-medium">
                        {new Date(user.start_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Função</span>
                    <div className="mt-1">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        <UserCheck className="h-3 w-3 mr-1" />
                        {user.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Criado em</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Atividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Último Acesso</span>
                    <p className="font-medium">
                      {user.last_login ? 
                        new Date(user.last_login).toLocaleString('pt-BR') : 
                        'Nunca acessou'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Tempo no Sistema</span>
                    <p className="font-medium">
                      {(() => {
                        const created = new Date(user.created_at);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - created.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 30) {
                          return `${diffDays} dias`;
                        } else if (diffDays < 365) {
                          const months = Math.floor(diffDays / 30);
                          return `${months} ${months === 1 ? 'mês' : 'meses'}`;
                        } else {
                          const years = Math.floor(diffDays / 365);
                          return `${years} ${years === 1 ? 'ano' : 'anos'}`;
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Description */}
          <Card>
            <CardHeader>
              <CardTitle>Permissões da Função</CardTitle>
              <CardDescription>
                Descrição das permissões associadas à função atual do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                {user.role === 'super_admin' && (
                  <div>
                    <h4 className="font-medium mb-2 text-destructive">Super Administrador</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso total ao sistema, incluindo configurações críticas, gerenciamento de usuários, 
                      configurações de sistema e todas as funcionalidades administrativas.
                    </p>
                  </div>
                )}
                {user.role === 'admin' && (
                  <div>
                    <h4 className="font-medium mb-2">Administrador</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso administrativo com permissões de gerenciamento de usuários, conteúdo, 
                      relatórios e configurações básicas do sistema.
                    </p>
                  </div>
                )}
                {user.role === 'funcionario' && (
                  <div>
                    <h4 className="font-medium mb-2">Funcionário</h4>
                    <p className="text-sm text-muted-foreground">
                      Acesso padrão às funcionalidades do sistema, incluindo cursos, certificados, 
                      gamificação e recursos de aprendizado.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}