import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BaseSettingsComponent, useSettingsManager } from "./base/BaseSettingsComponent";
import { FileUploadComponent } from "./base/FileUploadComponent";
import { ColorPickerComponent } from "./base/ColorPickerComponent";
import { useCommonHook } from "@/hooks/useCommonHook";
import { 
  Download,
  Upload,
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
  
  const { saveSettings, resetSettings } = useSettingsManager();
  const { showSuccess } = useCommonHook();

  const handleSave = async () => {
    const settings = {
      logoFile,
      faviconFile,
      primaryColor,
      secondaryColor,
      customCSS,
      previewMode
    };
    await saveSettings(settings, 'branding');
  };

  const handleReset = async () => {
    await resetSettings('branding');
    setLogoFile(null);
    setFaviconFile(null);
    setPrimaryColor("#3b82f6");
    setSecondaryColor("#64748b");
    setCustomCSS("");
    setPreviewMode(false);
  };

  const handlePreview = () => {
    showSuccess('Modo preview ativado!');
  };

  // Configuração das tabs
  const tabs = [
    {
      value: "logos",
      label: "Logos & Ícones",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadComponent
                id="logo-upload"
                label="Upload do Logo"
                description="PNG, JPG ou SVG até 2MB"
                currentFile={logoFile}
                onFileChange={setLogoFile}
                icon={<Image className="h-8 w-8 text-muted-foreground" />}
              />
              <div className="mt-4 space-y-2">
                <Label htmlFor="logo-alt">Texto Alternativo</Label>
                <Input id="logo-alt" placeholder="Descrição do logo para acessibilidade" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Favicon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadComponent
                id="favicon-upload"
                label="Upload do Favicon"
                description="ICO, PNG 32x32px"
                accept="image/x-icon,image/png"
                currentFile={faviconFile}
                onFileChange={setFaviconFile}
                previewClassName="w-8 h-8"
                icon={<Monitor className="h-8 w-8 text-muted-foreground" />}
              />
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      value: "colors",
      label: "Cores & Temas",
      content: (
        <ColorPickerComponent
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onPrimaryChange={setPrimaryColor}
          onSecondaryChange={setSecondaryColor}
        />
      )
    },
    {
      value: "typography",
      label: "Tipografia",
      content: (
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
      )
    },
    {
      value: "custom",
      label: "CSS Customizado",
      content: (
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
      )
    }
  ];

  const headerActions = (
    <div className="flex items-center gap-2">
      <Switch
        checked={previewMode}
        onCheckedChange={setPreviewMode}
        id="preview-mode"
      />
      <Label htmlFor="preview-mode">Modo Preview</Label>
    </div>
  );

  return (
    <BaseSettingsComponent
      title="Configurações de Branding"
      tabs={tabs}
      defaultTab="logos"
      onSave={handleSave}
      onReset={handleReset}
      onPreview={handlePreview}
      showPreview={true}
      headerActions={headerActions}
    />
  );
}