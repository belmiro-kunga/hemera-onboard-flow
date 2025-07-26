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

const loginSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .refine((email) => email.endsWith("@hcp.com"), {
      message: "Use seu email corporativo (@hcp.com)",
    }),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${data.email.split("@")[0]}!`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Corporativo</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu.nome@hcp.com"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            {...register("password")}
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Login Button */}
      <Button
        type="submit"
        className="w-full"
        variant="corporate"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Entrar
          </>
        )}
      </Button>

      {/* Links */}
      <div className="text-center space-y-2">
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => toast({
            title: "Recuperação de senha",
            description: "Entre em contato com o suporte para redefinir sua senha.",
          })}
        >
          Esqueci minha senha
        </button>
        <div className="text-sm text-muted-foreground">
          Não tem acesso?{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => toast({
              title: "Solicitar acesso",
              description: "Entre em contato com o RH para solicitar acesso ao sistema.",
            })}
          >
            Solicitar acesso
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;