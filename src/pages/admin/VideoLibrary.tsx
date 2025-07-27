
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Upload,
  Search,
  Filter,
  Play,
  Edit,
  Trash2,
  Eye,
  Download,
  Plus,
  Clock,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import VideoPlayer from '@/components/video/VideoPlayer';
import { 
  useSearchAndFilter, 
  useVideosQuery, 
  useVideoCategoriesQuery,
  createSearchFilter,
  createCategoryFilter,
  handleError,
  handleSuccess
} from '@/lib/common-patterns';
import { useToast } from '@/hooks/use-toast';

const VideoLibrary = () => {
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  // Usando hooks comuns para eliminar duplicação
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory
  } = useSearchAndFilter();
  
  // Usando queries comuns
  const { data: videos = [], isLoading: videosLoading } = useVideosQuery();
  const { data: categories = [] } = useVideoCategoriesQuery();
  
  // Usando filtros comuns
  const searchFilter = createSearchFilter(searchTerm);
  const categoryFilter = createCategoryFilter(selectedCategory);
  
  const filteredVideos = videos.filter(video => {
    return searchFilter(video, ['title', 'description']) &&
           categoryFilter(video, 'category');
  });

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <Badge variant="default" className="bg-success text-success-foreground">Publicado</Badge>
    ) : (
      <Badge variant="secondary">Rascunho</Badge>
    );
  };

  const totalDuration = videos.reduce((acc, video) => {
    const [minutes, seconds] = video.duration.split(':').map(Number);
    return acc + minutes + (seconds / 60);
  }, 0);

  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const handleUpload = () => {
    try {
      // Lógica de upload aqui
      handleSuccess(toast, 'Vídeo enviado com sucesso!');
    } catch (error) {
      handleError(error, toast, 'Erro ao enviar vídeo');
    }
  };

  const handleDelete = (videoId: number) => {
    try {
      // Lógica de exclusão aqui
      handleSuccess(toast, 'Vídeo excluído com sucesso!');
    } catch (error) {
      handleError(error, toast, 'Erro ao excluir vídeo');
    }
  };

  if (videosLoading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biblioteca de Vídeos</h1>
          <p className="text-muted-foreground">Gerenciar conteúdo em vídeo do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>
          <Button variant="corporate" size="sm" onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Vídeo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-corporate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Vídeos</p>
                <p className="text-2xl font-bold text-foreground">{videos.length}</p>
              </div>
              <Video className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-corporate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Duração Total</p>
                <p className="text-2xl font-bold text-foreground">{formatTotalDuration(totalDuration)}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-corporate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Visualizações</p>
                <p className="text-2xl font-bold text-foreground">
                  {videos.reduce((acc, v) => acc + v.views, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-corporate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-foreground">
                  {videos.filter(v => v.status === 'published').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-corporate">
        <CardHeader>
          <CardTitle>Biblioteca de Vídeos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vídeos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Todos' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="shadow-corporate hover:shadow-glow transition-all duration-300">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors duration-300 rounded-t-lg flex items-center justify-center group">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-12 w-12 bg-black/50 hover:bg-black/70 text-white rounded-full"
                          onClick={() => setSelectedVideo(video)}
                        >
                          <Play className="h-6 w-6" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{selectedVideo?.title}</DialogTitle>
                        </DialogHeader>
                        {selectedVideo && (
                          <VideoPlayer
                            src="/placeholder.svg"
                            title={selectedVideo.title}
                            onProgress={(progress) => console.log('Progress:', progress)}
                            onComplete={() => console.log('Video completed')}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(video.status)}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{video.category}</Badge>
                        <span>{video.resolution}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{video.views}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(video.uploadDate).toLocaleDateString('pt-AO')}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoLibrary;
