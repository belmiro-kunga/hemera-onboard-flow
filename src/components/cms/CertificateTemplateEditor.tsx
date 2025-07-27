import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Plus, 
  Edit, 
  Eye, 
  Download,
  Upload,
  Palette,
  Type,
  Image,
  Save,
  Copy
} from "lucide-react";

export default function CertificateTemplateEditor() {
  const [templates] = useState([
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

  const getTypeColor = (type: string) => {
    return type === 'course' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Templates de Certificados</h3>
          <p className="text-sm text-muted-foreground">
            Crie e personalize templates de certificados
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="elements">Elementos</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
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
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className={getTypeColor(template.type)}>
                      {template.type === 'course' ? 'Curso' : 'Simulado'}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(template.status)}>
                      {template.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Modificado: {template.lastModified}</p>
                    <p>Usado {template.usageCount} vezes</p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ferramentas de Edição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input placeholder="Nome do certificado" />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="course">Curso</option>
                    <option value="simulado">Simulado</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label>Elementos</Label>
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

                <div className="space-y-2">
                  <Label>Variáveis Disponíveis</Label>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>{{student_name}} - Nome do aluno</p>
                    <p>{{course_name}} - Nome do curso</p>
                    <p>{{completion_date}} - Data de conclusão</p>
                    <p>{{score}} - Pontuação (simulados)</p>
                    <p>{{company_name}} - Nome da empresa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canvas Preview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Preview do Certificado</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[4/3] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
                    <div className="text-center space-y-2">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm font-medium">Canvas do Certificado</p>
                      <p className="text-xs text-muted-foreground">
                        Arraste elementos da barra lateral para começar
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}