import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, Users, BookOpen, Award, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/lovable-uploads/3b816e75-ad3b-46cf-8bb3-62b314414c40.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="absolute inset-0 gradient-hero"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <Building2 className="w-16 h-16 text-primary-light mx-auto mb-6 animate-float" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent">
                Hemera Capital Partners
              </span>
            </h1>
          </div>

          <div className="mb-12 animate-fade-in-up animate-delay-100">
            <p className="text-xl md:text-2xl text-gray-200 mb-4 leading-relaxed">
              Explore our interactive onboarding system designed to guide you through our processes, resources, and team dynamics.
            </p>
            <p className="text-lg text-gray-300 mb-8">
              Whether you're a new collaborator or seeking access, we're here to support your journey.
            </p>
            <p className="text-base text-gray-400 font-medium">
              Your journey to success starts here.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animate-delay-200">
            <Button 
              variant="corporate" 
              size="xl" 
              asChild
              className="group"
            >
              <Link to="/dashboard">
                Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              Request Access
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-white/60" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Your Complete Onboarding Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our comprehensive platform designed to accelerate your integration into the HCP culture and processes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="gradient-card border-0 shadow-elegant hover:shadow-glow transition-smooth animate-fade-in-up">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Interactive Modules</h3>
                <p className="text-muted-foreground">
                  Engaging learning modules covering our culture, values, and operational procedures.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-0 shadow-elegant hover:shadow-glow transition-smooth animate-fade-in-up animate-delay-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Mentorship Program</h3>
                <p className="text-muted-foreground">
                  Connect with experienced team members who will guide your professional journey.
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-0 shadow-elegant hover:shadow-glow transition-smooth animate-fade-in-up animate-delay-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Achievement System</h3>
                <p className="text-muted-foreground">
                  Earn certificates and recognition as you progress through your onboarding milestones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-smooth">
              Terms of Use
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth">
              Contact
            </Link>
          </div>
          <div className="text-center text-muted-foreground">
            <p>©2024 Hemera Capital Partners. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;