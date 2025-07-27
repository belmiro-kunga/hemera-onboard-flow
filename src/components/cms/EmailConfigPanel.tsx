import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Server, 
  Send, 
  Eye,
  Edit,
  Trash2,
  Plus,
  TestTube,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function EmailConfigPanel() {
  const [smtpEnabled, setSmtpEnabled] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  
  const [emailTemplates] = useState([
    {
      id: 1,
      name: "Boas-vindas",
      subject: "Bem-vindo ao sistema!",
      type: "welcome",
      status: "active",
      lastModified: "2024-01-15"
    },
    {
      id: 2,
      name: "Curso Atribuído",
      subject: "Novo curso atribuído",
      type: "assignment",
      status: "active",
      lastModified: "2024-01-14"
    },
    {
      id: 3,
      name: "Certificado Gerado",
      subject: "Seu certificado está pronto!",
      type: "certificate",
      status: "draft",
      lastModified: "2024-01-13"
    }
  ]);

  const [emailStats] = useState({
    sent: 1247,
    delivered: 1198,
    opened: 856,
    clicked: 234,
    bounced: 12,
    failed: 37
  });

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="smtp">Configuração SMTP</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="queue">Fila de Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMTP Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Configuração SMTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smtp-enabled">Habilitar SMTP</Label>
                  <Switch
                    id="smtp-enabled"
                    checked={smtpEnabled}
                    onCheckedChange={setSmtpEnabled}
                  />
                </div>

                {smtpEnabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp-host">Servidor SMTP</Label>
                        <Input id="smtp-host" placeholder="smtp.gmail.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-port">Porta</Label>
                        <Input id="smtp-port" placeholder="587" type="number" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">Usuário</Label>
                      <Input id="smtp-username" placeholder="seu-email@gmail.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">Senha</Label>
                      <Input id="smtp-password" type="password" placeholder="••••••••" />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="smtp-ssl" />
                        <Label htmlFor="smtp-ssl">SSL/TLS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="smtp-auth" defaultChecked />
                        <Label htmlFor="smtp-auth">Autenticação</Label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    Salvar Configuração
                  </Button>
                  <Button variant="outline">
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Teste de Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email de Teste</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="teste@exemplo.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-subject">Assunto</Label>
                  <Input id="test-subject" placeholder="Teste de configuração SMTP" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-message">Mensagem</Label>
                  <Textarea
                    id="test-message"
                    placeholder="Esta é uma mensagem de teste para verificar a configuração SMTP."
                    rows={4}
                  />
                </div>

                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Email de Teste
                </Button>

                {/* Test Results */}
                <div className="p-3 border rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">Último Teste:</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Sucesso - Email enviado</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    15/01/2024 às 14:30
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Diagnostic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Conexão SMTP</p>
                    <p className="text-xs text-muted-foreground">Funcionando</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Autenticação</p>
                    <p className="text-xs text-muted-foreground">Válida</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">Rate Limit</p>
                    <p className="text-xs text-muted-foreground">Atingido (95/100)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Templates de Email</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie templates para diferentes tipos de email
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.type}</Badge>
                    <Badge variant="secondary" className={getStatusColor(template.status)}>
                      {template.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Modificado: {template.lastModified}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailStats.sent}</div>
                <p className="text-xs text-muted-foreground">
                  +12% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((emailStats.delivered / emailStats.sent) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.delivered} de {emailStats.sent} entregues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((emailStats.opened / emailStats.delivered) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailStats.opened} emails abertos
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estatísticas Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Entregues</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{emailStats.delivered}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({Math.round((emailStats.delivered / emailStats.sent) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span>Abertos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{emailStats.opened}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({Math.round((emailStats.opened / emailStats.delivered) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Rejeitados</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{emailStats.bounced}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({Math.round((emailStats.bounced / emailStats.sent) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-orange-600" />
                    <span>Falharam</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{emailStats.failed}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({Math.round((emailStats.failed / emailStats.sent) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Fila de Emails</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie emails pendentes e sistema de retry
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline">
                Processar Fila
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando processamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando retry
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Falhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">2</div>
                <p className="text-xs text-muted-foreground">
                  Requerem atenção
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurações da Fila</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Tentativas de Retry</Label>
                  <Input id="retry-attempts" type="number" defaultValue="3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-delay">Delay entre Tentativas (min)</Label>
                  <Input id="retry-delay" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Tamanho do Lote</Label>
                  <Input id="batch-size" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (emails/min)</Label>
                  <Input id="rate-limit" type="number" defaultValue="100" />
                </div>
              </div>
              
              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}