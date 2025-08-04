import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseSettingsComponent, useSettingsManager } from "../cms/base/BaseSettingsComponent";
import { BaseTemplateEditor, TemplateVariable, TemplateType } from "../cms/base/BaseTemplateEditor";
import { TemplateListComponent, TemplateItem } from "../cms/base/TemplateListComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { 
  Plus, 
  Mail
} from "lucide-react";

export default function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<TemplateItem[]>([
    {
      id: 1,
      name: "Email de Boas-vindas",
      type: "welcome",
      status: "active",
      lastModified: "2024-01-15",
      usageCount: 125,
      author: "Admin"
    },
    {
      id: 2,
      name: "Recuperação de Senha",
      type: "password_reset",
      status: "active",
      lastModified: "2024-01-14",
      usageCount: 89,
      author: "Admin"
    },
    {
      id: 3,
      name: "Notificação de Curso",
      type: "notification",
      status: "draft",
      lastModified: "2024-01-13",
      usageCount: 0,
      author: "Editor"
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateItem | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('welcome');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [variables, setVariables] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess } = useCommonHook();
  const { createTemplate, updateTemplate } = useEmailTemplates();

  const templateTypes: TemplateType[] = [
    { value: 'welcome', label: 'Boas-vindas' },
    { value: 'password_reset', label: 'Recuperação de Senha' },
    { value: 'notification', label: 'Notificação' },
    { value: 'reminder', label: 'Lembrete' }
  ];

  const availableVariables: TemplateVariable[] = [
    { key: 'name', description: 'Nome do usuário', example: 'João Silva' },
    { key: 'email', description: 'Email do usuário', example: 'joao@empresa.com' },
    { key: 'company_name', description: 'Nome da empresa', example: 'Hemera Capital Partners' },
    { key: 'login_url', description: 'URL de login', example: 'https://sistema.empresa.com/login' },
    { key: 'temporary_password', description: 'Senha temporária', example: 'temp123456' },
    { key: 'course_name', description: 'Nome do curso', example: 'Introdução ao React' },
    { key: 'due_date', description: 'Data de vencimento', example: '31/01/2024' }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'password_reset': return 'bg-red-100 text-red-800';
      case 'notification': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = templateTypes.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const handleTemplateAction = (action: 'view' | 'edit' | 'copy' | 'delete' | 'download', template: TemplateItem) => {
    switch (action) {
      case 'view':
        showSuccess(`Visualizando template: ${template.name}`);
        break;
      case 'edit':
        setCurrentTemplate(template);
        setTemplateName(template.name);
        setTemplateType(template.type);
        setIsEditing(true);
        showSuccess(`Editando template: ${template.name}`);
        break;
      case 'copy':
        showSuccess(`Template "${template.name}" duplicado com sucesso`);
        break;
      case 'delete':
        showSuccess(`Template "${template.name}" removido com sucesso`);
        break;
      case 'download':
        showSuccess(`Download do template "${template.name}" iniciado`);
        break;
    }
  };

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setTemplateName('');
    setTemplateType('welcome');
    setTemplateSubject('');
    setTemplateContent('');
    setIsActive(true);
    setVariables([]);
    setIsEditing(true);
    showSuccess('Criando novo template...');
  };

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        name: templateName,
        subject: templateSubject,
        content: templateContent,
        template_type: templateType as any,
        variables,
        is_active: isActive
      };

      if (currentTemplate) {
        await updateTemplate(currentTemplate.id as string, templateData);
      } else {
        await createTemplate(templateData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentTemplate(null);
  };

  const handleSave = async () => {
    const settings = { templates, isEditing, currentTemplate };
    await saveSettings(settings, 'email-templates');
  };

  const handleReset = async () => {
    await resetSettings('email-templates');
    setIsEditing(false);
    setCurrentTemplate(null);
  };

  const previewContent = templateContent.replace(
    /\{\{(\w+)\}\}/g, 
    (match, key) => `<span style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 3px;">${key}</span>`
  );

  const previewComponent = (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Assunto:</CardTitle>
          <p className="text-sm text-muted-foreground">{templateSubject || 'Sem assunto'}</p>
        </CardHeader>
        <CardContent>
          <div
            className="border rounded p-4 bg-white min-h-[200px] text-sm"
            dangerouslySetInnerHTML={{ __html: previewContent || '<p class="text-muted-foreground">Adicione conteúdo para ver o preview</p>' }}
          />
        </CardContent>
      </Card>
    </div>
  );

  const additionalFields = (
    <div className="space-y-2">
      <Label htmlFor="template-subject">Assunto do Email</Label>
      <Input
        id="template-subject"
        value={templateSubject}
        onChange={(e) => setTemplateSubject(e.target.value)}
        placeholder="Ex: Bem-vindo(a) ao Sistema - {{company_name}}"
      />
    </div>
  );

  if (isEditing) {
    return (
      <BaseTemplateEditor
        title={currentTemplate ? `Editando: ${currentTemplate.name}` : 'Novo Template de Email'}
        templateName={templateName}
        onTemplateNameChange={setTemplateName}
        templateType={templateType}
        onTemplateTypeChange={setTemplateType}
        templateTypes={templateTypes}
        content={templateContent}
        onContentChange={setTemplateContent}
        isActive={isActive}
        onActiveChange={setIsActive}
        variables={variables}
        onVariablesChange={setVariables}
        availableVariables={availableVariables}
        onSave={handleSaveTemplate}
        onCancel={handleCancelEdit}
        previewComponent={previewComponent}
        contentPlaceholder="Digite o conteúdo HTML do email..."
        contentRows={12}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        additionalFields={additionalFields}
      />
    );
  }

  // Configuração das tabs
  const tabs = [
    {
      value: "templates",
      label: "Templates",
      content: (
        <TemplateListComponent
          templates={templates}
          onTemplateAction={handleTemplateAction}
          onCreateTemplate={handleCreateTemplate}
          emptyMessage="Nenhum template de email encontrado"
          getTypeColor={getTypeColor}
          getTypeLabel={getTypeLabel}
        />
      )
    },
    {
      value: "features",
      label: "Funcionalidades",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades do Editor de Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Editor de Templates:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Editor HTML com syntax highlighting</li>
                  <li>• Sistema de variáveis dinâmicas</li>
                  <li>• Preview em tempo real</li>
                  <li>• Templates responsivos</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Recursos Avançados:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Personalização por tipo de email</li>
                  <li>• Variáveis personalizadas</li>
                  <li>• Versionamento de templates</li>
                  <li>• Testes A/B integrados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const headerActions = (
    <Button onClick={handleCreateTemplate}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Template
    </Button>
  );

  return (
    <BaseSettingsComponent
      title="Templates de Email"
      tabs={tabs}
      defaultTab="templates"
      onSave={handleSave}
      onReset={handleReset}
      headerActions={headerActions}
    />
  );
}