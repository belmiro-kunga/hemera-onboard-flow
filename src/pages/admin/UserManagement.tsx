import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Users, UserCheck, TrendingUp, UserPlus, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUsers } from '@/hooks/useUsers';
import UserWizard from '@/components/admin/UserWizard';
import { 
  useSearchAndFilter,
  createSearchFilter,
  handleError,
  handleSuccess
} from '@/lib/common-patterns';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { toast } = useToast();
  const [showUserWizard, setShowUserWizard] = useState(false);
  const { users, loading, updateUserStatus } = useUsers();
  
  // Usando hooks comuns para eliminar duplicação
  const {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter
  } = useSearchAndFilter('all', 'all');
  
  // Usando filtros comuns
  const searchFilter = createSearchFilter(searchTerm);
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchFilter(user, ['name', 'email']);
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && user.is_active) ||
                         (selectedFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    newThisMonth: users.filter(u => {
      const userDate = new Date(u.created_at);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, permissões e acompanhe o progresso da equipe.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newThisMonth} este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.active / stats.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Inativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.inactive / stats.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={selectedFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('active')}
            size="sm"
          >
            Ativos
          </Button>
          <Button
            variant={selectedFilter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('inactive')}
            size="sm"
          >
            Inativos
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowUserWizard(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Lista completa de usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando usuários...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Nenhum usuário encontrado</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>{user.job_position || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'super_admin' ? 'destructive' :
                        user.role === 'admin' ? 'default' : 'secondary'
                      }>
                        {user.role === 'super_admin' ? 'Super Admin' :
                         user.role === 'admin' ? 'Admin' : 'Funcionário'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                    <TableCell>
                      {user.last_login ? 
                        new Date(user.last_login).toLocaleDateString('pt-AO') : 
                        'Nunca'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Enviar Email</DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              try {
                                updateUserStatus(user.user_id, !user.is_active);
                                handleSuccess(toast, `Usuário ${user.is_active ? 'desativado' : 'ativado'} com sucesso!`);
                              } catch (error) {
                                handleError(error, toast, 'Erro ao alterar status do usuário');
                              }
                            }}
                          >
                            {user.is_active ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Wizard Modal */}
      <UserWizard 
        open={showUserWizard} 
        onOpenChange={setShowUserWizard} 
      />
    </div>
  );
};

export default UserManagement;