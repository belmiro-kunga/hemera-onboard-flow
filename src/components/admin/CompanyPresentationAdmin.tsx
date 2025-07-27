import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Save, 
  Upload, 
  Plus, 
  X, 
  Eye,
  Settings,
  Image,
  Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyPresentationData {
  id?: string;
  company_name: string;
  mission: string;
  vision: string;
  values: string[];
  history: string;
  logo_url: string;
  video_url: string;
  is_active: boolean;
  requires_acknowledgment: boolean;
}

const CompanyPresentationAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presentation, setPresentation] = useState<CompanyPresentationData>({
    company_name: '',
    mission: '',
    vision: '',
    values: [],
    history: '',
    logo_url: '',
    video_url: '',
    is_active: true,
    requires_acknowledgment: true
  });
  const [newValue, setNewValue] = useState('');
  const [settings, setSettings] = useState({
    presentation_enabled: true,
    presentation_mandatory: true,
    presentation_skip_allowed: false,
    presentation_auto_show: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch presentation data
      const { data: presentationData, error: presentationError } = await supabase
        .from('company_presentation')
        .select('*')
        .eq('is_active', true)
        .single();

      if (presentationError && presentationError.code !== 'PGRST116') {
        throw presentationError;
      }

      if (presentationData) {
        // Safe conversion of Json to string[]
        let valuesArray: string[] = [];
        if (presentationData.values) {
          if (Array.isArray(presentationData.values)) {
            valuesArray = presentationData.values.filter((v): v is string => typeof v === 'string');
          } else if (typeof presentationData.values === 'string') {
            try {
              const parsed = JSON.parse(presentationData.values);
              valuesArray = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
            } catch {
              valuesArray = [];
            }
          }
        }

        setPresentation({
          ...presentationData,
          values: valuesArray
        });
      }

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'presentation_enabled',
          'presentation_mandatory', 
          'presentation_skip_allowed',
          'presentation_auto_show'
        ]);

      if (settingsError) throw settingsError;

      const settingsObj = settingsData.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value === 'true';
        return acc;
      }, {} as any);

      setSettings(prev => ({ ...prev, ...settingsObj }));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save presentation data
      const presentationData = {
        ...presentation,
        values: JSON.stringify(presentation.values)
      };

      if (presentation.id) {
        const { error } = await supabase
          .from('company_presentation')
          .update(presentationData)
          .eq('id', presentation.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('company_presentation')
          .insert([presentationData])
          .select()
          .single();
        
        if (error) throw error;
        setPresentation(prev => ({ ...prev, id: data.id }));
      }

      // Save settings
      const settingsUpdates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value.toString(),
        description: getSettingDescription(key)
      }));

      for (const setting of settingsUpdates) {
        await supabase
          .from('site_settings')
          .upsert(setting, { 
            onConflict: 'setting_key',
            ignoreDuplicates: false 
          });
      }

      toast.success('Apresentação salva com sucesso!');
    } catch (error) {
      console.error('Error saving presentation:', error);
      toast.error('Erro ao salvar apresentação');
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key: string) => {
    const descriptions = {
      presentation_enabled: 'Habilitar apresentação da empresa',
      presentation_mandatory: 'Tornar apresentação obrigatória',
      presentation_skip_allowed: 'Permitir pular apresentação',
      presentation_auto_show: 'Exibir automaticamente no primeiro login'
    };
    return descriptions[key] || '';
  };

  const addValue = () => {
    if (newValue.trim()) {
      setPresentation(prev => ({
        ...prev,
        values: [...prev.values, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const removeValue = (index: number) => {
    setPresentation(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'video') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const bucket = type === 'logo' ? 'site-assets' : 'site-assets';
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const fieldName = type === 'logo' ? 'logo_url' : 'video_url';
      setPresentation(prev => ({
        ...prev,
        [fieldName]: urlData.publicUrl
      }));

      toast.success(`${type === 'logo' ? 'Logo' : 'Vídeo'} carregado com sucesso!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload do arquivo');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Apresentação da Empresa
          </h1>
          <p className="text-muted-foreground">
            Configure a apresentação institucional para novos funcionários
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Apresentação Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar apresentação para novos usuários
                </p>
              </div>
              <Switch
                checked={settings.presentation_enabled}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, presentation_enabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Obrigatória</Label>
                <p className="text-sm text-muted-foreground">
                  Tornar apresentação obrigatória
                </p>
              </div>
              <Switch
                checked={settings.presentation_mandatory}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, presentation_mandatory: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Permitir Pular</Label>
                <p className="text-sm text-muted-foreground">
                  Usuário pode pular a apresentação
                </p>
              </div>
              <Switch
                checked={settings.presentation_skip_allowed}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, presentation_skip_allowed: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="font-medium">Exibir Automaticamente</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar no primeiro login
                </p>
              </div>
              <Switch
                checked={settings.presentation_auto_show}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({ ...prev, presentation_auto_show: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input
                id="company_name"
                value={presentation.company_name}
                onChange={(e) =>
                  setPresentation(prev => ({ ...prev, company_name: e.target.value }))
                }
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <div className="flex gap-2">
                <Input
                  id="logo_url"
                  value={presentation.logo_url}
                  onChange={(e) =>
                    setPresentation(prev => ({ ...prev, logo_url: e.target.value }))
                  }
                  placeholder="URL do logo"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mission">Missão</Label>
            <Textarea
              id="mission"
              value={presentation.mission}
              onChange={(e) =>
                setPresentation(prev => ({ ...prev, mission: e.target.value }))
              }
              placeholder="Missão da empresa"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="vision">Visão</Label>
            <Textarea
              id="vision"
              value={presentation.vision}
              onChange={(e) =>
                setPresentation(prev => ({ ...prev, vision: e.target.value }))
              }
              placeholder="Visão da empresa"
              rows={3}
            />
          </div>

          <div>
            <Label>Valores</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Adicionar valor"
                  onKeyPress={(e) => e.key === 'Enter' && addValue()}
                />
                <Button onClick={addValue} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {presentation.values.map((value, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {value}
                    <button onClick={() => removeValue(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="history">História</Label>
            <Textarea
              id="history"
              value={presentation.history}
              onChange={(e) =>
                setPresentation(prev => ({ ...prev, history: e.target.value }))
              }
              placeholder="História da empresa"
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="video_url">Vídeo Institucional URL</Label>
            <div className="flex gap-2">
              <Input
                id="video_url"
                value={presentation.video_url}
                onChange={(e) =>
                  setPresentation(prev => ({ ...prev, video_url: e.target.value }))
                }
                placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'video');
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Visualizar Apresentação</h3>
              <p className="text-muted-foreground">
                Veja como a apresentação ficará para os usuários
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Visualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPresentationAdmin;