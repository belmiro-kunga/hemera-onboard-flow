import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEmailTemplates, EmailTemplate } from "@/hooks/useEmailTemplates";
import { Eye, Save, X } from "lucide-react";

interface EmailTemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate;
}

export function EmailTemplateEditorDialog({ open, onOpenChange, template }: EmailTemplateEditorDialogProps) {
  const { createTemplate, updateTemplate } = useEmailTemplates();
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    content: template?.content || '',
    template_type: template?.template_type || 'welcome' as const,
    variables: template?.variables || [],
    is_active: template?.is_active ?? true,
  });

  const [newVariable, setNewVariable] = useState('');

  const handleSave = async () => {
    try {
      if (template) {
        await updateTemplate(template.id, formData);
      } else {
        await createTemplate(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable]
      }));
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const previewContent = formData.content.replace(
    /\{\{(\w+)\}\}/g, 
    (match, key) => `<span style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 3px;">${key}</span>`
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
          <DialogDescription>
            Configure o template de email com variáveis personalizáveis
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Email de Boas-vindas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.template_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, template_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Boas-vindas</SelectItem>
                  <SelectItem value="password_reset">Recuperação de Senha</SelectItem>
                  <SelectItem value="notification">Notificação</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ex: Bem-vindo(a) ao Sistema - {{company_name}}"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo HTML</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                placeholder="Digite o conteúdo HTML do email..."
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Variáveis</Label>
              <div className="flex gap-2">
                <Input
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="Nome da variável"
                  onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                />
                <Button onClick={addVariable} size="sm">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable) => (
                  <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                    {`{{${variable}}}`}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeVariable(variable)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Template ativo</Label>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Pré-visualização</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>

            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Assunto:</CardTitle>
                  <p className="text-sm text-muted-foreground">{formData.subject}</p>
                </CardHeader>
                <CardContent>
                  <div
                    className="border rounded p-4 bg-white min-h-[300px] text-sm"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p><code className="bg-muted px-1 rounded">{"{{name}}"}</code> - Nome do usuário</p>
                  <p><code className="bg-muted px-1 rounded">{"{{email}}"}</code> - Email do usuário</p>
                  <p><code className="bg-muted px-1 rounded">{"{{company_name}}"}</code> - Nome da empresa</p>
                  <p><code className="bg-muted px-1 rounded">{"{{login_url}}"}</code> - URL de login</p>
                  <p><code className="bg-muted px-1 rounded">{"{{temporary_password}}"}</code> - Senha temporária</p>
                  {formData.variables.map(variable => (
                    <p key={variable}>
                      <code className="bg-muted px-1 rounded">{`{{${variable}}}`}</code> - Variável personalizada
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {template ? 'Atualizar' : 'Criar'} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}