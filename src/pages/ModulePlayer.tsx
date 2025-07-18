import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  Settings, 
  Maximize, 
  MessageCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const ModulePlayer = () => {
  const { moduleId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(15.5 * 60); // 15:30 in seconds
  const totalTime = 20.75 * 60; // 20:45 in seconds
  const progress = (currentTime / totalTime) * 100;

  const currentModule = {
    id: moduleId,
    title: "Culture and Values HCP",
    currentLesson: 3,
    totalLessons: 8,
    lessonTitle: "Our Core Values in Practice"
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const lessons = [
    { id: 1, title: "Introduction to HCP", duration: "5:30", completed: true },
    { id: 2, title: "Our History and Mission", duration: "7:15", completed: true },
    { id: 3, title: "Core Values in Practice", duration: "8:45", completed: false, current: true },
    { id: 4, title: "Leadership Principles", duration: "6:20", completed: false },
    { id: 5, title: "Team Collaboration", duration: "9:10", completed: false },
  ];

  const notes = [
    { id: 1, time: "05:20", content: "Important: Focus on client-first approach in all decisions" },
    { id: 2, time: "12:15", content: "Remember to document all compliance procedures" },
    { id: 3, time: "18:30", content: "Key insight: Innovation drives our competitive advantage" }
  ];

  const chatMessages = [
    { id: 1, user: "Maria Santos", time: "2 min ago", message: "Great explanation of the core values! Anyone has questions about the implementation in daily work?" },
    { id: 2, user: "Carlos Lima", time: "1 min ago", message: "How do we balance innovation with risk management?" },
    { id: 3, user: "Ana Rodriguez", time: "30 sec ago", message: "The examples shown really help understand the practical application" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-card border-b border-border shadow-corporate">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/modules">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{currentModule.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Lesson {currentModule.currentLesson} of {currentModule.totalLessons}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Progress value={(currentModule.currentLesson / currentModule.totalLessons) * 100} className="w-32" />
              <span className="text-sm font-medium text-foreground">
                {Math.round((currentModule.currentLesson / currentModule.totalLessons) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card className="gradient-card border-0 shadow-elegant">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                  {/* Video Area */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        {currentModule.lessonTitle}
                      </h3>
                      <p className="text-gray-300">CEO Message: Welcome to HCP Culture</p>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{formatTime(currentTime)}</span>
                        <div className="flex-1 bg-white/20 rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">{formatTime(totalTime)}</span>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="text-white hover:bg-white/20"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Volume2 className="w-5 h-5" />
                          </Button>
                          <span className="text-white text-sm">1.0x</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Settings className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Maximize className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Notes */}
              <Card className="gradient-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Your Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-primary">{note.time}</span>
                      </div>
                      <p className="text-sm text-foreground">{note.content}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Discussion */}
              <Card className="gradient-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{message.user}</span>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-sm text-foreground">{message.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" disabled>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button variant="success">
                Mark as Complete
              </Button>
              
              <Button variant="default">
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module Progress */}
            <Card className="gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Module Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className={`p-3 rounded-lg border transition-smooth cursor-pointer ${
                      lesson.current 
                        ? 'bg-primary-light border-primary' 
                        : lesson.completed 
                        ? 'bg-success-light border-success' 
                        : 'bg-secondary/30 border-border hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          lesson.current ? 'text-primary' : lesson.completed ? 'text-success' : 'text-foreground'
                        }`}>
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                      </div>
                      <div>
                        {lesson.completed ? (
                          <Badge variant="default" className="bg-success text-success-foreground">
                            Done
                          </Badge>
                        ) : lesson.current ? (
                          <Badge variant="default" className="bg-primary text-primary-foreground">
                            Current
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Download Materials
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask Mentor
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Module Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePlayer;