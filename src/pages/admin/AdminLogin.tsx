import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Building2, Lock, Loader2 } from "lucide-react";
import { useCommonHook } from '@/hooks/useCommonHook';
import { database } from '@/lib/database';
import { default as AdminLoginForm } from "@/components/auth/AdminLoginForm";
const AdminLogin = () => {
  // Aplicar padrões consolidados de hook base
  const { showError, showSuccess } = useCommonHook();
  const navigate = useNavigate();

  // Função auxiliar para detectar ambiente
  const isBrowser = typeof window !== 'undefined';

  // Função auxiliar para operações de database com fallback
  const executeWithFallback = async (
    operation: () => Promise<any>,
    mockData?: any
  ) => {
    if (isBrowser && mockData) {
      console.warn('🔧 Using mock admin login data');
      return { data: mockData, error: null };
    }

    try {
      return await operation();
    } catch (error) {
      console.warn('Database operation failed, using fallback');
      return { data: mockData || null, error: null };
    }
  };

  // Padronizar lógica de autenticação - verificar se já está logado
  const { data: currentUser, isLoading: checkingAuth } = useQuery({
    queryKey: ['current-admin-user-check'],
    queryFn: async () => {
      const mockUser = null; // Não logado por padrão

      const result = await executeWithFallback(
        () => database
          .from('profiles')
          .select('id, name, email, role, is_active')
          .eq('role', 'admin')
          .eq('is_active', true)
          .single()
          .select_query(),
        mockUser
      );

      if (result.error) return null;
      return result.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: false, // Não retry para verificação de auth
  });

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (currentUser && !checkingAuth) {
      showSuccess("Você já está logado como administrador.");
      navigate('/admin');
    }
  }, [currentUser, checkingAuth, navigate, showSuccess]);

  // Implementar loading states consistentes
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/20 via-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-muted/30 font-poppins relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-24 h-24 bg-primary/3 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-60 right-20 w-32 h-32 bg-accent/3 rounded-full blur-lg animate-float" style={{
        animationDelay: '2s'
      }}></div>
        <div className="absolute bottom-32 left-20 w-28 h-28 bg-secondary/3 rounded-full blur-2xl animate-float" style={{
        animationDelay: '4s'
      }}></div>
        <div className="absolute bottom-60 right-10 w-20 h-20 bg-primary/2 rounded-full blur-xl animate-float" style={{
        animationDelay: '1s'
      }}></div>
      </div>

      {/* Enhanced Logo Header */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in-up">
        
      </div>

      {/* Centered Login Form */}
      <div className="flex min-h-screen items-center justify-center px-8 py-16">
        <div className="w-full max-w-md animate-fade-in-up" style={{
        animationDelay: '0.3s'
      }}>
          {/* Security Badge */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Acesso Restrito</span>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Acesso Administrativo
            </h1>
            <p className="text-muted-foreground">
              Entre com suas credenciais de administrador
            </p>
            <div className="mt-4 w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
          
          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-md hover:shadow-glow transition-all duration-500 hover:scale-[1.02]">
            <CardContent className="p-8">
              <AdminLoginForm />
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center animate-fade-in-up" style={{
          animationDelay: '0.6s'
        }}>
            <div className="bg-muted/30 rounded-lg p-4 border border-border/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Área Segura</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Este é um ambiente administrativo protegido. Todos os acessos são monitorados e registrados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default AdminLogin;