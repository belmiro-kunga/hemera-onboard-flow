import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Plus, 
  Search, 
  Eye, 
  Trash2,
  FileText,
  Globe,
  Calendar,
  User
} from "lucide-react";

export default function PageManager() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [pages] = useState([
    {
      id: 1,
      title: "Página Inicial",
      slug: "/",
      status: "published",
      author: "Admin",
      lastModified: "2024-01-15",
      views: 1250
    },
    {
      id: 2,
      title: "Sobre a Empresa",
      slug: "/sobre",
      status: "published",
      author: "Admin",
      lastModified: "2024-01-14",
      views: 890
    },
    {
      id: 3,
      title: "Política de Privacidade",
      slug: "/privacidade",
      status: "draft",
      author: "Editor",
      lastModified: "2024-01-13",
      views: 0
    },
    {
      id: 4,
      title: "Termos de Uso",
      slug: "/termos",
      status: "published",
      author: "Admin",
      lastModified: "2024-01-12",
      views: 456
    }
  ]);

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

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciador de Páginas</h3>
          <p className="text-sm text-muted-foreground">
            Crie e edite páginas com editor WYSIWYG
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Página
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar páginas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Pages List */}
      <div className="space-y-4">
        {filteredPages.map((page) => (
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
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma página encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar os termos de busca" : "Crie sua primeira página"}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Página
          </Button>
        </div>
      )}

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Editor de Páginas - Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Editor WYSIWYG:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Editor visual intuitivo</li>
                <li>• Inserção de mídia e links</li>
                <li>• Formatação rica de texto</li>
                <li>• Preview em tempo real</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Gerenciamento:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• URLs personalizadas e SEO</li>
                <li>• Sistema de versionamento</li>
                <li>• Publicação/despublicação</li>
                <li>• Histórico de alterações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}