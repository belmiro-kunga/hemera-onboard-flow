
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";

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

import StudentCourses from "./pages/StudentCourses";
import Certificates from "./pages/Certificates";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import CompanyPresentationAdminPage from "./pages/admin/CompanyPresentationAdmin";
import VideoLibrary from "./pages/admin/VideoLibrary";
import GamificationAdmin from "./pages/admin/GamificationAdmin";
import Gamification from "./pages/Gamification";
import CourseAssignmentAdmin from "./pages/admin/CourseAssignmentAdmin";
import CMSAdmin from "./pages/admin/CMSAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/admin/login" element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            } />
            
            {/* Protected User Routes */}
            <Route path="/welcome" element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/modules" element={
              <ProtectedRoute>
                <Modules />
              </ProtectedRoute>
            } />
            <Route path="/modules/:moduleId" element={
              <ProtectedRoute>
                <ModulePlayer />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <StudentCourses />
              </ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute>
                <Certificates />
              </ProtectedRoute>
            } />
            <Route path="/gamification" element={
              <ProtectedRoute>
                <Gamification />
              </ProtectedRoute>
            } />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="simulados" element={<SimuladosAdmin />} />
              <Route path="videos" element={<VideoCoursesAdmin />} />
              <Route path="video-library" element={<VideoLibrary />} />
              <Route path="certificates" element={<CertificatesAdmin />} />
              <Route path="presentation" element={<CompanyPresentationAdminPage />} />
              <Route path="gamification" element={<GamificationAdmin />} />
              <Route path="assignments" element={<CourseAssignmentAdmin />} />
              <Route path="cms" element={<CMSAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
