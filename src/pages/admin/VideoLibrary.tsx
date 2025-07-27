
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

const VideoLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const videos = [
    {
      id: 1,
      title: 'Boas-vindas do CEO',
      description: 'Mensagem de boas-vindas do CEO da Hemera Capital Partners',
      thumbnail: '/placeholder.svg',
      duration: '5:30',
      category: 'Cultura',
      uploadDate: '2024-01-15',
      views: 247,
      status: 'published',
      fileSize: '125 MB',
      resolution: '1080p'
    },
    {
      id: 2,
      title: 'Cultura e Valores HCP',
      description: 'Apresentação detalhada da cultura organizacional',
      thumbnail: '/placeholder.svg',
      duration: '12:45',
      category: 'Cultura',
      uploadDate: '2024-01-14',
      views: 198,
      status: 'published',
      fileSize: '340 MB',
      resolution: '1080p'
    },
    {
      id: 3,
      title: 'Compliance e Ética',
      description: 'Diretrizes de compliance e código de ética',
      thumbnail: '/placeholder.svg',
      duration: '8:20',
      category: 'Compliance',
      uploadDate: '2024-01-13',
      views: 156,
      status: 'draft',
      fileSize: '220 MB',
      resolution: '720p'
    },
    {
      id: 4,
      title: 'Processos Internos',
      description: 'Visão geral dos principais processos da empresa',
      thumbnail: '/placeholder.svg',
      duration: '15:10',
      category: 'Processos',
      uploadDate: '2024-01-12',
      views: 89,
      status: 'published',
      fileSize: '450 MB',
      resolution: '1080p'
    }
  ];

  const categories = ['all', 'Cultura', 'Compliance', 'Processos', 'Técnico'];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
          <Button variant="corporate" size="sm">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
