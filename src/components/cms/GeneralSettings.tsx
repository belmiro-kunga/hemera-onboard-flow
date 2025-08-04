import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { LanguageManagerComponent } from "./base/LanguageManagerComponent";
import { 
  Globe, 
  Type, 
  Settings, 
  Wrench,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function GeneralSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("pt-AO");
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(false);
  const [rtlSupport, setRtlSupport] = useState(false);
  const [fallbackLanguage, setFallbackLanguage] = useState("pt-AO");
  
  const { saveSettings, resetSettings } = useSettingsManager();
  
  const [languages] = useState([
    { code: "pt-AO", name: "Português (Angola)", flag: "🇦🇴", status: "active" as const },
    { code: "en-US", name: "English (US)", flag: "🇺🇸", status: "active" as const },
    { code: "pt-PT", name: "Português (Portugal)", flag: "🇵🇹", status: "draft" as const },
    { code: "fr-FR", name: "Français", flag: "🇫🇷", status: "draft" as const }
  ]);

  const [textKeys] = useState([
    { key: "welcome.title", value: "Bem-vindo ao Sistema", category: "Interface" },
    { key: "login.button", value: "Entrar", category: "Autenticação" },
    { key: "course.completed", value: "Curso Concluído", category: "Cursos" },
    { key: "certificate.generated", value: "Certificado Gerado", category: "Certificados" },
    { key: "error.generic", value: "Ocorreu um erro inesperado", category: "Erros" }
  ]);

  const [integrations] = useState([
    { name: "Google Analytics", status: "connected", config: "GA-123456789" },
    { name: "Slack", status: "disconnected", config: "" },
    { name: "Microsoft Teams", status: "connected", config: "teams-webhook-url" },
    { name: "Zapier", status: "disconnected", config: "" }
  ]);

  const handleSave = async () => {
    const settings = {
      maintenanceMode,
      selectedLanguage,
      autoDetectLanguage,
      rtlSupport,
      fallbackLanguage,
      textKeys,
      integrations
    };
    await saveSettings(settings, 'general');
  };

  const handleReset = async () => {
    await resetSettings('general');
    setMaintenanceMode(false);
    setSelectedLanguage("pt-AO");
    setAutoDetectLanguage(false);
    setRtlSupport(false);
    setFallbackLanguage("pt-AO");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'connected': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Configuração das tabs
  const tabs = [
    {
      value: "general",
      label: "Configurações Gerais",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Site Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações do Site
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Nome do Site</Label>
                  <Input id="site-name" defaultValue="HCP Onboarding System" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Descrição</Label>
                  <Textarea
                    id="site-description"
                    defaultValue="Sistema de integração corporativa para novos colaboradores em Angola"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-url">URL do Site</Label>
                  <Input id="site-url" defaultValue="https://onboarding.empresa.ao" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email do Administrador</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@empresa.ao" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <select id="timezone" className="w-full p-2 border rounded-md" defaultValue="Africa/Luanda">
                    <option value="Africa/Luanda">África/Luanda (WAT +1)</option>
                    <option value="Africa/Lagos">África/Lagos (WAT +1)</option>
                    <option value="Europe/Lisbon">Europa/Lisboa (WET +0)</option>
                    <option value="Europe/London">Europa/Londres (GMT +0)</option>
                    <option value="America/New_York">América/Nova York (EST -5)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Modo de Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {maintenanceMode ? (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {maintenanceMode ? "Modo Manutenção Ativo" : "Sistema Online"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {maintenanceMode 
                          ? "Site indisponível para usuários" 
                          : "Site funcionando normalmente"
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                {maintenanceMode && (
                  <div className="space-y-4 p-4 border rounded-lg bg-orange-50">
                    <div className="space-y-2">
                      <Label htmlFor="maintenance-title">Título da Manutenção</Label>
                      <Input 
                        id="maintenance-title" 
                        defaultValue="Sistema em Manutenção" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maintenance-message">Mensagem</Label>
                      <Textarea
                        id="maintenance-message"
                        defaultValue="Estamos realizando melhorias no sistema. Voltaremos em breve!"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maintenance-end">Previsão de Retorno</Label>
                      <Input 
                        id="maintenance-end" 
                        type="datetime-local"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="allow-admin" defaultChecked />
                      <Label htmlFor="allow-admin">Permitir acesso de administradores</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debug-mode">Modo Debug</Label>
                    <Switch id="debug-mode" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache-enabled">Cache Habilitado</Label>
                    <Switch id="cache-enabled" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup">Backup Automático</Label>
                    <Switch id="auto-backup" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ssl-required">Forçar HTTPS</Label>
                    <Switch id="ssl-required" defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Timeout de Sessão (min)</Label>
                    <Input id="session-timeout" type="number" defaultValue="60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-upload">Tamanho Máximo de Upload (MB)</Label>
                    <Input id="max-upload" type="number" defaultValue="50" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pagination">Itens por Página</Label>
                    <Input id="pagination" type="number" defaultValue="20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      value: "texts",
      label: "Textos da Interface",
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Textos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Interface", "Autenticação", "Cursos", "Certificados", "Erros"].map((category) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-sm border-b pb-2">{category}</h4>
                  <div className="space-y-2">
                    {textKeys
                      .filter(item => item.category === category)
                      .map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg">
                          <div>
                            <Label className="text-xs text-muted-foreground">Chave</Label>
                            <p className="text-sm font-mono">{item.key}</p>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Valor</Label>
                            <Input defaultValue={item.value} className="text-sm" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      value: "i18n",
      label: "Internacionalização",
      content: (
        <LanguageManagerComponent
          languages={languages}
          selectedLanguage={selectedLanguage}
          onLanguageSelect={setSelectedLanguage}
          autoDetect={autoDetectLanguage}
          onAutoDetectChange={setAutoDetectLanguage}
          rtlSupport={rtlSupport}
          onRtlSupportChange={setRtlSupport}
          fallbackLanguage={fallbackLanguage}
          onFallbackChange={setFallbackLanguage}
        />
      )
    },
    {
      value: "integrations",
      label: "Integrações",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <Badge variant="secondary" className={getStatusColor(integration.status)}>
                      {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {integration.config && (
                    <div className="p-2 bg-muted rounded text-xs font-mono">
                      {integration.config}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      {integration.status === 'connected' ? 'Configurar' : 'Conectar'}
                    </Button>
                    <Button size="sm" variant="outline">
                      Testar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-rate-limit">Rate Limit (req/min)</Label>
                  <Input id="api-rate-limit" type="number" defaultValue="1000" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-timeout">Timeout (segundos)</Label>
                  <Input id="api-timeout" type="number" defaultValue="30" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="api-logging" defaultChecked />
                <Label htmlFor="api-logging">Log de requisições API</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="webhook-retry" defaultChecked />
                <Label htmlFor="webhook-retry">Retry automático para webhooks</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <BaseSettingsComponent
      title="Configurações Gerais"
      tabs={tabs}
      defaultTab="general"
      onSave={handleSave}
      onReset={handleReset}
    />
  );
}