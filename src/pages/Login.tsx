import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import BirthdaySection from "@/components/birthday/BirthdaySection";
import useScrollEffect from "@/hooks/useScrollEffect";
const Login = () => {
  const scrollOffset = useScrollEffect(0.15, 25);
  console.log('Scroll offset:', scrollOffset); // Debug log

  return <div 
      className="min-h-screen font-poppins relative overflow-hidden"
      style={{
        backgroundImage: `url('/lovable-uploads/3b816e75-ad3b-46cf-8bb3-62b314414c40.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay for Contrast */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/20 to-background/40"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
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
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/95 backdrop-blur-lg shadow-2xl border border-border/60">
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
        <div className="flex-[0_0_45%] bg-gradient-to-br from-background/30 via-background/20 to-background/30 backdrop-blur-sm flex flex-col relative z-20">
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
              
              <Card className="shadow-2xl border-0 bg-card/98 backdrop-blur-lg hover:shadow-glow transition-all duration-500 hover:scale-[1.02] border border-border/30">
                <CardContent className="p-10">
                  <LoginForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Pane - Birthday Section (55%) */}
        <div className="flex-[0_0_55%] bg-gradient-to-bl from-background/30 via-background/20 to-background/30 backdrop-blur-sm flex items-center justify-center p-8 relative z-20">
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