import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Award } from "lucide-react";
import { useAllBadges, useCreateBadge, useUpdateBadge, useDeleteBadge } from "@/hooks/useGamification";
import { Skeleton } from "@/components/ui/skeleton";

const criteriaTypes = [
  { value: "points_total", label: "Total de Pontos" },
  { value: "courses_completed", label: "Cursos Concluídos" },
  { value: "simulados_completed", label: "Simulados Concluídos" },
  { value: "level_reached", label: "Nível Alcançado" },
  { value: "streak_days", label: "Dias Consecutivos" },
];

const iconOptions = [
  "Award", "Trophy", "Star", "Target", "Crown", "Rocket", 
  "BookOpen", "GraduationCap", "Zap", "TrendingUp", "Calendar"
];

const colorOptions = [
  { value: "primary", label: "Primário" },
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "yellow", label: "Amarelo" },
  { value: "red", label: "Vermelho" },
  { value: "purple", label: "Roxo" },
  { value: "orange", label: "Laranja" },
  { value: "indigo", label: "Índigo" },
  { value: "pink", label: "Rosa" },
  { value: "cyan", label: "Ciano" },
];

interface BadgeFormData {
  name: string;
  description: string;
  icon_name: string;
  icon_color: string;
  criteria_type: string;
  criteria_value: number;
}

export default function BadgesAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);
  const [formData, setFormData] = useState<BadgeFormData>({
    name: "",
    description: "",
    icon_name: "Award",
    icon_color: "primary",
    criteria_type: "points_total",
    criteria_value: 0,
  });

  const { data: badges, isLoading } = useAllBadges();
  const createBadge = useCreateBadge();
  const updateBadge = useUpdateBadge();
  const deleteBadge = useDeleteBadge();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBadge) {
        await updateBadge.mutateAsync({
          id: editingBadge.id,
          ...formData,
        });
      } else {
        await createBadge.mutateAsync(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving badge:", error);
    }
  };

  const handleEdit = (badge: any) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon_name: badge.icon_name,
      icon_color: badge.icon_color,
      criteria_type: badge.criteria_type,
      criteria_value: badge.criteria_value,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta badge?")) {
      await deleteBadge.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setEditingBadge(null);
    setFormData({
      name: "",
      description: "",
      icon_name: "Award",
      icon_color: "primary",
      criteria_type: "points_total",
      criteria_value: 0,
    });
  };

  const getCriteriaLabel = (type: string) => {
    return criteriaTypes.find(ct => ct.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Badges</h1>
          <p className="text-muted-foreground">
            Configure badges e conquistas para motivar os usuários
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBadge ? "Editar Badge" : "Nova Badge"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="icon">Ícone</Label>
                <Select
                  value={formData.icon_name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(icon => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="color">Cor</Label>
                <Select
                  value={formData.icon_color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon_color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="criteria_type">Critério</Label>
                <Select
                  value={formData.criteria_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, criteria_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {criteriaTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="criteria_value">Valor do Critério</Label>
                <Input
                  id="criteria_value"
                  type="number"
                  value={formData.criteria_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, criteria_value: parseInt(e.target.value) || 0 }))}
                  required
                  min="1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBadge ? "Atualizar" : "Criar"} Badge
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {badges?.map((badge) => (
          <Card key={badge.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {badge.name}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(badge)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(badge.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {badge.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Critério:</span>
                  <Badge variant="outline">
                    {getCriteriaLabel(badge.criteria_type)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor:</span>
                  <span className="font-medium">{badge.criteria_value}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ícone:</span>
                  <Badge variant="secondary">
                    {badge.icon_name}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cor:</span>
                  <div className={`w-4 h-4 rounded-full bg-${badge.icon_color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}