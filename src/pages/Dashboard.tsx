import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Users, 
  Clock, 
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Award,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || "Usuário";
  const overallProgress = 78;
  const currentPoints = 1250;
  const currentLevel = "Expert";
  const nextMilestone = "Master";

  const activeMissions = [
    {
      id: 1,
      title: 'Complete "HCP Culture" Module',
      deadline: "2 days",
      progress: 80,
      status: "in_progress" as const,
      points: 150
    },
    {
      id: 2,
      title: 'Take "Compliance" Quiz',
      deadline: "Pending",
      progress: 0,
      status: "pending" as const,
      points: 100
    },
    {
      id: 3,
      title: 'Watch "CEO Welcome" Video',
      deadline: "Completed",
      progress: 100,
      status: "completed" as const,
      points: 50
    }
  ];

  const recentAchievements = [
    { name: "Culture Champion", icon: "🏆", date: "Today" },
    { name: "First Week Complete", icon: "⭐", date: "Yesterday" },
    { name: "Quick Learner", icon: "🚀", date: "2 days ago" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Hello, {userName}! 👋
          </h2>
          <p className="text-lg text-muted-foreground">
            Ready to continue your onboarding journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card border-0 shadow-elegant animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                  <p className="text-2xl font-bold text-foreground">{overallProgress}%</p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Progress value={overallProgress} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-elegant animate-fade-in-up animate-delay-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Points Earned</p>
                  <p className="text-2xl font-bold text-foreground">{currentPoints.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Level: {currentLevel}</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-elegant animate-fade-in-up animate-delay-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next Action</p>
                  <p className="text-lg font-semibold text-foreground">Module X</p>
                </div>
                <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-success" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Continue
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-card border-0 shadow-elegant animate-fade-in-up animate-delay-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Weekly Ranking</p>
                  <p className="text-2xl font-bold text-foreground">3rd</p>
                </div>
                <div className="w-12 h-12 bg-warning-light rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-3 w-full">
                View Ranking
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Missions */}
          <div className="lg:col-span-2">
            <Card className="gradient-card border-0 shadow-elegant animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Active Missions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeMissions.map((mission) => (
                  <div 
                    key={mission.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-smooth"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                        {mission.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : mission.status === "in_progress" ? (
                          <Clock className="w-5 h-5 text-warning" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{mission.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Deadline: {mission.deadline} • {mission.points} points
                        </p>
                        {mission.status === "in_progress" && (
                          <Progress value={mission.progress} className="mt-2 h-2" />
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        mission.status === "completed" ? "default" :
                        mission.status === "in_progress" ? "secondary" : "outline"
                      }
                    >
                      {mission.status === "completed" ? "Done" :
                       mission.status === "in_progress" ? "In Progress" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="gradient-card border-0 shadow-elegant animate-slide-in-right">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mentorship */}
            <Card className="gradient-card border-0 shadow-elegant animate-slide-in-right animate-delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">MS</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Maria Santos</p>
                    <p className="text-sm text-muted-foreground">Senior Manager</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Conversation
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="gradient-card border-0 shadow-elegant animate-slide-in-right animate-delay-200">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/modules">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Modules
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/quizzes">
                    <Trophy className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link to="/progress">
                    <Target className="w-4 h-4 mr-2" />
                    View Progress
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;