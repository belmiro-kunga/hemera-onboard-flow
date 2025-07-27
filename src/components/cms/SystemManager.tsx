import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Server, 
  Upload, 
  Download, 
  RefreshCw,
  HardDrive,
  Database,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  FolderOpen,
  Archive
} from "lucide-react";

export default function SystemManager() {
  const [backups] = useState([
    {
      id: 1,
      name: "backup-2024-01-15-full.zip",
      type: "full",
      size: "245 MB",
      date: "2024-01-15 02:00",
      status: "completed"
    },
    {
      id: 2,
      name: "backup-2024-01-14-incremental.zip",
      type: "incremental",
      size: "45 MB",
      date: "2024-01-14 02:00",
      status: "completed"
    },
    {
      id: 3,
      name: "backup-2024-01-13-full.zip",
      type: "full",
      size: "238 MB",
      date: "2024-01-13 02:00",
      status: "completed"
    }
  ]);

  const [systemInfo] = useState({
    version: "2.1.4",
    lastUpdate: "2024-01-10",
    uptime: "15 dias, 4 horas",
    diskUsage: 65,
    memoryUsage: 42,
    cpuUsage: 23
  });

  const getBackupTypeColor = (type: string) => {
    return type === 'full' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="updates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="updates">Atualizações</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Atualizações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Versão Atual</span>
                    <Badge variant="outline">{systemInfo.version}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Última atualização: {systemInfo.lastUpdate}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verificar atualizações</span>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar
                    </Button>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Sistema atualizado</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Não há atualizações disponíveis no momento
                    </p>
                  </div>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium mb-1">Upload Manual</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Faça upload de um arquivo de atualização
                  </p>
                  <Button size="sm">
                    Selecionar Arquivo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Update History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Atualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { version: "2.1.4", date: "2024-01-10", type: "patch" },
                    { version: "2.1.3", date: "2024-01-05", type: "patch" },
                    { version: "2.1.0", date: "2023-12-20", type: "minor" },
                    { version: "2.0.0", date: "2023-12-01", type: "major" }
                  ].map((update, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">v{update.version}</p>
                        <p className="text-xs text-muted-foreground">{update.date}</p>
                      </div>
                      <Badge variant="outline" className={
                        update.type === 'major' ? 'border-red-200 text-red-800' :
                        update.type === 'minor' ? 'border-blue-200 text-blue-800' :
                        'border-green-200 text-green-800'
                      }>
                        {update.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Gerenciador de Backups</h3>
              <p className="text-sm text-muted-foreground">
                Backups automáticos e restauração do sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <Button>
                <Archive className="h-4 w-4 mr-2" />
                Criar Backup
              </Button>
            </div>
          </div>

          {/* Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Backup Automático</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Frequência</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Horário</label>
                  <input type="time" className="w-full p-2 border rounded-md" defaultValue="02:00" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Retenção (dias)</label>
                  <input type="number" className="w-full p-2 border rounded-md" defaultValue="30" />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Incluir banco de dados</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Incluir arquivos de mídia</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Compressão avançada</span>
                </label>
              </div>
              
              <Button>Salvar Configuração</Button>
            </CardContent>
          </Card>

          {/* Backup List */}
          <Card>
            <CardHeader>
              <CardTitle>Backups Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{backup.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getBackupTypeColor(backup.type)}>
                            {backup.type === 'full' ? 'Completo' : 'Incremental'}
                          </Badge>
                          <Badge variant="secondary" className={getStatusColor(backup.status)}>
                            {backup.status === 'completed' ? 'Concluído' : backup.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{backup.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{backup.date}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Restaurar
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Gerenciador de Arquivos Avançado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Gerenciador de Arquivos</h3>
                <p className="text-muted-foreground mb-4">
                  Interface avançada para gerenciamento de arquivos do sistema
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">Funcionalidades:</h4>
                    <ul className="space-y-1 text-muted-foreground text-left">
                      <li>• Navegação por diretórios</li>
                      <li>• Upload e download de arquivos</li>
                      <li>• Editor de código integrado</li>
                      <li>• Permissões de arquivo</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Recursos:</h4>
                    <ul className="space-y-1 text-muted-foreground text-left">
                      <li>• Busca avançada</li>
                      <li>• Compressão/descompressão</li>
                      <li>• Preview de arquivos</li>
                      <li>• Controle de versões</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso do Disco</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemInfo.diskUsage}%</div>
                <Progress value={systemInfo.diskUsage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  6.5 GB de 10 GB utilizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso da Memória</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemInfo.memoryUsage}%</div>
                <Progress value={systemInfo.memoryUsage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  2.1 GB de 5 GB utilizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso da CPU</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemInfo.cpuUsage}%</div>
                <Progress value={systemInfo.cpuUsage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Carga média: 0.8
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Versão:</span>
                    <span className="text-sm font-medium">{systemInfo.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uptime:</span>
                    <span className="text-sm font-medium">{systemInfo.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Última atualização:</span>
                    <span className="text-sm font-medium">{systemInfo.lastUpdate}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">PHP Version:</span>
                    <span className="text-sm font-medium">8.2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Database:</span>
                    <span className="text-sm font-medium">PostgreSQL 15.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Web Server:</span>
                    <span className="text-sm font-medium">Nginx 1.24</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Controle de Versões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Branch Atual</span>
                    <Badge variant="outline">main</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Último commit: feat: add email configuration panel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hash: a1b2c3d4 • 2 horas atrás
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Pull Changes
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Logs
                  </Button>
                  <Button variant="outline" size="sm">
                    Rollback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}