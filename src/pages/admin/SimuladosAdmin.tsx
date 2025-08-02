import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, Users, Clock, BarChart3, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { database } from '@/lib/database';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SimuladoWizard } from '@/components/admin/SimuladoWizard';
import { 
  useSearchAndFilter,
  createSearchFilter,
  createCategoryFilter,
  handleError,
  handleSuccess
} from '@/lib/common-patterns';

interface Simulado {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  is_active: boolean;
  created_at: string;
  _count?: {
    attempts: number;
    questions: number;
  };
}

const SimuladosAdmin = () => {
  const { toast } = useToast();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingSimulado, setEditingSimulado] = useState<Simulado | null>(null);
  
  // Usando hooks comuns para eliminar duplicação
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory
  } = useSearchAndFilter();

  const loadSimulados = async () => {
    try {
      const { data, error } = await database
        .from('simulados')
        .select(`
          *,
          questoes(count),
          simulado_attempts(count)
        `)
        .order('created_at', { ascending: false })
        .select_query();

      if (error) throw error;

      const simuladosWithCounts = data?.map(simulado => ({
        ...simulado,
        _count: {
          questions: simulado.questoes?.length || 0,
          attempts: simulado.simulado_attempts?.length || 0
        }
      })) || [];

      setSimulados(simuladosWithCounts);
    } catch (error) {
      handleError(error, toast, 'Não foi possível carregar os simulados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulados();
  }, []);

  const handleToggleActive = async (simulado: Simulado) => {
    try {
      const { error } = await database
        .from('simulados')
        .update({ is_active: !simulado.is_active })
        .eq('id', simulado.id);

      if (error) throw error;

      handleSuccess(toast, `Simulado ${simulado.is_active ? 'desativado' : 'ativado'} com sucesso.`);
      loadSimulados();
    } catch (error) {
      handleError(error, toast, 'Não foi possível alterar o status do simulado.');
    }
  };

  const handleDelete = async (simulado: Simulado) => {
    if (!confirm(`Tem certeza que deseja excluir o simulado "${simulado.title}"?`)) {
      return;
    }

    try {
      const { error } = await database
        .from('simulados')
        .eq('id', simulado.id)
        .delete();

      if (error) throw error;

      handleSuccess(toast, 'Simulado excluído com sucesso.');
      loadSimulados();
    } catch (error) {
      handleError(error, toast, 'Não foi possível excluir o simulado.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Simulados</h1>
          <p className="text-muted-foreground">Gerencie os simulados da plataforma</p>
        </div>
        
        <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSimulado ? 'Editar Simulado' : 'Criar Novo Simulado'}
              </DialogTitle>
              <DialogDescription>
                Use o assistente para criar ou editar um simulado com questões.
              </DialogDescription>
            </DialogHeader>
            <SimuladoWizard 
              simulado={editingSimulado} 
              onSuccess={() => {
                setIsWizardOpen(false);
                setEditingSimulado(null);
                loadSimulados();
              }}
              onCancel={() => {
                setIsWizardOpen(false);
                setEditingSimulado(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {simulados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum simulado encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando seu primeiro simulado para a plataforma.
            </p>
            <Button onClick={() => setIsWizardOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Simulado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulados.map((simulado) => (
            <Card key={simulado.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{simulado.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={simulado.is_active ? 'default' : 'secondary'}
                        className={simulado.is_active ? 'bg-green-100 text-green-800' : ''}
                      >
                        {simulado.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(simulado.difficulty)}
                      >
                        {getDifficultyLabel(simulado.difficulty)}
                      </Badge>
                    </div>
                  </div>
                </div>
                {simulado.description && (
                  <CardDescription className="line-clamp-2">
                    {simulado.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{simulado.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>{simulado._count?.questions || 0} questões</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <span>{simulado._count?.attempts || 0} tentativas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{simulado.total_questions} questões</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSimulado(simulado);
                      setIsWizardOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={simulado.is_active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(simulado)}
                    className="flex-1"
                  >
                    {simulado.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(simulado)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimuladosAdmin;