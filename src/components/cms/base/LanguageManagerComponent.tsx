import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Languages, Eye, EyeOff } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
  status: 'active' | 'draft';
  progress?: number;
  lastUpdate?: string;
}

interface LanguageManagerProps {
  languages: Language[];
  selectedLanguage: string;
  onLanguageSelect: (code: string) => void;
  onLanguageEdit?: (code: string) => void;
  onLanguageToggle?: (code: string) => void;
  onAddLanguage?: () => void;
  autoDetect?: boolean;
  onAutoDetectChange?: (enabled: boolean) => void;
  rtlSupport?: boolean;
  onRtlSupportChange?: (enabled: boolean) => void;
  fallbackLanguage?: string;
  onFallbackChange?: (code: string) => void;
}

export const LanguageManagerComponent = ({
  languages,
  selectedLanguage,
  onLanguageSelect,
  onLanguageEdit,
  onLanguageToggle,
  onAddLanguage,
  autoDetect = false,
  onAutoDetectChange,
  rtlSupport = false,
  onRtlSupportChange,
  fallbackLanguage,
  onFallbackChange
}: LanguageManagerProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Sistema de Internacionalização</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie idiomas e traduções do sistema
          </p>
        </div>
        {onAddLanguage && (
          <Button onClick={onAddLanguage}>
            <Languages className="h-4 w-4 mr-2" />
            Adicionar Idioma
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <Card key={lang.code} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <CardTitle className="text-base">{lang.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{lang.code}</p>
                  </div>
                </div>
                <Badge variant="secondary" className={getStatusColor(lang.status)}>
                  {lang.status === 'active' ? 'Ativo' : 'Rascunho'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onLanguageEdit?.(lang.code)}
                >
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onLanguageToggle?.(lang.code)}
                >
                  {lang.status === 'active' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Traduzido: {lang.progress || 85}%</p>
                <p>Última atualização: {lang.lastUpdate || '12/01/2024'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Idioma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-language">Idioma Padrão</Label>
              <select 
                id="default-language" 
                className="w-full p-2 border rounded-md"
                value={selectedLanguage}
                onChange={(e) => onLanguageSelect(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fallback-language">Idioma de Fallback</Label>
              <select 
                id="fallback-language" 
                className="w-full p-2 border rounded-md"
                value={fallbackLanguage}
                onChange={(e) => onFallbackChange?.(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-detect" 
              checked={autoDetect}
              onCheckedChange={onAutoDetectChange}
            />
            <Label htmlFor="auto-detect">Detectar idioma automaticamente</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="rtl-support" 
              checked={rtlSupport}
              onCheckedChange={onRtlSupportChange}
            />
            <Label htmlFor="rtl-support">Suporte a idiomas RTL</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};