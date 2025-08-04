import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Database, Download, Trash2, Archive } from "lucide-react";

interface Backup {
  id: number;
  name: string;
  type: 'full' | 'incremental';
  size: string;
  date: string;
  status: 'completed' | 'running' | 'failed';
}

interface BackupManagerProps {
  backups: Backup[];
  onCreateBackup?: () => void;
  onRestoreBackup?: (backupId: number) => void;
  onDownloadBackup?: (backupId: number) => void;
  onDeleteBackup?: (backupId: number) => void;
  onSaveConfig?: (config: any) => void;
}

export const BackupManagerComponent = ({
  backups,
  onCreateBackup,
  onRestoreBackup,
  onDownloadBackup,
  onDeleteBackup,
  onSaveConfig
}: BackupManagerProps) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciador de Backups</h3>
          <p className="text-sm text-muted-foreground">
            Backups automáticos e restauração do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onRestoreBackup?.(0)}>
            <Download className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={onCreateBackup}>
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
              <Label className="text-sm font-medium">Frequência</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Horário</Label>
              <Input type="time" className="w-full" defaultValue="02:00" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Retenção (dias)</Label>
              <Input type="number" className="w-full" defaultValue="30" />
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
          
          <Button onClick={() => onSaveConfig?.({})}>Salvar Configuração</Button>
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDownloadBackup?.(backup.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onRestoreBackup?.(backup.id)}
                  >
                    Restaurar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => onDeleteBackup?.(backup.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};