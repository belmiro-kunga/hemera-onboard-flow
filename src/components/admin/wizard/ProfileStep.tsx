import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCompleteData } from "@/lib/validations/user";
import { Camera, Shield, ShieldCheck, Crown } from "lucide-react";

interface ProfileStepProps {
  form: UseFormReturn<UserCompleteData>;
}

const roleOptions = [
  { 
    value: "funcionario", 
    label: "Funcionário", 
    description: "Acesso básico ao sistema",
    icon: Shield
  },
  { 
    value: "admin", 
    label: "Administrador", 
    description: "Gestão de usuários e cursos",
    icon: ShieldCheck
  },
  { 
    value: "super_admin", 
    label: "Super Administrador", 
    description: "Acesso total ao sistema",
    icon: Crown
  },
];

export default function ProfileStep({ form }: ProfileStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Perfil e Permissões</h3>
        <p className="text-muted-foreground">
          Configure a foto do perfil e as permissões de acesso do usuário.
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          control={form.control}
          name="photo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                URL da Foto do Perfil
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://exemplo.com/foto.jpg"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Função no Sistema *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {role.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Sobre as Funções</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span><strong>Funcionário:</strong> Pode acessar cursos, realizar simulados e visualizar certificados</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span><strong>Administrador:</strong> Pode gerenciar usuários, cursos e visualizar relatórios</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span><strong>Super Admin:</strong> Acesso total, incluindo configurações do sistema</span>
          </div>
        </div>
      </div>
    </div>
  );
}