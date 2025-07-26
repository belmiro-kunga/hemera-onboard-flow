import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import BirthdaySection from "@/components/birthday/BirthdaySection";
import useScrollEffect from "@/hooks/useScrollEffect";
const Login = () => {
  const scrollOffset = useScrollEffect(0.15, 25);
  console.log('Scroll offset:', scrollOffset); // Debug log

  return <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 font-poppins relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/5 rounded-full blur-lg animate-float" style={{
        animationDelay: '2s'
      }}></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary/5 rounded-full blur-2xl animate-float" style={{
        animationDelay: '4s'
      }}></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-primary/3 rounded-full blur-xl animate-float" style={{
        animationDelay: '1s'
      }}></div>
      </div>

      {/* Enhanced Logo Header */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in-up">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/80 backdrop-blur-md shadow-elegant border border-border/50">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-glow animate-pulse">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">HCP Onboarding</h1>
            <p className="text-sm text-muted-foreground">Portal Corporativo</p>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex min-h-screen pt-16">
        {/* Left Pane - Login Form (45%) */}
        <div className="flex-[0_0_45%] bg-gradient-to-br from-muted/20 via-background to-muted/40 flex flex-col relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
          
          {/* Login Form Container */}
          <div className="flex-1 flex items-center justify-center px-8 py-4">
            <div style={{
            animationDelay: '0.3s',
            transform: `translateY(${scrollOffset}px)`
          }} className="w-full max-w-sm animate-fade-in-up transition-transform duration-300 ease-out form-scroll-float mx-0 px-0 py-0 -mt-[5%]">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Acesso ao Sistema
                </h1>
                <p className="text-muted-foreground">
                  Entre com suas credenciais corporativas
                </p>
                <div className="mt-4 w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
              </div>
              
              <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-md hover:shadow-glow transition-all duration-500 hover:scale-[1.02]">
                <CardContent className="p-10">
                  <LoginForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Pane - Birthday Section (55%) */}
        <div className="flex-[0_0_55%] bg-gradient-to-bl from-muted/20 via-background to-muted/40 flex items-center justify-center p-8 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-accent via-primary to-accent opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-16 right-16 w-20 h-20 bg-accent/10 rounded-2xl rotate-12 animate-float opacity-50"></div>
          <div className="absolute bottom-20 right-8 w-16 h-16 bg-primary/10 rounded-full animate-float opacity-60" style={{
          animationDelay: '3s'
        }}></div>
          
          {/* Content */}
          <div className="relative z-10 w-full max-w-md animate-slide-in-right" style={{
          animationDelay: '0.6s'
        }}>
            <BirthdaySection />
          </div>
        </div>
      </div>
    </div>;
};
export default Login;