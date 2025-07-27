import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCompleteData } from "@/lib/validations/user";
import { Key, Eye, EyeOff, RefreshCw } from "lucide-react";

interface CredentialsStepProps {
  form: UseFormReturn<UserCompleteData>;
}

export default function CredentialsStep({ form }: CredentialsStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    form.setValue("password", password);
    form.setValue("confirmPassword", password);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Credenciais de Acesso</h3>
        <p className="text-muted-foreground">
          Defina as credenciais de login do usuário. Uma senha segura será gerada automaticamente.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Senha *
              </FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite a senha"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Gerar
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha *</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a senha"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Política de Senhas</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Mínimo de 6 caracteres</li>
          <li>• Recomendado: combinação de letras, números e símbolos</li>
          <li>• O usuário poderá alterar a senha no primeiro login</li>
        </ul>
      </div>
    </div>
  );
}