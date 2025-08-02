import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Save,
  User,
  Building2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { database } from '@/lib/database';
import { toast } from 'sonner';
import { OrganizationalChart } from '@/components/presentation/OrganizationalChart';
import { OrganizationalChartNode } from '@/hooks/useCompanyPresentation';

interface ChartPosition {
  id?: string;
  parent_id?: string;
  name: string;
  position: string;
  department?: string;
  photo_url?: string;
  bio?: string;
  order_position: number;
  is_active: boolean;
  show_in_presentation: boolean;
}

const OrganizationalChartAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<ChartPosition[]>([]);
  const [chartData, setChartData] = useState<OrganizationalChartNode[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [editingPosition, setEditingPosition] = useState<ChartPosition | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const defaultPosition: ChartPosition = {
    name: '',
    position: '',
    department: '',
    photo_url: '',
    bio: '',
    order_position: 0,
    is_active: true,
    show_in_presentation: true
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch positions
      const { data: positionsData, error: positionsError } = await database
        .from('organizational_chart')
        .select('*')
        .order('order_position')
        .select_query();

      if (positionsError) throw positionsError;

      setPositions(positionsData || []);
      buildChartData(positionsData || []);

      // Fetch departments
      const { data: departmentsData, error: departmentsError } = await database
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .select_query();

      if (departmentsError) throw departmentsError;
      setDepartments(departmentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = (positions: ChartPosition[]) => {
    const nodeMap = new Map<string, OrganizationalChartNode>();
    
    // First pass: create all nodes
    positions.forEach(pos => {
      if (pos.id) {
        nodeMap.set(pos.id, {
          id: pos.id,
          parent_id: pos.parent_id,
          name: pos.name,
          position: pos.position,
          department: pos.department,
          photo_url: pos.photo_url,
          bio: pos.bio,
          order_position: pos.order_position,
          children: []
        });
      }
    });

    // Second pass: build hierarchy
    const rootNodes: OrganizationalChartNode[] = [];
    positions.forEach(pos => {
      if (pos.id) {
        const node = nodeMap.get(pos.id)!;
        if (pos.parent_id) {
          const parent = nodeMap.get(pos.parent_id);
          if (parent) {
            parent.children!.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      }
    });

    setChartData(rootNodes);
  };

  const handleSave = async (position: ChartPosition) => {
    try {
      if (position.id) {
        // Update existing position
        const { error } = await database
          .from('organizational_chart')
          .update(position)
          .eq('id', position.id);
        
        if (error) throw error;
        toast.success('Posição atualizada com sucesso!');
      } else {
        // Create new position
        const { data, error } = await database
          .from('organizational_chart')
          .insert([position]);
        
        if (error) throw error;
        toast.success('Posição criada com sucesso!');
      }

      setIsDialogOpen(false);
      setEditingPosition(null);
      fetchData();
    } catch (error) {
      console.error('Error saving position:', error);
      toast.error('Erro ao salvar posição');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta posição?')) return;

    try {
      const { error } = await database
        .from('organizational_chart')
        .eq('id', id)
        .delete();
      
      if (error) throw error;
      toast.success('Posição excluída com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Erro ao excluir posição');
    }
  };

  const handleFileUpload = async (file: File, positionId: string) => {
    try {
      // TODO: Implement local file storage
      console.log('File upload would be handled here:', file.name);
      
      // For now, create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      
      if (editingPosition) {
        setEditingPosition(prev => prev ? {
          ...prev,
          photo_url: tempUrl
        } : null);
      }

      toast.success('Foto carregada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da foto');
    }
  };

  const movePosition = async (id: string, direction: 'up' | 'down') => {
    const position = positions.find(p => p.id === id);
    if (!position) return;

    const siblings = positions.filter(p => p.parent_id === position.parent_id);
    const currentIndex = siblings.findIndex(p => p.id === id);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetPosition = siblings[currentIndex - 1];
      await swapPositions(position, targetPosition);
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      const targetPosition = siblings[currentIndex + 1];
      await swapPositions(position, targetPosition);
    }
  };

  const swapPositions = async (pos1: ChartPosition, pos2: ChartPosition) => {
    try {
      const temp = pos1.order_position;
      
      await database
        .from('organizational_chart')
        .update({ order_position: pos2.order_position })
        .eq('id', pos1.id);
      
      await database
        .from('organizational_chart')
        .update({ order_position: temp })
        .eq('id', pos2.id);
      
      fetchData();
    } catch (error) {
      console.error('Error swapping positions:', error);
      toast.error('Erro ao reordenar posições');
    }
  };

  const PositionForm: React.FC<{ position: ChartPosition; onSave: (pos: ChartPosition) => void }> = ({ 
    position, 
    onSave 
  }) => {
    const [formData, setFormData] = useState(position);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da pessoa"
            />
          </div>

          <div>
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Cargo ou função"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Select
              value={formData.department || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="parent">Supervisor</Label>
            <Select
              value={formData.parent_id || 'none'}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                parent_id: value === 'none' ? undefined : value 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (Nível raiz)</SelectItem>
                {positions.filter(p => p.id !== formData.id).map(pos => (
                  <SelectItem key={pos.id} value={pos.id!}>
                    {pos.name} - {pos.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Biografia/Descrição</Label>
          <Textarea
            id="bio"
            value={formData.bio || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Breve descrição sobre a pessoa"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="photo">Foto</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.photo_url} alt={formData.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                value={formData.photo_url || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                placeholder="URL da foto"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Foto
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && formData.id) {
                    handleFileUpload(file, formData.id);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_active: checked }))
              }
            />
            <Label>Ativo</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.show_in_presentation}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, show_in_presentation: checked }))
              }
            />
            <Label>Mostrar na apresentação</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Organograma
          </h1>
          <p className="text-muted-foreground">
            Gerencie a estrutura organizacional da empresa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPosition(defaultPosition);
                setIsDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Posição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPosition?.id ? 'Editar Posição' : 'Nova Posição'}
              </DialogTitle>
            </DialogHeader>
            {editingPosition && (
              <PositionForm 
                position={editingPosition} 
                onSave={handleSave}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Chart Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visualização do Organograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <OrganizationalChart 
              nodes={chartData}
              interactive={true}
            />
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Organograma vazio
              </h3>
              <p className="text-muted-foreground">
                Adicione posições para começar a construir o organograma
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Positions List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Posições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={position.photo_url} alt={position.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{position.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {position.position}
                      {position.department && ` • ${position.department}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => movePosition(position.id!, 'up')}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => movePosition(position.id!, 'down')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPosition(position);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(position.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationalChartAdmin;