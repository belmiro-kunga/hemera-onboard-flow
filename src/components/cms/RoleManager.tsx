import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Key,
  Eye,
  Settings
} from "lucide-react";

export default function RoleManager() {
  const [roles] = useState([
    {
      id: 1,
      name: "Super Admin",
      description: "Acesso total ao sistema",
      userCount: 2,
      permissions: ["all"],
      color: "red"
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
      color: "gray"
    }
  ]);

  const [permissions] = useState([
    { id: "users", name: "Gerenciar Usuários", category: "Sistema" },
    { id: "content", name: "Gerenciar Conteúdo", category: "Conteúdo" },
    { id: "media", name: "Biblioteca de Mídia", category: "Conteúdo" },
    { id: "settings", name: "Configurações", category: "Sistema" },
    { id: "analytics", name: "Analytics", category: "Relatórios" },
    { id: "certificates", name: "Certificados", category: "Educação" },
    { id: "assignments", name: "Atribuições", category: "Educação" },
    { id: "gamification", name: "Gamificação", category: "Educação" }
  ]);

  const getRoleColor = (color: string) => {
    const colors = {
      red: "bg-red-100 text-red-800 border-red-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Sistema de Permissões</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie funções, permissões e controle de acesso
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Função
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border ${getRoleColor(role.color)}`} />
                  <CardTitle className="text-base">{role.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
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
              <p className="text-sm text-muted-foreground">{role.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{role.userCount} usuários</span>
                </div>
                <div className="flex items-center gap-1">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span>{role.permissions.length} permissões</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Configurar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Usuários
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Matriz de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Sistema", "Conteúdo", "Educação", "Relatórios"].map((category) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {permissions
                    .filter(p => p.category === category)
                    .map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{permission.name}</span>
                        <div className="flex gap-1">
                          {roles.slice(0, 3).map((role) => (
                            <Switch
                              key={`${role.id}-${permission.id}`}
                              checked={role.permissions.includes(permission.id) || role.permissions.includes("all")}
                              disabled={role.permissions.includes("all")}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Info */}
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
    </div>
  );
}