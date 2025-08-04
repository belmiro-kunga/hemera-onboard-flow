import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Users, UserCheck, TrendingUp, UserPlus, MoreHorizontal, Eye, Edit, Trash2, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useUsers, type User } from '@/hooks/useUsers';
import UserWizard from '@/components/admin/UserWizard';
import UserEditDialog from '@/components/admin/UserEditDialog';
import UserViewDialog from '@/components/admin/UserViewDialog';
import UserDeleteDialog from '@/components/admin/UserDeleteDialog';
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { users, loading, updateUser, updateUserStatus, deleteUser } = useUsers();
  
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

  // Handler functions for CRUD operations
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleSaveUser = async (userId: string, userData: any) => {
    try {
      await updateUser(userId, userData);
      handleSuccess(toast, 'Usuário atualizado com sucesso!');
    } catch (error) {
      handleError(error, toast, 'Erro ao atualizar usuário');
    }
  };

  const handleConfirmDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      handleSuccess(toast, 'Usuário excluído com sucesso!');
    } catch (error) {
      handleError(error, toast, 'Erro ao excluir usuário');
    }
  };

  const handleExportUsers = () => {
    // Create CSV content
    const headers = ['Nome', 'Email', 'Departamento', 'Cargo', 'Função', 'Status', 'Criado em'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.department || ''}"`,
        `"${user.job_position || ''}"`,
        `"${user.role}"`,
        `"${user.is_active ? 'Ativo' : 'Inativo'}"`,
        `"${new Date(user.created_at).toLocaleDateString('pt-BR')}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    handleSuccess(toast, 'Lista de usuários exportada com sucesso!');
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
            variant="outline"
            size="sm"
            onClick={handleExportUsers}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
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
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
                            <UserCheck className="h-4 w-4 mr-2" />
                            {user.is_active ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
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

      {/* User Edit Dialog */}
      <UserEditDialog
        user={selectedUser}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveUser}
      />

      {/* User View Dialog */}
      <UserViewDialog
        user={selectedUser}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* User Delete Dialog */}
      <UserDeleteDialog
        user={selectedUser}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default UserManagement;