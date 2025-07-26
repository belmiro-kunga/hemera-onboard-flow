import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import BirthdaySection from "@/components/birthday/BirthdaySection";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5 font-poppins">
      {/* Centered Logo Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">HCP Onboarding</h1>
            <p className="text-xs text-muted-foreground">Portal Corporativo</p>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex min-h-screen pt-24">
        {/* Left Pane - Login Form (45%) */}
        <div className="flex-[0_0_45%] bg-gradient-to-br from-background via-background to-accent/10 flex flex-col">
          {/* Login Form Container */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Acesso ao Sistema
                </h1>
                <p className="text-sm text-muted-foreground font-normal">
                  Entre com suas credenciais corporativas
                </p>
              </div>
              
              <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <LoginForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Pane - Birthday Section (55%) */}
        <div className="flex-[0_0_55%] bg-gradient-to-bl from-accent/5 via-background to-accent/10 flex items-center justify-center p-8 relative">
          {/* Soft overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent"></div>
          
          {/* Content */}
          <div className="relative z-10 w-full max-w-md">
            <BirthdaySection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;