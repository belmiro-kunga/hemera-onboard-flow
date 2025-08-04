import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommonHook } from "@/hooks/useCommonHook";
import { 
  Save, 
  Eye, 
  X,
  Plus
} from "lucide-react";

export interface TemplateVariable {
  key: string;
  description: string;
  example?: string;
}

export interface TemplateType {
  value: string;
  label: string;
}

interface BaseTemplateEditorProps {
  title: string;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  templateType: string;
  onTemplateTypeChange: (type: string) => void;
  templateTypes: TemplateType[];
  content: string;
  onContentChange: (content: string) => void;
  isActive: boolean;
  onActiveChange: (active: boolean) => void;
  variables: string[];
  onVariablesChange: (variables: string[]) => void;
  availableVariables: TemplateVariable[];
  onSave: () => void;
  onCancel?: () => void;
  previewComponent?: ReactNode;
  toolsComponent?: ReactNode;
  contentPlaceholder?: string;
  contentRows?: number;
  showPreview?: boolean;
  onTogglePreview?: () => void;
  additionalFields?: ReactNode;
}

export const BaseTemplateEditor = ({
  title,
  templateName,
  onTemplateNameChange,
  templateType,
  onTemplateTypeChange,
  templateTypes,
  content,
  onContentChange,
  isActive,
  onActiveChange,
  variables,
  onVariablesChange,
  availableVariables,
  onSave,
  onCancel,
  previewComponent,
  toolsComponent,
  contentPlaceholder = "Digite o conteúdo do template...",
  contentRows = 12,
  showPreview = false,
  onTogglePreview,
  additionalFields
}: BaseTemplateEditorProps) => {
  const [newVariable, setNewVariable] = useState('');
  const { showSuccess, showError } = useCommonHook();

  const addVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      onVariablesChange([...variables, newVariable]);
      setNewVariable('');
      showSuccess(`Variável {{${newVariable}}} adicionada`);
    }
  };

  const removeVariable = (variable: string) => {
    onVariablesChange(variables.filter(v => v !== variable));
    showSuccess(`Variável {{${variable}}} removida`);
  };

  const insertVariable = (variable: TemplateVariable) => {
    const variableText = `{{${variable.key}}}`;
    onContentChange(content + variableText);
    showSuccess(`Variável ${variableText} inserida no conteúdo`);
  };

  const handleSave = async () => {
    try {
      await onSave();
      showSuccess('Template salvo com sucesso!');
    } catch (error) {
      showError(error, 'Erro ao salvar template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex gap-2">
          {onTogglePreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nome do Template</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
                placeholder="Ex: Template Padrão"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-type">Tipo</Label>
              <Select value={templateType} onValueChange={onTemplateTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {additionalFields}

          <div className="space-y-2">
            <Label htmlFor="template-content">Conteúdo do Template</Label>
            <Textarea
              id="template-content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={contentRows}
              placeholder={contentPlaceholder}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Variáveis Personalizadas</Label>
            <div className="flex gap-2">
              <Input
                value={newVariable}
                onChange={(e) => setNewVariable(e.target.value)}
                placeholder="Nome da variável"
                onKeyPress={(e) => e.key === 'Enter' && addVariable()}
              />
              <Button onClick={addVariable} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                  {`{{${variable}}}`}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeVariable(variable)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="template-active"
              checked={isActive}
              onCheckedChange={onActiveChange}
            />
            <Label htmlFor="template-active">Template ativo</Label>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tools */}
          {toolsComponent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ferramentas</CardTitle>
              </CardHeader>
              <CardContent>
                {toolsComponent}
              </CardContent>
            </Card>
          )}

          {/* Available Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variáveis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableVariables.map((variable) => (
                <div key={variable.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {`{{${variable.key}}}`}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertVariable(variable)}
                      className="h-6 px-2"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {variable.description}
                  </p>
                  {variable.example && (
                    <p className="text-xs text-muted-foreground italic">
                      Ex: {variable.example}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && previewComponent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {previewComponent}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};