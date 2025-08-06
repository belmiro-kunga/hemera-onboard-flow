import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommonHook } from "@/hooks/useCommonHook";

import { Save, RefreshCw, Eye } from "lucide-react";

interface TabConfig {
  value: string;
  label: string;
  content: ReactNode;
}

interface BaseSettingsProps {
  title?: string;
  tabs: TabConfig[];
  defaultTab?: string;
  onSave?: () => void;
  onReset?: () => void;
  onPreview?: () => void;
  showPreview?: boolean;
  isLoading?: boolean;
  headerActions?: ReactNode;
}

export const BaseSettingsComponent = ({
  title,
  tabs,
  defaultTab,
  onSave,
  onReset,
  onPreview,
  showPreview = false,
  isLoading = false,
  headerActions
}: BaseSettingsProps) => {
  const { showSuccess, showError } = useCommonHook();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || '');

  const handleSave = async () => {
    try {
      await onSave?.();
      showSuccess('Configurações salvas com sucesso!');
    } catch (error) {
      showError(error, 'Erro ao salvar configurações');
    }
  };

  const handleReset = async () => {
    try {
      await onReset?.();
      showSuccess('Configurações resetadas com sucesso!');
    } catch (error) {
      showError(error, 'Erro ao resetar configurações');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
        </div>
        
        <div className="flex gap-2">
          {headerActions}
          
          {onReset && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          )}
          
          {showPreview && onPreview && (
            <Button 
              variant="outline" 
              onClick={onPreview}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          
          {onSave && (
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full grid-cols-${tabs.length}`}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Hook para gerenciar configurações
export const useSettingsManager = () => {
  const { showSuccess, showError } = useCommonHook();

  const saveSettings = async (settings: any, endpoint?: string) => {
    try {
      // TODO: Implement actual API call
      console.log('Saving settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      return settings;
    } catch (error) {
      throw error;
    }
  };

  const loadSettings = async (endpoint?: string) => {
    try {
      // TODO: Implement actual API call
      console.log('Loading settings from:', endpoint);
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
      return {};
    } catch (error) {
      throw error;
    }
  };

  const resetSettings = async (endpoint?: string) => {
    try {
      // TODO: Implement actual API call
      console.log('Resetting settings for:', endpoint);
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
      return {};
    } catch (error) {
      throw error;
    }
  };

  return {
    saveSettings,
    loadSettings,
    resetSettings,
    showSuccess,
    showError
  };
};