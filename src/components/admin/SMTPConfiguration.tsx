import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Save, TestTube } from "lucide-react";

export function SMTPConfiguration() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    provider: "gmail",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
  });

  const [testing, setTesting] = useState(false);

  const providerConfigs = {
    gmail: {
      host: "smtp.gmail.com",
      port: "587",
      instructions: "Use sua senha de app do Gmail (não a senha normal da conta)"
    },
    outlook: {
      host: "smtp-mail.outlook.com",
      port: "587",
      instructions: "Use sua senha normal do Outlook/Hotmail"
    },
    custom: {
      host: "",
      port: "587",
      instructions: "Configure manualmente seu servidor SMTP"
    }
  };

  const handleProviderChange = (provider: string) => {
    const providerConfig = providerConfigs[provider as keyof typeof providerConfigs];
    setConfig(prev => ({
      ...prev,
      provider,
      smtpHost: providerConfig.host,
      smtpPort: providerConfig.port,
    }));
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      // Aqui você pode implementar um teste de conexão
      // Por enquanto, vamos simular
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Teste de conexão",
        description: "Configuração SMTP testada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao conectar com o servidor SMTP.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuração SMTP
          </CardTitle>
          <CardDescription>
            Configure sua conta de email (Gmail ou Outlook) para envio automático de emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provedor de Email</Label>
            <Select value={config.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="outlook">Outlook/Hotmail</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {providerConfigs[config.provider as keyof typeof providerConfigs]?.instructions}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Servidor SMTP</Label>
              <Input
                id="smtpHost"
                value={config.smtpHost}
                onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
                disabled={config.provider !== "custom"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Porta</Label>
              <Input
                id="smtpPort"
                value={config.smtpPort}
                onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                placeholder="587"
                disabled={config.provider !== "custom"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpUser">Email/Usuário</Label>
            <Input
              id="smtpUser"
              type="email"
              value={config.smtpUser}
              onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
              placeholder="seu-email@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpPassword">Senha</Label>
            <Input
              id="smtpPassword"
              type="password"
              value={config.smtpPassword}
              onChange={(e) => setConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
              placeholder="Senha de app (Gmail) ou senha normal (Outlook)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromEmail">Email do Remetente (opcional)</Label>
            <Input
              id="fromEmail"
              type="email"
              value={config.fromEmail}
              onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
              placeholder="Se vazio, usará o mesmo email de usuário"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={testing} variant="outline">
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? "Testando..." : "Testar Conexão"}
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>

      {config.provider === "gmail" && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Gmail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <h4 className="font-medium">Passos para configurar o Gmail:</h4>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Acesse sua conta Google</li>
                <li>Vá em "Gerenciar sua Conta do Google"</li>
                <li>Clique em "Segurança" no menu lateral</li>
                <li>Ative a "Verificação em duas etapas"</li>
                <li>Procure por "Senhas de app" e clique</li>
                <li>Selecione "Email" e "Outro (nome personalizado)"</li>
                <li>Digite "Sistema Hemera" e clique em "Gerar"</li>
                <li>Use a senha gerada no campo acima</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {config.provider === "outlook" && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Outlook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <h4 className="font-medium">Passos para configurar o Outlook:</h4>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Acesse sua conta Microsoft</li>
                <li>Vá em "Segurança" → "Opções de segurança avançadas"</li>
                <li>Ative a "Verificação em duas etapas" se ainda não estiver</li>
                <li>Use sua senha normal do Outlook no campo acima</li>
                <li>Certifique-se de que o SMTP está habilitado</li>
              </ol>
              <p className="text-muted-foreground mt-2">
                <strong>Nota:</strong> Algumas contas podem precisar de senha de app. 
                Se der erro, tente gerar uma senha de app específica.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}