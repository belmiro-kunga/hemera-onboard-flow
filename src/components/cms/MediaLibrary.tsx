import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { DragDropComponent } from "./base/DragDropComponent";
import { FileViewerComponent, FileItem } from "./base/FileViewerComponent";
import { SearchFilterComponent } from "./base/SearchFilterComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { useSearchAndFilter } from "@/lib/common-patterns";
import { 
  Upload, 
  Folder
} from "lucide-react";

export default function MediaLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { searchTerm, setSearchTerm, selectedCategory: selectedFolder, setSelectedCategory: setSelectedFolder, selectedFilter: fileType, setSelectedFilter: setFileType } = useSearchAndFilter('all', 'all');
  
  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess, showError } = useCommonHook();

  // Mock data - replace with actual data fetching
  const folders = [
    { value: "all", label: "Todos os Arquivos", count: 247 },
    { value: "images", label: "Imagens", count: 156 },
    { value: "documents", label: "Documentos", count: 45 },
    { value: "videos", label: "Vídeos", count: 32 },
    { value: "certificates", label: "Certificados", count: 14 },
  ];

  const fileTypes = [
    { value: "all", label: "Todos" },
    { value: "image", label: "Imagens" },
    { value: "document", label: "Documentos" },
    { value: "video", label: "Vídeos" },
    { value: "audio", label: "Áudios" },
  ];

  const files: FileItem[] = [
    {
      id: 1,
      name: "logo-empresa.png",
      type: "image",
      size: "245 KB",
      modified: "2024-01-15",
      folder: "images",
      url: "/placeholder.svg"
    },
    {
      id: 2,
      name: "manual-onboarding.pdf",
      type: "document",
      size: "2.1 MB",
      modified: "2024-01-14",
      folder: "documents",
      url: "/placeholder.svg"
    },
    {
      id: 3,
      name: "video-apresentacao.mp4",
      type: "video",
      size: "15.3 MB",
      modified: "2024-01-13",
      folder: "videos",
      url: "/placeholder.svg"
    },
    {
      id: 4,
      name: "audio-treinamento.mp3",
      type: "audio",
      size: "8.2 MB",
      modified: "2024-01-12",
      folder: "videos",
      url: "/placeholder.svg"
    }
  ];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
    const matchesType = fileType === "all" || file.type === fileType;
    return matchesSearch && matchesFolder && matchesType;
  });

  const handleFilesAdded = (newFiles: File[]) => {
    showSuccess(`${newFiles.length} arquivo(s) adicionado(s) com sucesso!`);
  };

  const handleFileAction = (action: 'view' | 'download' | 'edit' | 'delete', file: FileItem) => {
    switch (action) {
      case 'view':
        showSuccess(`Visualizando ${file.name}`);
        break;
      case 'download':
        showSuccess(`Download de ${file.name} iniciado`);
        break;
      case 'edit':
        showSuccess(`Editando ${file.name}`);
        break;
      case 'delete':
        showSuccess(`${file.name} removido com sucesso`);
        break;
    }
  };

  const handleSave = async () => {
    const settings = { viewMode, searchTerm, selectedFolder, fileType };
    await saveSettings(settings, 'media-library');
  };

  const handleReset = async () => {
    await resetSettings('media-library');
    setSearchTerm('');
    setSelectedFolder('all');
    setFileType('all');
    setViewMode('grid');
  };

  // Configuração das tabs
  const tabs = [
    {
      value: "upload",
      label: "Upload de Arquivos",
      content: (
        <div className="space-y-6">
          <DragDropComponent
            onFilesAdded={handleFilesAdded}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            maxFiles={20}
            maxSize={50}
          />
        </div>
      )
    },
    {
      value: "library",
      label: "Biblioteca de Mídia",
      content: (
        <div className="space-y-6">
          <SearchFilterComponent
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar arquivos..."
            filters={[
              {
                key: "folder",
                label: "Pasta",
                value: selectedFolder,
                options: folders,
                onChange: setSelectedFolder,
                placeholder: "Selecionar pasta",
                width: "w-48"
              },
              {
                key: "type",
                label: "Tipo",
                value: fileType,
                options: fileTypes,
                onChange: setFileType,
                placeholder: "Tipo de arquivo",
                width: "w-40"
              }
            ]}
          />

          <FileViewerComponent
            files={filteredFiles}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFileAction={handleFileAction}
            emptyMessage="Nenhum arquivo encontrado"
            emptyAction={
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Arquivos
              </Button>
            }
          />

          {/* Storage Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Armazenamento Utilizado</p>
                  <p className="text-xs text-muted-foreground">12.3 MB de 1 GB</p>
                </div>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-1/8 h-full bg-primary rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <Button>
        <Upload className="h-4 w-4 mr-2" />
        Upload Arquivos
      </Button>
      <Button variant="outline">
        <Folder className="h-4 w-4 mr-2" />
        Nova Pasta
      </Button>
    </div>
  );

  return (
    <BaseSettingsComponent
      title="Biblioteca de Mídia"
      tabs={tabs}
      defaultTab="library"
      onSave={handleSave}
      onReset={handleReset}
      headerActions={headerActions}
    />
  );
}