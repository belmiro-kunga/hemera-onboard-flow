import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Eye,
  EyeOff,
  Users,
  Settings
} from "lucide-react";

export default function MenuManager() {
  const [menus] = useState([
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciador de Menus</h3>
          <p className="text-sm text-muted-foreground">
            Configure menus dinâmicos com hierarquia e permissões
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((menu) => (
          <Card key={menu.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{menu.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    {menu.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Localização:</span>
                <Badge variant="outline">{menu.location}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Itens:</span>
                <span>{menu.items}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Funções:</span>
                <div className="flex gap-1">
                  {menu.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Configurar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <GripVertical className="h-3 w-3 mr-1" />
                  Ordenar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
}