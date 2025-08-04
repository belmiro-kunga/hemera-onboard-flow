import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { RoleListComponent, RoleItem } from "./base/RoleListComponent";
import { PermissionSelectorComponent, Permission } from "./base/PermissionSelectorComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { 
  Plus
} from "lucide-react";

export default function RoleManager() {
  const [roles] = useState<RoleItem[]>([
    {
      id: 1,
      name: "Super Admin",
      description: "Acesso total ao sistema",
      userCount: 2,
      permissions: ["all"],
      color: "red",
      isSystem: true
    },
    {
      id: 2,
      name: "Administrador",
      description: "Gerenciamento geral do sistema",
      userCount: 5,
      permissions: ["users", "content", "settings"],
      color: "blue"
    },
    {
      id: 3,
      name: "Editor",
      description: "Criação e edição de conteúdo",
      userCount: 12,
      permissions: ["content", "media"],
      color: "green"
    },
    {
      id: 4,
      name: "Usuário",
      description: "Acesso básico ao sistema",
      userCount: 156,
      permissions: ["view"],
      color: "gray",
      isSystem: true
    }
  ]);

  const [permissions] = useState<Permission[]>([
    { id: "users", name: "Gerenciar Usuários", category: "Sistema", description: "Criar, editar e excluir usuários" },
    { id: "content", name: "Gerenciar Conteúdo", category: "Conteúdo", description: "Criar e editar páginas e posts" },
    { id: "media", name: "Biblioteca de Mídia", category: "Conteúdo", description: "Upload e gerenciamento de arquivos" },
    { id: "settings", name: "Configurações", category: "Sistema", description: "Alterar configurações do sistema" },
    { id: "analytics", name: "Analytics", category: "Relatórios", description: "Visualizar relatórios e métricas" },
    { id: "certificates", name: "Certificados", category: "Educação", description: "Gerenciar templates e emissão" },
    { id: "assignments", name: "Atribuições", category: "Educação", description: "Criar e gerenciar atribuições" },
    { id: "gamification", name: "Gamificação", category: "Educação", description: "Configurar sistema de pontos e badges" }
  ]);

  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess } = useCommonHook();

  const handleRoleAction = (action: 'edit' | 'delete' | 'configure' | 'viewUsers', role: RoleItem) => {
    switch (action) {
      case 'edit':
        showSuccess(`Editando função: ${role.name}`);
        break;
      case 'delete':
        if (role.isSystem) {
          showSuccess('Funções do sistema não podem ser excluídas');
        } else {
          showSuccess(`Função "${role.name}" removida com sucesso`);
        }
        break;
      case 'configure':
        showSuccess(`Configurando permissões para: ${role.name}`);
        break;
      case 'viewUsers':
        showSuccess(`Visualizando usuários da função: ${role.name}`);
        break;
    }
  };

  const handleCreateRole = () => {
    showSuccess('Criando nova função...');
  };

  const handlePermissionChange = (roleId: string | number, permissionId: string, enabled: boolean) => {
    showSuccess(`Permissão ${permissionId} ${enabled ? 'concedida' : 'removida'} para função ${roleId}`);
  };

  const handleSave = async () => {
    const settings = { roles, permissions };
    await saveSettings(settings, 'role-manager');
  };

  const handleReset = async () => {
    await resetSettings('role-manager');
  };

  // Configuração das tabs
  const tabs = [
    {
      value: "roles",
      label: "Funções",
      content: (
        <RoleListComponent
          roles={roles}
          onRoleAction={handleRoleAction}
          onCreateRole={handleCreateRole}
        />
      )
    },
    {
      value: "permissions",
      label: "Matriz de Permissões",
      content: (
        <PermissionSelectorComponent
          permissions={permissions}
          roles={roles}
          onPermissionChange={handlePermissionChange}
          showMatrix={true}
        />
      )
    },
    {
      value: "features",
      label: "Funcionalidades",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades do Sistema de Permissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Gerenciamento de Funções:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Funções personalizadas</li>
                  <li>• Permissões granulares</li>
                  <li>• Atribuição múltipla</li>
                  <li>• Hierarquia de permissões</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Auditoria e Controle:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Logs de ações</li>
                  <li>• Controle baseado em recursos</li>
                  <li>• Auditoria de acessos</li>
                  <li>• Relatórios de segurança</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const headerActions = (
    <Button onClick={handleCreateRole}>
      <Plus className="h-4 w-4 mr-2" />
      Nova Função
    </Button>
  );

  return (
    <BaseSettingsComponent
      title="Sistema de Permissões"
      tabs={tabs}
      defaultTab="roles"
      onSave={handleSave}
      onReset={handleReset}
      headerActions={headerActions}
    />
  );
}