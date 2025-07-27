import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Image, 
  Palette, 
  Menu, 
  Edit, 
  Shield,
  Award,
  Upload,
  Settings,
  Eye,
  Users,
  Folder,
  Search,
  Mail,
  Server,
  Globe
} from "lucide-react";

// Import CMS components
import MediaLibrary from "@/components/cms/MediaLibrary";
import BrandingSettings from "@/components/cms/BrandingSettings";
import MenuManager from "@/components/cms/MenuManager";
import PageManager from "@/components/cms/PageManager";
import RoleManager from "@/components/cms/RoleManager";
import CertificateTemplateEditor from "@/components/cms/CertificateTemplateEditor";
import EmailConfigPanel from "@/components/cms/EmailConfigPanel";
import SystemManager from "@/components/cms/SystemManager";
import GeneralSettings from "@/components/cms/GeneralSettings";

export default function CMSAdmin() {
  const [activeTab, setActiveTab] = useState("media");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sistema de Gerenciamento de Conteúdo</h1>
            <p className="text-muted-foreground">
              Gerencie conteúdo, mídia, branding e configurações do sistema
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações Gerais
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivos de Mídia</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              12.3 MB utilizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Páginas Ativas</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              3 rascunhos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menus Configurados</CardTitle>
            <Menu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              2 principais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              4 personalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Mídia
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="menus" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Menus
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Páginas
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificados
            </TabsTrigger>
          </TabsList>
          
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Biblioteca de Mídia
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie arquivos, imagens e documentos do sistema
              </p>
            </CardHeader>
            <CardContent>
              <MediaLibrary />
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
                Personalize logos, cores, temas e identidade visual
              </p>
            </CardHeader>
            <CardContent>
              <BrandingSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Gerenciador de Menus
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure menus dinâmicos com hierarquia e permissões
              </p>
            </CardHeader>
            <CardContent>
              <MenuManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Gerenciador de Páginas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Crie e edite páginas com editor WYSIWYG
              </p>
            </CardHeader>
            <CardContent>
              <PageManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sistema de Permissões
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie funções, permissões e controle de acesso
              </p>
            </CardHeader>
            <CardContent>
              <RoleManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Templates de Certificados
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Crie e personalize templates de certificados
              </p>
            </CardHeader>
            <CardContent>
              <CertificateTemplateEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuração de Email
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure SMTP, templates e estatísticas de email
              </p>
            </CardHeader>
            <CardContent>
              <EmailConfigPanel />
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
                Atualizações, backups e gerenciamento de arquivos
              </p>
            </CardHeader>
            <CardContent>
              <SystemManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configurações globais, textos e internacionalização
              </p>
            </CardHeader>
            <CardContent>
              <GeneralSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("media")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Faça upload de arquivos diretamente para a biblioteca
            </p>
            <Button size="sm" className="w-full">
              Selecionar Arquivos
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("pages")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Nova Página
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Crie uma nova página com o editor visual
            </p>
            <Button size="sm" className="w-full">
              Criar Página
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("certificates")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" />
              Novo Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Crie um template personalizado de certificado
            </p>
            <Button size="sm" className="w-full">
              Criar Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}