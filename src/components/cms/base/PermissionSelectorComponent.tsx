import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Key, Check, X } from "lucide-react";

export interface Permission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Role {
  id: string | number;
  name: string;
  permissions: string[];
}

interface PermissionSelectorProps {
  permissions: Permission[];
  roles: Role[];
  onPermissionChange?: (roleId: string | number, permissionId: string, enabled: boolean) => void;
  selectedRole?: Role;
  readOnly?: boolean;
  showMatrix?: boolean;
}

export const PermissionSelectorComponent = ({
  permissions,
  roles,
  onPermissionChange,
  selectedRole,
  readOnly = false,
  showMatrix = true
}: PermissionSelectorProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const categories = [...new Set(permissions.map(p => p.category))];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions.includes(permissionId) || role.permissions.includes("all");
  };

  const isDisabled = (role: Role) => {
    return role.permissions.includes("all") || readOnly;
  };

  const handlePermissionToggle = (roleId: string | number, permissionId: string, currentValue: boolean) => {
    if (!readOnly) {
      onPermissionChange?.(roleId, permissionId, !currentValue);
    }
  };

  if (selectedRole) {
    // Single role permission editor
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Permissões para {selectedRole.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{category}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategory(category)}
                >
                  {expandedCategories.includes(category) ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </Button>
              </div>
              
              {(expandedCategories.includes(category) || expandedCategories.length === 0) && (
                <div className="space-y-2 pl-4">
                  {permissions
                    .filter(p => p.category === category)
                    .map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="text-sm font-medium">{permission.name}</span>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          )}
                        </div>
                        <Switch
                          checked={hasPermission(selectedRole, permission.id)}
                          disabled={isDisabled(selectedRole)}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(selectedRole.id, permission.id, hasPermission(selectedRole, permission.id))
                          }
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
          
          {selectedRole.permissions.includes("all") && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Acesso Total</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Esta função tem acesso total ao sistema
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!showMatrix) {
    return null;
  }

  // Permission matrix for all roles
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Matriz de Permissões
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header with role names */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="flex-1">
                <span className="text-sm font-medium">Permissão</span>
              </div>
              <div className="flex gap-2">
                {roles.slice(0, 4).map((role) => (
                  <div key={role.id} className="w-16 text-center">
                    <Badge variant="outline" className="text-xs">
                      {role.name.substring(0, 6)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
              <div className="space-y-1">
                {permissions
                  .filter(p => p.category === category)
                  .map((permission) => (
                    <div key={permission.id} className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded">
                      <div className="flex-1">
                        <span className="text-sm">{permission.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {roles.slice(0, 4).map((role) => (
                          <div key={`${role.id}-${permission.id}`} className="w-16 flex justify-center">
                            <Switch
                              checked={hasPermission(role, permission.id)}
                              disabled={isDisabled(role)}
                              onCheckedChange={(checked) => 
                                handlePermissionToggle(role.id, permission.id, hasPermission(role, permission.id))
                              }
                              className="scale-75"
                            />
                          </div>
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
  );
};