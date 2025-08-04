import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, User, Mail, Building } from "lucide-react";
import type { User as UserType } from "@/hooks/useUsers";

interface UserDeleteDialogProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string) => Promise<void>;
}

export default function UserDeleteDialog({ 
  user, 
  open, 
  onOpenChange, 
  onConfirm 
}: UserDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(user.user_id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </p>
              
              {/* User Info Card */}
              <Card className="border-destructive/20">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.name}</span>
                      {getRoleBadge(user.role)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    
                    {user.department && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-3 w-3" />
                        {user.department} {user.job_position && `- ${user.job_position}`}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Warning Messages */}
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-destructive">
                    ⚠️ Consequências da exclusão:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>O usuário perderá acesso ao sistema</li>
                    <li>Dados de progresso e certificados serão mantidos</li>
                    <li>Histórico de atividades será preservado</li>
                    <li>O usuário pode ser reativado posteriormente</li>
                  </ul>
                </div>
              </div>

              {user.role === 'super_admin' && (
                <div className="bg-destructive/20 p-3 rounded-lg border border-destructive/30">
                  <p className="text-sm font-medium text-destructive">
                    ⚠️ ATENÇÃO: Este é um Super Administrador!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Certifique-se de que há outros administradores no sistema antes de prosseguir.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir Usuário"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}