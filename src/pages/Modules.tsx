import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Clock, 
  Star, 
  Lock, 
  Play, 
  Search,
  Filter,
  Heart,
  Share2,
  CheckCircle,
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";

const Modules = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const modules = [
    {
      id: 1,
      title: "Culture and Values HCP",
      description: "Learn about our company culture, core values, and what makes HCP unique in the financial industry.",
      duration: 45,
      points: 150,
      progress: 80,
      status: "in_progress" as const,
      category: "Culture",
      isRequired: true,
      isFavorite: true,
      completedLessons: 6,
      totalLessons: 8,
      deadline: "3 days",
      thumbnail: "🏢"
    },
    {
      id: 2,
      title: "Compliance and Ethics",
      description: "Essential compliance guidelines and ethical standards that govern our operations and decision-making.",
      duration: 30,
      points: 120,
      progress: 0,
      status: "locked" as const,
      category: "Compliance",
      isRequired: true,
      isFavorite: false,
      prerequisite: "Culture and Values HCP",
      completedLessons: 0,
      totalLessons: 5,
      thumbnail: "⚖️"
    },
    {
      id: 3,
      title: "Investment Strategies Overview",
      description: "Introduction to HCP's investment philosophy, strategies, and portfolio management approach.",
      duration: 60,
      points: 200,
      progress: 100,
      status: "completed" as const,
      category: "Investment",
      isRequired: false,
      isFavorite: true,
      completedLessons: 10,
      totalLessons: 10,
      certificateEarned: true,
      thumbnail: "📈"
    },
    {
      id: 4,
      title: "Team Collaboration Tools",
      description: "Master the tools and platforms we use for communication, project management, and collaboration.",
      duration: 25,
      points: 80,
      progress: 45,
      status: "in_progress" as const,
      category: "Technology",
      isRequired: false,
      isFavorite: false,
      completedLessons: 3,
      totalLessons: 6,
      thumbnail: "🛠️"
    },
    {
      id: 5,
      title: "Risk Management Fundamentals",
      description: "Understanding risk assessment, mitigation strategies, and regulatory requirements in finance.",
      duration: 50,
      points: 180,
      progress: 0,
      status: "available" as const,
      category: "Risk Management",
      isRequired: true,
      isFavorite: false,
      completedLessons: 0,
      totalLessons: 8,
      thumbnail: "🛡️"
    },
    {
      id: 6,
      title: "Client Relationship Management",
      description: "Best practices for building and maintaining strong relationships with our clients and stakeholders.",
      duration: 35,
      points: 140,
      progress: 0,
      status: "available" as const,
      category: "Client Relations",
      isRequired: false,
      isFavorite: false,
      completedLessons: 0,
      totalLessons: 7,
      thumbnail: "🤝"
    }
  ];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
                         filterStatus === "completed" && module.status === "completed" ||
                         filterStatus === "in_progress" && module.status === "in_progress" ||
                         filterStatus === "available" && module.status === "available" ||
                         filterStatus === "required" && module.isRequired;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "in_progress": return "bg-warning text-warning-foreground";
      case "available": return "bg-primary text-primary-foreground";
      case "locked": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "in_progress": return <Play className="w-4 h-4" />;
      case "available": return <BookOpen className="w-4 h-4" />;
      case "locked": return <Lock className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-card border-b border-border shadow-corporate">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Learning Modules</h1>
              <p className="text-muted-foreground">Complete your onboarding journey with our comprehensive modules</p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 lg:w-auto w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {["all", "in_progress", "completed", "available", "required"].map((filter) => (
                  <Button
                    key={filter}
                    variant={filterStatus === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(filter)}
                    className="capitalize"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    {filter.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Module Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => (
            <Card 
              key={module.id} 
              className="gradient-card border-0 shadow-elegant hover:shadow-glow transition-smooth animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{module.thumbnail}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{module.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {module.category}
                        </Badge>
                        {module.isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className={`w-4 h-4 ${module.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {module.description}
                </p>

                {/* Progress Bar */}
                {module.status === "in_progress" && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {module.completedLessons} of {module.totalLessons} lessons completed
                    </p>
                  </div>
                )}

                {/* Module Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{module.duration}min</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star className="w-4 h-4" />
                      <span>{module.points} pts</span>
                    </div>
                  </div>
                  
                  {module.certificateEarned && (
                    <div className="flex items-center gap-1 text-success">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs">Certified</span>
                    </div>
                  )}
                </div>

                {/* Prerequisite Warning */}
                {module.status === "locked" && module.prerequisite && (
                  <div className="p-3 bg-warning-light rounded-lg border border-warning/20">
                    <p className="text-sm text-warning-foreground">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Complete "{module.prerequisite}" to unlock
                    </p>
                  </div>
                )}

                {/* Deadline Warning */}
                {module.deadline && module.status === "in_progress" && (
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm text-destructive">
                      ⏰ Deadline: {module.deadline}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {module.status === "locked" ? (
                    <Button variant="outline" className="flex-1" disabled>
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </Button>
                  ) : module.status === "completed" ? (
                    <Button variant="secondary" className="flex-1" asChild>
                      <Link to={`/modules/${module.id}`}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Review
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="default" className="flex-1" asChild>
                      <Link to={`/modules/${module.id}`}>
                        {module.status === "in_progress" ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Start
                          </>
                        )}
                      </Link>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="icon">
                    <Badge className={`w-4 h-4 ${getStatusColor(module.status)}`}>
                      {getStatusIcon(module.status)}
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No modules found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modules;