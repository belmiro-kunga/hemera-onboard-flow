import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { MenuListComponent, MenuItem } from "./base/MenuListComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { 
  Plus
} from "lucide-react";

export default function MenuManager() {
  const [menus] = useState<MenuItem[]>([
    {
      id: 1,
      name: "Menu Principal",
      location: "header",
      items: 5,
      visible: true,
      roles: ["admin", "user"]
    },
    {
      id: 2,
      name: "Menu Lateral Admin",
      location: "sidebar",
      items: 8,
      visible: true,
      roles: ["admin"]
    },
    {
      id: 3,
      name: "Menu Footer",
      location: "footer",
      items: 3,
      visible: true,
      roles: ["admin", "user", "guest"]
    }
  ]);

  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess } = useCommonHook();

  const handleMenuAction = (action: 'edit' | 'delete' | 'toggle' | 'configure' | 'sort', menu: MenuItem) => {
    switch (action) {
      case 'edit':
        showSuccess(`Editando menu: ${menu.name}`);
        break;
      case 'delete':
        showSuccess(`Menu "${menu.name}" removido com sucesso`);
        break;
      case 'toggle':
        showSuccess(`Menu "${menu.name}" ${menu.visible ? 'ocultado' : 'exibido'}`);
        break;
      case 'configure':
        showSuccess(`Configurando menu: ${menu.name}`);
        break;
      case 'sort':
        showSuccess(`Ordenando itens do menu: ${menu.name}`);
        break;
    }
  };

  const handleCreateMenu = () => {
    showSuccess('Criando novo menu...');
  };

  const handleSave = async () => {
    const settings = { menus };
    await saveSettings(settings, 'menu-manager');
  };

  const handleReset = async () => {
    await resetSettings('menu-manager');
  };

  // Configuração das tabs
  const tabs = [
    {
      value: "menus",
      label: "Menus",
      content: (
        <MenuListComponent
          menus={menus}
          onMenuAction={handleMenuAction}
          onCreateMenu={handleCreateMenu}
        />
      )
    },
    {
      value: "features",
      label: "Funcionalidades",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Gerenciamento de Menus:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Interface drag-and-drop para ordenação</li>
                  <li>• Sistema de hierarquia e submenus</li>
                  <li>• Atribuição por função de usuário</li>
                  <li>• Ícones personalizados para itens</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Controle de Visibilidade:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Controle por perfil de usuário</li>
                  <li>• Menus condicionais por permissão</li>
                  <li>• Agendamento de publicação</li>
                  <li>• Preview em tempo real</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const headerActions = (
    <Button onClick={handleCreateMenu}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Menu
    </Button>
  );

  return (
    <BaseSettingsComponent
      title="Gerenciador de Menus"
      tabs={tabs}
      defaultTab="menus"
      onSave={handleSave}
      onReset={handleReset}
      headerActions={headerActions}
    />
  );
}