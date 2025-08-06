import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCommonHook } from "@/hooks/useCommonHook";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, Shield, KeyRound } from "lucide-react";

const adminLoginSchema = z.object({
  email: z.string().email("Email inválido").refine(email => 
    email.endsWith("@hcp.com"), {
    message: "Use seu email administrativo (@hcp.com)"
  }),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  accessCode: z.string().optional()
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  // Aplicar padrões consolidados de hook base
  const { showError, showSuccess, invalidateQueries } = useCommonHook();

  // Função auxiliar para detectar ambiente
  const isBrowser = typeof window !== 'undefined';

  // Função auxiliar para operações de database com fallback
  const executeWithFallback = async (
    operation: () => Promise<any>,
    mockData?: any
  ) => {
    if (isBrowser && mockData) {
      console.warn('🔧 Using mock admin authentication');
      return { data: mockData, error: null };
    }

    try {
      return await operation();
    } catch (error) {
      console.warn('Database operation failed, using fallback');
      return { data: mockData || null, error: null };
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema)
  });

  const onSubmit = async (data: AdminLoginForm) => {
    setIsLoading(true);
    try {
      // Define valid admin credentials
      const validAdminCredentials = [
        { email: 'superadmin@hcp.com', password: 'admin123', name: 'Super Administrador' },
        { email: 'admin@hcp.com', password: 'admin123', name: 'Administrador' },
        { email: 'funcionario.teste@hcp.com', password: '123456', name: 'Funcionário Teste' }
      ];

      // Check credentials
      const adminUser = validAdminCredentials.find(
        cred => cred.email === data.email && cred.password === data.password
      );

      if (!adminUser) {
        throw new Error('Credenciais administrativas inválidas');
      }

      // Use the main auth system to sign in
      const result = await signIn(data.email, data.password);
      
      if (result.error) {
        throw new Error(result.error);
      }

      showSuccess(`Bem-vindo ao painel admin, ${adminUser.name}!`);
      
      // Invalidar queries relacionadas à autenticação
      invalidateQueries(['current-admin-user', 'current-admin-user-check']);
      
      navigate("/admin/dashboard");
    } catch (error: any) {
      showError(error, "Credenciais administrativas inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <Label htmlFor="admin-email" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          Email Administrativo
        </Label>
        <div className="relative group">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="admin-email"
            type="email"
            placeholder="admin.nome@hcp.com"
            {...register("email")}
            className={`rounded-xl border bg-background/90 backdrop-blur-sm pl-10 pr-6 py-4 text-sm transition-all duration-300 focus:border-primary focus:ring-0 focus:shadow-glow hover:shadow-md group-hover:border-primary/50 ${
              errors.email ? "border-destructive animate-shake" : "border-border"
            }`}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/3 to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        {errors.email && (
          <div className="text-sm text-destructive flex items-center gap-2 animate-fade-in">
            <div className="w-1 h-1 bg-destructive rounded-full"></div>
            {errors.email.message}
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <Label htmlFor="admin-password" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          Senha Administrativa
        </Label>
        <div className="relative group">
          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha administrativa"
            {...register("password")}
            className={`rounded-xl border bg-background/90 backdrop-blur-sm pl-10 pr-14 py-4 text-sm transition-all duration-300 focus:border-primary focus:ring-0 focus:shadow-glow hover:shadow-md group-hover:border-primary/50 ${
              errors.password ? "border-destructive animate-shake" : "border-border"
            }`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10 rounded-full transition-all duration-200 hover:scale-110"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/3 to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        {errors.password && (
          <div className="text-sm text-destructive flex items-center gap-2 animate-fade-in">
            <div className="w-1 h-1 bg-destructive rounded-full"></div>
            {errors.password.message}
          </div>
        )}
      </div>

      {/* Access Code Field (Optional) */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <Label htmlFor="access-code" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <div className="w-0.5 h-3 bg-muted-foreground/50 rounded-full"></div>
          Código de Acesso (Opcional)
        </Label>
        <div className="relative group">
          <Input
            id="access-code"
            type="text"
            placeholder="Código de segurança adicional"
            {...register("accessCode")}
            className="rounded-xl border bg-background/90 backdrop-blur-sm px-6 py-3 text-sm transition-all duration-300 focus:border-primary focus:ring-0 focus:shadow-glow hover:shadow-md group-hover:border-primary/50 border-border"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/3 to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>

      {/* Login Button */}
      <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <Button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-4 px-6 text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-glow disabled:opacity-60 disabled:hover:scale-100 group"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Autenticando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 group-hover:gap-4 transition-all duration-300">
              <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Acessar Painel Admin</span>
            </div>
          )}
        </Button>
      </div>

      {/* Links */}
      <div className="text-center space-y-3 pt-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <button
          type="button"
          className="text-sm text-primary hover:text-accent transition-all duration-300 hover:scale-105 story-link"
          onClick={() => navigate("/")}
        >
          ← Voltar ao login regular
        </button>
      </div>
    </form>
  );
};

export default AdminLoginForm;