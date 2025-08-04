import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Grid, 
  List, 
  Eye, 
  Download, 
  Edit, 
  Trash2,
  Image,
  FileText,
  Video,
  Music
} from "lucide-react";

export interface FileItem {
  id: string | number;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | string;
  size: string;
  modified: string;
  folder?: string;
  url?: string;
  thumbnail?: string;
}

interface FileViewerProps {
  files: FileItem[];
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onFileAction?: (action: 'view' | 'download' | 'edit' | 'delete', file: FileItem) => void;
  showViewToggle?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export const FileViewerComponent = ({
  files,
  viewMode = 'grid',
  onViewModeChange,
  onFileAction,
  showViewToggle = true,
  emptyMessage = "Nenhum arquivo encontrado",
  emptyAction
}: FileViewerProps) => {
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

  const handleAction = (action: 'view' | 'download' | 'edit' | 'delete', file: FileItem) => {
    onFileAction?.(action, file);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      {showViewToggle && onViewModeChange && (
        <div className="flex justify-end gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                  {file.type === 'image' && (file.url || file.thumbnail) ? (
                    <img 
                      src={file.thumbnail || file.url} 
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
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleAction('view', file)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleAction('download', file)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleAction('edit', file)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleAction('delete', file)}
                    >
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
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    {file.type === 'image' && file.thumbnail ? (
                      <img 
                        src={file.thumbnail} 
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Modificado em {file.modified}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className={getFileTypeColor(file.type)}>
                      {file.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {file.size}
                    </span>
                    
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleAction('view', file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleAction('download', file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleAction('edit', file)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleAction('delete', file)}
                      >
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
    </div>
  );
};