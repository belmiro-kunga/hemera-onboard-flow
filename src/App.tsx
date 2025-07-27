
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModulePlayer from "./pages/ModulePlayer";
import ProgressPage from "./pages/Progress";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import VideoCoursesAdmin from "./pages/admin/VideoCoursesAdmin";
import SimuladosAdmin from "./pages/admin/SimuladosAdmin";
import CertificatesAdmin from "./pages/admin/CertificatesAdmin";
import EmailsAdmin from "./pages/admin/EmailsAdmin";
import StudentCourses from "./pages/StudentCourses";
import Certificates from "./pages/Certificates";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import CompanyPresentationAdminPage from "./pages/admin/CompanyPresentationAdmin";
import VideoLibrary from "./pages/admin/VideoLibrary";
import GamificationAdmin from "./pages/admin/GamificationAdmin";
import Gamification from "./pages/Gamification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/modules/:moduleId" element={<ModulePlayer />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/courses" element={<StudentCourses />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/gamification" element={<Gamification />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="simulados" element={<SimuladosAdmin />} />
            <Route path="videos" element={<VideoCoursesAdmin />} />
            <Route path="video-library" element={<VideoLibrary />} />
            <Route path="certificates" element={<CertificatesAdmin />} />
            <Route path="emails" element={<EmailsAdmin />} />
            <Route path="presentation" element={<CompanyPresentationAdminPage />} />
            <Route path="gamification" element={<GamificationAdmin />} />
            {/* Future admin routes can be added here */}
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
