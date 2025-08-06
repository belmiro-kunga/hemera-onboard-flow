import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { AdminPanel } from './AdminPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, UserPlus, Users, Shield, GraduationCap, Download, Upload } from 'lucide-react';
import { userAPI } from '@/lib/api/users';
import type { User } from '@/hooks/useUsers';

interface CreateUserData {
  name: string;
  email: string;
  role: 'funcionario' | 'admin' | 'superadmin';
  password: string;
  birthday?: string;
  department?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    email: '',
    role: 'funcionario',
    password: '',
    birthday: '',
    department: ''
  });
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUsers();
        setUsers(response || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error("Não foi possível carregar os usuários. Tente novamente.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
      case 'super_admin': return <Shield className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'funcionario': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'funcionario': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const result = await userAPI.createUser({
        ...newUser,
        is_active: true
      });
      
      if (result.success && result.data) {
        setUsers(prev => [...prev, result.data]);
        setNewUser({ name: '', email: '', role: 'funcionario', password: '', birthday: '', department: '' });
        setIsCreateDialogOpen(false);
        toast.success(`${newUser.name} foi adicionado com sucesso.`);
      } else {
        throw new Error(result.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Não foi possível criar o usuário. Tente novamente.");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User> & { id: string }) => {
    try {
      const { id, ...updateData } = userData;
      await userAPI.updateUser(id, updateData);
      
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updateData } : u));
      setEditingUser(null);
      setIsEditDialogOpen(false);
      
      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Não foi possível atualizar o usuário. Tente novamente.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await userAPI.deleteUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Não foi possível excluir o usuário. Tente novamente.');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Cargo', 'Departamento', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.department || ''}"`,
        `"${user.is_active ? 'Ativo' : 'Inativo'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Lista de usuários exportada com sucesso.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Selecione um arquivo para importar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const usersToImport: CreateUserData[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const user: Partial<CreateUserData> = {};
            
            headers.forEach((header, index) => {
              const value = values[index] || '';
              switch (header.toLowerCase()) {
                case 'nome':
                  user.name = value;
                  break;
                case 'email':
                  user.email = value;
                  break;
                case 'cargo':
                  if (['admin', 'superadmin', 'super_admin', 'funcionario'].includes(value.toLowerCase())) {
                    user.role = value.toLowerCase() as 'funcionario' | 'admin' | 'superadmin';
                  }
                  break;
                case 'departamento':
                  user.department = value;
                  break;
                case 'data de nascimento':
                  user.birthday = value;
                  break;
                case 'status':
                  // Handle status if needed
                  break;
              }
            });

            if (user.name && user.email) {
              usersToImport.push({
                name: user.name,
                email: user.email,
                role: user.role || 'funcionario',
                password: 'senha123', // Default password for imported users
                department: user.department,
                birthday: user.birthday
              });
            }
          }
        }

        if (usersToImport.length === 0) {
          toast.error('Nenhum usuário válido encontrado no arquivo.');
          return;
        }

        // Import users one by one
        let successCount = 0;
        for (const userData of usersToImport) {
          try {
            const result = await userAPI.createUser(userData);
            if (result.success) {
              successCount++;
            }
          } catch (error) {
            console.error('Error importing user:', userData.name, error);
          }
        }

        if (successCount > 0) {
          toast.success(`${successCount} usuário(s) importado(s) com sucesso.`);
          // Refresh users list
          const response = await userAPI.getUsers();
          setUsers(response || []);
        } else {
          toast.error('Nenhum usuário foi importado. Verifique o formato do arquivo.');
        }

        setIsImportDialogOpen(false);
        setImportFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error processing import:', error);
        toast.error('Erro ao processar o arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(importFile);
  };

  const userStats = useMemo(() => ({
    total: users.length,
    superadmin: users.filter(u => u.role === 'superadmin' || u.role === 'super_admin').length,
    admin: users.filter(u => u.role === 'admin').length,
    funcionario: users.filter(u => u.role === 'funcionario').length,
    active: users.filter(u => u.is_active).length,
    pending: users.filter(u => !u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  }), [users]);

  return (
    <AdminPanel currentPath="/admin/usuarios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, roles e permissões do sistema
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo usuário ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cargo</label>
                  <Select value={newUser.role} onValueChange={(value: 'funcionario' | 'admin' | 'superadmin') => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funcionario">Funcionário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Senha</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Senha temporária"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Nascimento</label>
                  <Input
                    type="date"
                    value={newUser.birthday}
                    onChange={(e) => setNewUser(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Departamento</label>
                  <Input
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ex: RH, TI, Financeiro"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Criar Usuário
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Usuários</DialogTitle>
                <DialogDescription>
                  Faça upload de um arquivo CSV contendo a lista de usuários.
                  Formato esperado: Nome, Email, Cargo, Departamento, Data de Nascimento, Status
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input 
                    id="import-file" 
                    type="file" 
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Selecione um arquivo CSV para importar
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsImportDialogOpen(false);
                      setImportFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={!importFile}
                  >
                    Importar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total de Usuários</CardTitle>
              <CardDescription>Total de usuários cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-2xl font-bold">{userStats.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Administradores</CardTitle>
              <CardDescription>{`${userStats.admin} admin(s) + ${userStats.superadmin} superadmin(s)`}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-2xl font-bold">{userStats.admin + userStats.superadmin}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Funcionários</CardTitle>
              <CardDescription>Total de funcionários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-2xl font-bold">{userStats.funcionario}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>{`${userStats.active} ativos, ${userStats.pending} pendentes, ${userStats.inactive} inativos`}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {/* Assuming CheckCircle2 is available, otherwise replace with a placeholder or remove */}
                {/* <CheckCircle2 className="h-8 w-8 text-muted-foreground" /> */}
                <span className="ml-2 text-2xl font-bold">{`${userStats.active} ativos`}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="funcionario">Funcionário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              {filteredUsers.length} usuário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                          {getRoleIcon(user.role)}
                          {user.role === 'superadmin' || user.role === 'super_admin' ? 'Super Admin' : 
                           user.role === 'admin' ? 'Admin' : 'Funcionário'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.is_active ? 'active' : 'inactive')}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o usuário {user.name}? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value: 'funcionario' | 'admin' | 'superadmin') => setEditingUser(prev => prev ? { ...prev, role: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funcionario">Funcionário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={editingUser.is_active ? 'active' : 'inactive'} 
                    onValueChange={(value: 'active' | 'inactive') => setEditingUser(prev => prev ? { ...prev, is_active: value === 'active' } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => handleSaveUser({ ...editingUser, id: editingUser.id })}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminPanel>
  );
};

export default UserManagement;
