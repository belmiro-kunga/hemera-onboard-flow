import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
}

interface ColorPickerProps {
  primaryColor: string;
  secondaryColor: string;
  onPrimaryChange: (color: string) => void;
  onSecondaryChange: (color: string) => void;
  presets?: ColorPreset[];
  showPresets?: boolean;
}

const defaultPresets: ColorPreset[] = [
  { name: "Azul Corporativo", primary: "#3b82f6", secondary: "#64748b" },
  { name: "Verde Empresarial", primary: "#10b981", secondary: "#6b7280" },
  { name: "Roxo Moderno", primary: "#8b5cf6", secondary: "#6b7280" },
  { name: "Laranja Vibrante", primary: "#f59e0b", secondary: "#6b7280" },
  { name: "Vermelho Elegante", primary: "#ef4444", secondary: "#6b7280" },
  { name: "Cinza Minimalista", primary: "#6b7280", secondary: "#9ca3af" },
];

export const ColorPickerComponent = ({
  primaryColor,
  secondaryColor,
  onPrimaryChange,
  onSecondaryChange,
  presets = defaultPresets,
  showPresets = true
}: ColorPickerProps) => {
  const applyColorPreset = (preset: ColorPreset) => {
    onPrimaryChange(preset.primary);
    onSecondaryChange(preset.secondary);
  };

  return (
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
                onChange={(e) => onPrimaryChange(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={primaryColor}
                onChange={(e) => onPrimaryChange(e.target.value)}
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
                onChange={(e) => onSecondaryChange(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => onSecondaryChange(e.target.value)}
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
      {showPresets && (
        <Card>
          <CardHeader>
            <CardTitle>Presets de Cores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {presets.map((preset, index) => (
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
      )}
    </div>
  );
};