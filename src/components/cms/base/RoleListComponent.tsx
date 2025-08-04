import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Users,
  Key,
  Eye,
  Settings,
  Plus,
  Shield
} from "lucide-react";

export interface RoleItem {
  id: string | number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  color?: string;
  isSystem?: boolean;
}

interface RoleListProps {
  roles: RoleItem[];
  onRoleAction?: (action: 'edit' | 'delete' | 'configure' | 'viewUsers', role: RoleItem) => void;
  onCreateRole?: () => void;
  emptyMessage?: string;
}

export const RoleListComponent = ({
  roles,
  onRoleAction,
  onCreateRole,
  emptyMessage = "Nenhuma função encontrada"
}: RoleListProps) => {
  const getRoleColor = (color?: string) => {
    const colors = {
      red: "bg-red-100 text-red-800 border-red-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const handleAction = (action: 'edit' | 'delete' | 'configure' | 'viewUsers', role: RoleItem) => {
    onRoleAction?.(action, role);
  };

  if (roles.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-4">
          Crie sua primeira função de usuário
        </p>
        {onCreateRole && (
          <Button onClick={onCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Função
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => (
        <Card key={role.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full border ${getRoleColor(role.color)}`} />
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="outline" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('edit', role)}
                  disabled={role.isSystem}
                  title="Editar função"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleAction('delete', role)}
                  disabled={role.isSystem}
                  title="Excluir função"
                >
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
                <span>{role.userCount} usuário{role.userCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span>
                  {role.permissions.includes('all') 
                    ? 'Todas as permissões' 
                    : `${role.permissions.length} permissões`
                  }
                </span>
              </div>
            </div>

            {/* Permission badges */}
            {!role.permissions.includes('all') && role.permissions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
                {role.permissions.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{role.permissions.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {role.permissions.includes('all') && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Key className="h-3 w-3 mr-1" />
                Acesso Total
              </Badge>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleAction('configure', role)}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleAction('viewUsers', role)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Usuários
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};