import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Folder,
  Image,
  FileText,
  Video,
  Music,
  Download,
  Trash2,
  Edit,
  Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MediaLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [fileType, setFileType] = useState("all");

  // Mock data - replace with actual data fetching
  const folders = [
    { id: "all", name: "Todos os Arquivos", count: 247 },
    { id: "images", name: "Imagens", count: 156 },
    { id: "documents", name: "Documentos", count: 45 },
    { id: "videos", name: "Vídeos", count: 32 },
    { id: "certificates", name: "Certificados", count: 14 },
  ];

  const files = [
    {
      id: 1,
      name: "logo-empresa.png",
      type: "image",
      size: "245 KB",
      modified: "2024-01-15",
      folder: "images",
      url: "/placeholder-image.jpg"
    },
    {
      id: 2,
      name: "manual-onboarding.pdf",
      type: "document",
      size: "2.1 MB",
      modified: "2024-01-14",
      folder: "documents",
      url: "/placeholder-document.pdf"
    },
    {
      id: 3,
      name: "video-apresentacao.mp4",
      type: "video",
      size: "15.3 MB",
      modified: "2024-01-13",
      folder: "videos",
      url: "/placeholder-video.mp4"
    },
    // Add more mock files as needed
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'audio': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder;
    const matchesType = fileType === "all" || file.type === fileType;
    return matchesSearch && matchesFolder && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar pasta" />
          </SelectTrigger>
          <SelectContent>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name} ({folder.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fileType} onValueChange={setFileType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo de arquivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="image">Imagens</SelectItem>
            <SelectItem value="document">Documentos</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="audio">Áudios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                  {file.type === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={`text-xs ${getFileTypeColor(file.type)}`}>
                      {file.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{file.modified}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Modificado em {file.modified}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className={`${getFileTypeColor(file.type)}`}>
                      {file.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {file.size}
                    </span>
                    
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum arquivo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar os filtros de busca" : "Faça upload do seu primeiro arquivo"}
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Arquivos
          </Button>
        </div>
      )}

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
  );
}