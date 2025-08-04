import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Eye, 
  Trash2,
  Globe,
  Calendar,
  User,
  Plus
} from "lucide-react";

export interface PageItem {
  id: string | number;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  lastModified: string;
  views: number;
}

interface PageListProps {
  pages: PageItem[];
  onPageAction?: (action: 'view' | 'edit' | 'delete', page: PageItem) => void;
  onCreatePage?: () => void;
  emptyMessage?: string;
}

export const PageListComponent = ({
  pages,
  onPageAction,
  onCreatePage,
  emptyMessage = "Nenhuma página encontrada"
}: PageListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const handleAction = (action: 'view' | 'edit' | 'delete', page: PageItem) => {
    onPageAction?.(action, page);
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-4">
          Crie sua primeira página
        </p>
        {onCreatePage && (
          <Button onClick={onCreatePage}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Página
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <Card key={page.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium truncate">{page.title}</h4>
                  <Badge variant="secondary" className={getStatusColor(page.status)}>
                    {getStatusText(page.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>{page.slug}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{page.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{page.lastModified}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{page.views} visualizações</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('view', page)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleAction('edit', page)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleAction('delete', page)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};