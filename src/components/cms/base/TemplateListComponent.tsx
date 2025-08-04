import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Eye, 
  Copy, 
  Trash2,
  Download,
  Plus,
  FileText
} from "lucide-react";

export interface TemplateItem {
  id: string | number;
  name: string;
  type: string;
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  usageCount?: number;
  author?: string;
}

interface TemplateListProps {
  templates: TemplateItem[];
  onTemplateAction?: (action: 'view' | 'edit' | 'copy' | 'delete' | 'download', template: TemplateItem) => void;
  onCreateTemplate?: () => void;
  emptyMessage?: string;
  getTypeColor?: (type: string) => string;
  getTypeLabel?: (type: string) => string;
}

export const TemplateListComponent = ({
  templates,
  onTemplateAction,
  onCreateTemplate,
  emptyMessage = "Nenhum template encontrado",
  getTypeColor = (type: string) => 'bg-blue-100 text-blue-800',
  getTypeLabel = (type: string) => type
}: TemplateListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const handleAction = (action: 'view' | 'edit' | 'copy' | 'delete' | 'download', template: TemplateItem) => {
    onTemplateAction?.(action, template);
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-4">
          Crie seu primeiro template
        </p>
        {onCreateTemplate && (
          <Button onClick={onCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base truncate" title={template.name}>
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('view', template)}
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('edit', template)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('copy', template)}
                  title="Duplicar"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Badge variant="secondary" className={getTypeColor(template.type)}>
                {getTypeLabel(template.type)}
              </Badge>
              <Badge variant="secondary" className={getStatusColor(template.status)}>
                {getStatusLabel(template.status)}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Modificado: {template.lastModified}</p>
              {template.usageCount !== undefined && (
                <p>Usado {template.usageCount} vezes</p>
              )}
              {template.author && (
                <p>Autor: {template.author}</p>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleAction('edit', template)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction('download', template)}
                title="Download"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction('delete', template)}
                className="text-destructive hover:text-destructive"
                title="Excluir"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};