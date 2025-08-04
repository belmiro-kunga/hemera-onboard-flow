import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { BaseTemplateEditor, TemplateVariable, TemplateType } from "./base/BaseTemplateEditor";
import { TemplateListComponent, TemplateItem } from "./base/TemplateListComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { 
  Award, 
  Plus, 
  Palette,
  Type,
  Image
} from "lucide-react";

export default function CertificateTemplateEditor() {
  const [templates] = useState<TemplateItem[]>([
    {
      id: 1,
      name: "Certificado Padrão",
      type: "course",
      status: "active",
      lastModified: "2024-01-15",
      usageCount: 45
    },
    {
      id: 2,
      name: "Certificado Simulado",
      type: "simulado",
      status: "active",
      lastModified: "2024-01-14",
      usageCount: 23
    },
    {
      id: 3,
      name: "Certificado Premium",
      type: "course",
      status: "draft",
      lastModified: "2024-01-13",
      usageCount: 0
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateItem | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('course');
  const [templateContent, setTemplateContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [variables, setVariables] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess } = useCommonHook();

  const templateTypes: TemplateType[] = [
    { value: 'course', label: 'Curso' },
    { value: 'simulado', label: 'Simulado' }
  ];

  const availableVariables: TemplateVariable[] = [
    { key: 'student_name', description: 'Nome do aluno', example: 'João Silva' },
    { key: 'course_name', description: 'Nome do curso', example: 'Introdução ao React' },
    { key: 'completion_date', description: 'Data de conclusão', example: '15/01/2024' },
    { key: 'score', description: 'Pontuação (simulados)', example: '85%' },
    { key: 'company_name', description: 'Nome da empresa', example: 'Hemera Capital Partners' },
    { key: 'instructor_name', description: 'Nome do instrutor', example: 'Maria Santos' },
    { key: 'certificate_id', description: 'ID do certificado', example: 'CERT-2024-001' }
  ];

  const getTypeColor = (type: string) => {
    return type === 'course' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getTypeLabel = (type: string) => {
    return type === 'course' ? 'Curso' : 'Simulado';
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
    setTemplateType('course');
    setTemplateContent('');
    setIsActive(true);
    setVariables([]);
    setIsEditing(true);
    showSuccess('Criando novo template...');
  };

  const handleSaveTemplate = async () => {
    // TODO: Implement actual save logic
    console.log('Saving template:', {
      name: templateName,
      type: templateType,
      content: templateContent,
      isActive,
      variables
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentTemplate(null);
  };

  const handleSave = async () => {
    const settings = { templates, isEditing, currentTemplate };
    await saveSettings(settings, 'certificate-templates');
  };

  const handleReset = async () => {
    await resetSettings('certificate-templates');
    setIsEditing(false);
    setCurrentTemplate(null);
  };

  const toolsComponent = (
    <div className="space-y-3">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Elementos</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">
            <Type className="h-3 w-3 mr-1" />
            Texto
          </Button>
          <Button size="sm" variant="outline">
            <Image className="h-3 w-3 mr-1" />
            Imagem
          </Button>
          <Button size="sm" variant="outline">
            <Award className="h-3 w-3 mr-1" />
            Logo
          </Button>
          <Button size="sm" variant="outline">
            <Palette className="h-3 w-3 mr-1" />
            Forma
          </Button>
        </div>
      </div>
    </div>
  );

  const previewComponent = (
    <div className="aspect-[4/3] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
      <div className="text-center space-y-2">
        <Award className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium">Preview do Certificado</p>
        <p className="text-xs text-muted-foreground">
          {templateContent || 'Adicione conteúdo para ver o preview'}
        </p>
      </div>
    </div>
  );

  if (isEditing) {
    return (
      <BaseTemplateEditor
        title={currentTemplate ? `Editando: ${currentTemplate.name}` : 'Novo Template de Certificado'}
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
        toolsComponent={toolsComponent}
        contentPlaceholder="Digite o conteúdo HTML do certificado..."
        contentRows={8}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
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
          emptyMessage="Nenhum template de certificado encontrado"
          getTypeColor={getTypeColor}
          getTypeLabel={getTypeLabel}
        />
      )
    },
    {
      value: "elements",
      label: "Elementos",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Elementos de Texto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Título Principal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Nome do Aluno
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Nome do Curso
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Data de Conclusão
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Elementos Gráficos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Logo da Empresa
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Assinatura Digital
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Selo de Certificação
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Imagem de Fundo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Formas e Decorações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Borda Decorativa
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Linha Divisória
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Retângulo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Círculo
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades do Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">Editor Visual:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Layout drag-and-drop</li>
                    <li>• Biblioteca de elementos gráficos</li>
                    <li>• Preview em tempo real</li>
                    <li>• Sistema de camadas</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Recursos Avançados:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Assinaturas digitais</li>
                    <li>• Variáveis dinâmicas</li>
                    <li>• Múltiplos formatos de saída</li>
                    <li>• Templates responsivos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
      title="Templates de Certificados"
      tabs={tabs}
      defaultTab="templates"
      onSave={handleSave}
      onReset={handleReset}
      headerActions={headerActions}
    />
  );
}