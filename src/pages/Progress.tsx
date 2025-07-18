import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Star, 
  Calendar,
  BookOpen,
  Trophy,
  Users,
  Download,
  Filter
} from "lucide-react";

const ProgressPage = () => {
  const overallStats = {
    progress: 75,
    timeInvested: "12h 30min",
    modulesCompleted: 8,
    totalModules: 12,
    quizzesCompleted: 15,
    totalQuizzes: 20,
    totalPoints: 1250
  };

  const timeline = [
    {
      date: "Dec 1, 2024",
      activity: "Welcome Orientation",
      duration: "30min",
      points: 100,
      status: "completed" as const
    },
    {
      date: "Dec 3, 2024",
      activity: "HCP Culture Module",
      duration: "45min",
      points: 150,
      status: "completed" as const
    },
    {
      date: "Dec 5, 2024",
      activity: "Culture Quiz",
      duration: "15min",
      points: 50,
      status: "completed" as const
    },
    {
      date: "Dec 8, 2024",
      activity: "Compliance Training",
      duration: "0/35min",
      points: 0,
      status: "in_progress" as const
    },
    {
      date: "Pending",
      activity: "Business Ethics",
      duration: "Expected 40min",
      points: 120,
      status: "pending" as const
    }
  ];

  const insights = [
    {
      title: "Ahead of Schedule",
      description: "You're 25% ahead of the average completion time",
      type: "positive" as const,
      icon: TrendingUp
    },
    {
      title: "Strong Performance",
      description: "Best performance in: Culture and Values modules",
      type: "positive" as const,
      icon: Star
    },
    {
      title: "Improvement Area",
      description: "Consider reviewing: Compliance procedures",
      type: "neutral" as const,
      icon: Target
    }
  ];

  const weeklyProgress = [
    { week: "Week 1", completed: 3, target: 3 },
    { week: "Week 2", completed: 5, target: 4 },
    { week: "Week 3", completed: 2, target: 3 },
    { week: "Week 4", completed: 1, target: 2 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-card border-b border-border shadow-corporate">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Your Progress</h1>
              <p className="text-muted-foreground">Track your onboarding journey and achievements</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overall Statistics */}
        <div className="mb-8">
          <Card className="gradient-card border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Overall Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted/20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - overallStats.progress / 100)}`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{overallStats.progress}%</span>
                    </div>
                  </div>
                  <p className="font-medium text-foreground">Progress</p>
                  <p className="text-sm text-muted-foreground">Overall completion</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.timeInvested}</p>
                  <p className="font-medium text-foreground">Time Invested</p>
                  <p className="text-sm text-muted-foreground">Total learning time</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {overallStats.modulesCompleted}/{overallStats.totalModules}
                  </p>
                  <p className="font-medium text-foreground">Modules</p>
                  <p className="text-sm text-muted-foreground">Completed modules</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-warning" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalPoints.toLocaleString()}</p>
                  <p className="font-medium text-foreground">Points Earned</p>
                  <p className="text-sm text-muted-foreground">Total achievement points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card className="gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Learning Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${
                          item.status === "completed" ? "bg-success" :
                          item.status === "in_progress" ? "bg-warning" : "bg-muted"
                        }`}></div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-border mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-foreground">{item.activity}</h4>
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                          </div>
                          <Badge 
                            variant={
                              item.status === "completed" ? "default" :
                              item.status === "in_progress" ? "secondary" : "outline"
                            }
                            className={
                              item.status === "completed" ? "bg-success text-success-foreground" :
                              item.status === "in_progress" ? "bg-warning text-warning-foreground" : ""
                            }
                          >
                            {item.status === "completed" ? "Completed" :
                             item.status === "in_progress" ? "In Progress" : "Pending"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{item.points} points</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Insights */}
            <Card className="gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        insight.type === "positive" ? "bg-success-light" : "bg-primary-light"
                      }`}>
                        <insight.icon className={`w-5 h-5 ${
                          insight.type === "positive" ? "text-success" : "text-primary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Performance */}
            <Card className="gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyProgress.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{week.week}</span>
                      <span className="text-muted-foreground">
                        {week.completed}/{week.target} completed
                      </span>
                    </div>
                    <Progress 
                      value={(week.completed / week.target) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comparison */}
            <Card className="gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Team Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary-light rounded-lg">
                    <p className="text-2xl font-bold text-primary mb-1">25%</p>
                    <p className="text-sm text-primary">Ahead of average</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your progress</span>
                      <span className="font-medium text-foreground">75%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Team average</span>
                      <span className="font-medium text-foreground">60%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Top performer</span>
                      <span className="font-medium text-foreground">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;