import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import BirthdaySection from "@/components/birthday/BirthdaySection";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">HCP Onboarding</h1>
            <p className="text-sm text-muted-foreground">Portal Corporativo</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Login Section */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-elegant">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">Acesso ao Sistema</CardTitle>
                <p className="text-muted-foreground">Entre com suas credenciais corporativas</p>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </div>

          {/* Separator */}
          <div className="flex items-center justify-center lg:hidden">
            <Separator className="w-full" />
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <Separator orientation="vertical" className="h-96" />
          </div>

          {/* Birthday Section */}
          <div className="flex items-center justify-center">
            <BirthdaySection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;