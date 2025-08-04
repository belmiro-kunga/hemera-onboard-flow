import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Plus,
  Menu
} from "lucide-react";

export interface MenuItem {
  id: string | number;
  name: string;
  location: string;
  items: number;
  visible: boolean;
  roles: string[];
}

interface MenuListProps {
  menus: MenuItem[];
  onMenuAction?: (action: 'edit' | 'delete' | 'toggle' | 'configure' | 'sort', menu: MenuItem) => void;
  onCreateMenu?: () => void;
  emptyMessage?: string;
}

export const MenuListComponent = ({
  menus,
  onMenuAction,
  onCreateMenu,
  emptyMessage = "Nenhum menu encontrado"
}: MenuListProps) => {
  const handleAction = (action: 'edit' | 'delete' | 'toggle' | 'configure' | 'sort', menu: MenuItem) => {
    onMenuAction?.(action, menu);
  };

  if (menus.length === 0) {
    return (
      <div className="text-center py-12">
        <Menu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-4">
          Configure seu primeiro menu
        </p>
        {onCreateMenu && (
          <Button onClick={onCreateMenu}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Menu
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {menus.map((menu) => (
        <Card key={menu.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{menu.name}</CardTitle>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('toggle', menu)}
                >
                  {menu.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('edit', menu)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive"
                  onClick={() => handleAction('delete', menu)}
                >
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
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleAction('configure', menu)}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleAction('sort', menu)}
              >
                <GripVertical className="h-3 w-3 mr-1" />
                Ordenar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};