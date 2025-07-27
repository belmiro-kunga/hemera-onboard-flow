import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const loginSchema = z.object({
  email: z.string().email("Email inválido").refine(email => email.endsWith("@hcp.com"), {
    message: "Use seu email corporativo (@hcp.com)"
  }),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});
type LoginForm = z.infer<typeof loginSchema>;
const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (authData.user) {
        // Update last_login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', authData.user.id);

        // Check if user needs to see presentation
        const { data: needsPresentation } = await supabase.rpc('user_needs_presentation', {
          user_uuid: authData.user.id
        });

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo de volta, ${data.email.split("@")[0]}!`
        });
        
        // Redirect based on first login status
        if (needsPresentation) {
          navigate("/welcome");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {/* Email Field */}
      <div className="space-y-3 animate-fade-in-up" style={{
      animationDelay: '0.1s'
    }}>
        <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          Email Corporativo
        </Label>
        <div className="relative group">
          <Input id="email" type="email" placeholder="seu.nome@hcp.com" {...register("email")} className={`rounded-2xl border bg-background/80 backdrop-blur-sm px-6 py-4 text-sm transition-all duration-300 focus:border-primary focus:ring-0 focus:shadow-glow hover:shadow-md group-hover:border-primary/50 ${errors.email ? "border-destructive animate-shake" : "border-border"}`} />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        {errors.email && <p className="text-sm text-destructive flex items-center gap-2 animate-fade-in">
            <div className="w-1 h-1 bg-destructive rounded-full"></div>
            {errors.email.message}
          </p>}
      </div>

      {/* Password Field */}
      <div className="space-y-3 animate-fade-in-up" style={{
      animationDelay: '0.2s'
    }}>
        <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
          Senha
        </Label>
        <div className="relative group">
          <Input id="password" type={showPassword ? "text" : "password"} placeholder="Digite sua senha" {...register("password")} className={`rounded-2xl border bg-background/80 backdrop-blur-sm px-6 py-4 pr-14 text-sm transition-all duration-300 focus:border-primary focus:ring-0 focus:shadow-glow hover:shadow-md group-hover:border-primary/50 ${errors.password ? "border-destructive animate-shake" : "border-border"}`} />
          <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10 rounded-full transition-all duration-200 hover:scale-110" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        {errors.password && <p className="text-sm text-destructive flex items-center gap-2 animate-fade-in">
            <div className="w-1 h-1 bg-destructive rounded-full"></div>
            {errors.password.message}
          </p>}
      </div>

      {/* Login Button */}
      <div className="pt-4 animate-fade-in-up" style={{
      animationDelay: '0.3s'
    }}>
        <Button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-4 px-6 text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-glow disabled:opacity-60 disabled:hover:scale-100 group" size="lg" disabled={isLoading}>
          {isLoading ? <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Entrando...</span>
            </div> : <div className="flex items-center gap-3 group-hover:gap-4 transition-all duration-300">
              <LogIn className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Entrar no Sistema</span>
            </div>}
        </Button>
      </div>

      {/* Links */}
      <div className="text-center space-y-3 pt-4 animate-fade-in-up" style={{
      animationDelay: '0.4s'
    }}>
        <button type="button" className="text-sm text-primary hover:text-accent transition-all duration-300 hover:scale-105 story-link" onClick={() => toast({
        title: "Recuperação de senha",
        description: "Entre em contato com o suporte para redefinir sua senha."
      })}>
          Esqueci minha senha
        </button>
        
      </div>
    </form>;
};
export default LoginForm;