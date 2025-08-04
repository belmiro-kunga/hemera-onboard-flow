import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { BackupManagerComponent } from "./base/BackupManagerComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { 
  Server, 
  Upload, 
  RefreshCw,
  HardDrive,
  Clock,
  FolderOpen
} from "lucide-react";

export default function SystemManager() {
  const [backups] = useState([
    {
      id: 1,
      name: "backup-2024-01-15-full.zip",
      type: "full" as const,
      size: "245 MB",
      date: "2024-01-15 02:00",
      status: "completed" as const
    },
    {
      id: 2,
      name: "backup-2024-01-14-incremental.zip",
      type: "incremental" as const,
      size: "45 MB",
      date: "2024-01-14 02:00",
      status: "completed" as const
    },
    {
      id: 3,
      name: "backup-2024-01-13-full.zip",
      type: "full" as const,
      size: "238 MB",
      date: "2024-01-13 02:00",
      status: "completed" as const
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
  
  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess } = useCommonHook();

  const handleSave = async () => {
    const settings = {
      systemInfo,
      backups
    };
    await saveSettings(settings, 'system');
  };

  const handleReset = async () => {
    await resetSettings('system');
  };

  const handleCreateBackup = () => {
    showSuccess('Backup criado com sucesso!');
  };

  const handleRestoreBackup = (backupId: number) => {
    showSuccess(`Backup ${backupId} restaurado com sucesso!`);
  };

  const handleDownloadBackup = (backupId: number) => {
    showSuccess(`Download do backup ${backupId} iniciado!`);
  };

  const handleDeleteBackup = (backupId: number) => {
    showSuccess(`Backup ${backupId} removido com sucesso!`);
  };

  // Configuração das tabs
  const tabs = [
    {
      value: "updates",
      label: "Atualizações",
      content: (
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
      )
    },
    {
      value: "backups",
      label: "Backups",
      content: (
        <BackupManagerComponent
          backups={backups}
          onCreateBackup={handleCreateBackup}
          onRestoreBackup={handleRestoreBackup}
          onDownloadBackup={handleDownloadBackup}
          onDeleteBackup={handleDeleteBackup}
        />
      )
    },
    {
      value: "files",
      label: "Arquivos",
      content: (
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
      )
    },
    {
      value: "system",
      label: "Sistema",
      content: (
        <div className="space-y-6">
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
        </div>
      )
    }
  ];

  return (
    <BaseSettingsComponent
      title="Gerenciador do Sistema"
      tabs={tabs}
      defaultTab="updates"
      onSave={handleSave}
      onReset={handleReset}
    />
  );
}