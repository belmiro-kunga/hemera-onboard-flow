import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, Building, Shield, Mail, Phone } from "lucide-react";
import { z } from "zod";
import type { User as UserType } from "@/hooks/useUsers";

const userEditSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  department: z.string().optional(),
  job_position: z.string().optional(),
  employee_id: z.string().optional(),
  role: z.enum(["funcionario", "admin", "super_admin"]),
  is_active: z.boolean(),
});

type UserEditData = z.infer<typeof userEditSchema>;

interface UserEditDialogProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, data: UserEditData) => Promise<void>;
}

export default function UserEditDialog({ user, open, onOpenChange, onSave }: UserEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<UserEditData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
      job_position: "",
      employee_id: "",
      role: "funcionario",
      is_active: true,
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        job_position: user.job_position || "",
        employee_id: user.employee_id || "",
        role: user.role as "funcionario" | "admin" | "super_admin",
        is_active: user.is_active,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UserEditData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await onSave(user.user_id, data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setActiveTab("basic");
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Usuário: {user.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="organizational">Dados Organizacionais</TabsTrigger>
            <TabsTrigger value="security">Segurança & Acesso</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                  
                  <TabsContent value="basic" className="space-y-6 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Informações Pessoais
                        </CardTitle>
                        <CardDescription>
                          Dados básicos do usuário
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome completo" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="email@empresa.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(11) 99999-9999" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="employee_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ID do Funcionário</FormLabel>
                                <FormControl>
                                  <Input placeholder="EMP001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* User Stats Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Informações do Sistema
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Criado em:</span>
                            <p className="font-medium">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Último acesso:</span>
                            <p className="font-medium">
                              {user.last_login ? 
                                new Date(user.last_login).toLocaleDateString('pt-BR') : 
                                'Nunca'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status atual:</span>
                            <p className="font-medium">
                              <Badge variant={user.is_active ? "default" : "secondary"}>
                                {user.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="organizational" className="space-y-6 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Dados Organizacionais
                        </CardTitle>
                        <CardDescription>
                          Informações sobre departamento e cargo
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: TI, RH, Financeiro" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="job_position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cargo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Desenvolvedor, Analista" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {user.manager_name && (
                          <>
                            <Separator />
                            <div>
                              <span className="text-sm text-muted-foreground">Gestor:</span>
                              <p className="font-medium">{user.manager_name}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Segurança e Permissões
                        </CardTitle>
                        <CardDescription>
                          Configurações de acesso e permissões do usuário
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Função no Sistema</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a função" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="funcionario">Funcionário</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="super_admin">Super Administrador</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Usuário Ativo
                                  </FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Permitir que o usuário acesse o sistema
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Função Atual: {getRoleBadge(user.role)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.role === 'super_admin' && "Acesso total ao sistema, incluindo configurações críticas."}
                            {user.role === 'admin' && "Acesso administrativo com permissões de gerenciamento."}
                            {user.role === 'funcionario' && "Acesso padrão às funcionalidades do sistema."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex justify-between pt-4 mt-4 border-t bg-background">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}