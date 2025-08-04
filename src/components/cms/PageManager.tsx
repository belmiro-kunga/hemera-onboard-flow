import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { PageListComponent, PageItem } from "./base/PageListComponent";
import { SearchFilterComponent } from "./base/SearchFilterComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { useSearchAndFilter } from "@/lib/common-patterns";
import { 
  Plus, 
  FileText
} from "lucide-react";

export default function PageManager() {
  const { searchTerm, setSearchTerm } = useSearchAndFilter();
  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess } = useCommonHook();
  
  const [pages] = useState<PageItem[]>([
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

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageAction = (action: 'view' | 'edit' | 'delete', page: PageItem) => {
    switch (action) {
      case 'view':
        showSuccess(`Visualizando página: ${page.title}`);
        break;
      case 'edit':
        showSuccess(`Editando página: ${page.title}`);
        break;
      case 'delete':
        showSuccess(`Página "${page.title}" removida com sucesso`);
        break;
    }
  };

  const handleCreatePage = () => {
    showSuccess('Criando nova página...');
  };

  const handleSave = async () => {
    const settings = { searchTerm };
    await saveSettings(settings, 'page-manager');
  };

  const handleReset = async () => {
    await resetSettings('page-manager');
    setSearchTerm('');
  };

  // Configuração das tabs
  const tabs = [
    {
      value: "pages",
      label: "Páginas",
      content: (
        <div className="space-y-6">
          <SearchFilterComponent
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar páginas..."
          />

          <PageListComponent
            pages={filteredPages}
            onPageAction={handlePageAction}
            onCreatePage={handleCreatePage}
            emptyMessage={searchTerm ? "Nenhuma página encontrada" : "Crie sua primeira página"}
          />
        </div>
      )
    },
    {
      value: "features",
      label: "Funcionalidades",
      content: (
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
      )
    }
  ];

  const headerActions = (
    <Button onClick={handleCreatePage}>
      <Plus className="h-4 w-4 mr-2" />
      Nova Página
    </Button>
  );

  return (
    <BaseSettingsComponent
      title="Gerenciador de Páginas"
      tabs={tabs}
      defaultTab="pages"
      onSave={handleSave}
      onReset={handleReset}
      headerActions={headerActions}
    />
  );
}