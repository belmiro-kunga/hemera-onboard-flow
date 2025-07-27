import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Globe, 
  Server, 
  Shield,
  Mail,
  Database,
  Palette,
  Languages,
  Clock,
  Save,
  RefreshCw,
  FileText
} from "lucide-react";

// Import ALL settings components
import GeneralSettings from "@/components/cms/GeneralSettings";
import BrandingSettings from "@/components/cms/BrandingSettings";
import { EmailManagement } from "@/components/admin/EmailManagement";
import SystemManager from "@/components/cms/SystemManager";

export default function SettingsAdmin() {
  const [activeTab, setActiveTab] = useState("general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
            <p className="text-muted-foreground">
              Centralize todas as configurações: sistema, branding, email e preferências globais
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Alterações não salvas
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Salvar Todas
          </Button>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuso Horário</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">WAT +1</div>
            <p className="text-xs text-muted-foreground">
              África/Luanda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idioma Principal</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🇦🇴 PT</div>
            <p className="text-xs text-muted-foreground">
              Português (Angola)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Funcionando normalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurações</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">
              Módulos configurados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs - TODAS AS CONFIGURAÇÕES */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Configurações Gerais
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Gerais do Sistema
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure informações básicas, fuso horário, idiomas e preferências globais
              </p>
            </CardHeader>
            <CardContent>
              <GeneralSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Configurações de Branding
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Personalize a identidade visual, logos, cores e temas do sistema
              </p>
            </CardHeader>
            <CardContent>
              <BrandingSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações de Email
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure SMTP, templates de email e notificações automáticas
              </p>
            </CardHeader>
            <CardContent>
              <EmailManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Gerenciamento do Sistema
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie backups, atualizações, logs e manutenção do sistema
              </p>
            </CardHeader>
            <CardContent>
              <SystemManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Link para CMS */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900">Precisa gerenciar conteúdo?</h4>
              <p className="text-sm text-green-700">
                Acesse o CMS para gerenciar mídia, páginas, menus, permissões e certificados.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => window.location.href = '/admin/cms'}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ir para CMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status Footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Sistema Online</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleString('pt-AO')}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Versão: 1.0.0</span>
              <span>•</span>
              <span>Ambiente: Produção</span>
              <span>•</span>
              <span>Região: Angola</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}