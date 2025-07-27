import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Upload, 
  Palette, 
  Eye, 
  Download,
  RefreshCw,
  Save,
  Image,
  Code,
  Monitor
} from "lucide-react";

export default function BrandingSettings() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [customCSS, setCustomCSS] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const colorPresets = [
    { name: "Azul Corporativo", primary: "#3b82f6", secondary: "#64748b" },
    { name: "Verde Empresarial", primary: "#10b981", secondary: "#6b7280" },
    { name: "Roxo Moderno", primary: "#8b5cf6", secondary: "#6b7280" },
    { name: "Laranja Vibrante", primary: "#f59e0b", secondary: "#6b7280" },
    { name: "Vermelho Elegante", primary: "#ef4444", secondary: "#6b7280" },
    { name: "Cinza Minimalista", primary: "#6b7280", secondary: "#9ca3af" },
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFaviconFile(file);
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={previewMode}
            onCheckedChange={setPreviewMode}
            id="preview-mode"
          />
          <Label htmlFor="preview-mode">Modo Preview</Label>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logos">Logos & Ícones</TabsTrigger>
          <TabsTrigger value="colors">Cores & Temas</TabsTrigger>
          <TabsTrigger value="typography">Tipografia</TabsTrigger>
          <TabsTrigger value="custom">CSS Customizado</TabsTrigger>
        </TabsList>

        <TabsContent value="logos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Logo Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  {logoFile ? (
                    <div className="space-y-4">
                      <img 
                        src={URL.createObjectURL(logoFile)} 
                        alt="Logo preview"
                        className="max-h-20 mx-auto"
                      />
                      <p className="text-sm text-muted-foreground">{logoFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Image className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-sm font-medium">Upload do Logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG ou SVG até 2MB</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => document.getElementById('logo-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {logoFile ? 'Alterar Logo' : 'Upload Logo'}
                  </Button>
                  {logoFile && (
                    <Button variant="outline" onClick={() => setLogoFile(null)}>
                      Remover
                    </Button>
                  )}
                </div>
                
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="logo-alt">Texto Alternativo</Label>
                  <Input id="logo-alt" placeholder="Descrição do logo para acessibilidade" />
                </div>
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Favicon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  {faviconFile ? (
                    <div className="space-y-4">
                      <img 
                        src={URL.createObjectURL(faviconFile)} 
                        alt="Favicon preview"
                        className="w-8 h-8 mx-auto"
                      />
                      <p className="text-sm text-muted-foreground">{faviconFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-sm font-medium">Upload do Favicon</p>
                        <p className="text-xs text-muted-foreground">ICO, PNG 32x32px</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => document.getElementById('favicon-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {faviconFile ? 'Alterar Favicon' : 'Upload Favicon'}
                  </Button>
                  {faviconFile && (
                    <Button variant="outline" onClick={() => setFaviconFile(null)}>
                      Remover
                    </Button>
                  )}
                </div>
                
                <input
                  id="favicon-upload"
                  type="file"
                  accept="image/x-icon,image/png"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Color Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Cores Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Color Preview */}
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="text-sm font-medium">Preview das Cores</p>
                  <div className="flex gap-2">
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: primaryColor }}
                      title="Cor Primária"
                    />
                    <div 
                      className="w-12 h-12 rounded border"
                      style={{ backgroundColor: secondaryColor }}
                      title="Cor Secundária"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Presets de Cores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {colorPresets.map((preset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => applyColorPreset(preset)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <span className="text-sm font-medium">{preset.name}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        Aplicar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Tipografia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-family">Família da Fonte</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="inter">Inter (Padrão)</option>
                    <option value="roboto">Roboto</option>
                    <option value="open-sans">Open Sans</option>
                    <option value="lato">Lato</option>
                    <option value="montserrat">Montserrat</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Tamanho Base da Fonte</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="14">14px (Pequeno)</option>
                    <option value="16">16px (Padrão)</option>
                    <option value="18">18px (Grande)</option>
                    <option value="20">20px (Extra Grande)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-2">Preview da Tipografia</p>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Título Principal</h1>
                  <h2 className="text-xl font-semibold">Subtítulo</h2>
                  <p className="text-base">Este é um parágrafo de exemplo para demonstrar como o texto aparecerá com as configurações selecionadas.</p>
                  <p className="text-sm text-muted-foreground">Texto secundário em tamanho menor.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                CSS Customizado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-css">CSS Personalizado</Label>
                <Textarea
                  id="custom-css"
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  placeholder="/* Adicione seu CSS personalizado aqui */
.custom-header {
  background: linear-gradient(45deg, #primary, #secondary);
}

.custom-button {
  border-radius: 8px;
  transition: all 0.3s ease;
}"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code className="h-4 w-4" />
                <span>Use variáveis CSS como --primary-color e --secondary-color</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSS
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}