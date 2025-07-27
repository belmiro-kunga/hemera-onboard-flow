
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  BarChart3,
  Settings,
  Bell,
  FileText,
  Award,
  HelpCircle,
  LogOut,
  Mail,
  Building2,
  Trophy,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const mainMenuItems = [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    { title: 'Usuários', url: '/admin/users', icon: Users },
    { title: 'Simulados', url: '/admin/simulados', icon: BookOpen },
    { title: 'Vídeos', url: '/admin/videos', icon: Video },
    { title: 'Atribuições', url: '/admin/assignments', icon: Target },
    { title: 'Gamificação', url: '/admin/gamification', icon: Trophy },
    { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  ];

  const systemMenuItems = [
    { title: 'CMS', url: '/admin/cms', icon: FileText },
    { title: 'Notificações', url: '/admin/notifications', icon: Bell },
    { title: 'Emails', url: '/admin/emails', icon: Mail },
    { title: 'Apresentação', url: '/admin/presentation', icon: Building2 },
    { title: 'Relatórios', url: '/admin/reports', icon: FileText },
    { title: 'Certificados', url: '/admin/certificates', icon: Award },
    { title: 'Configurações', url: '/admin/settings', icon: Settings },
  ];

  const supportMenuItems = [
    { title: 'Suporte', url: '/admin/support', icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavMenuItem = ({ item }: { item: any }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive(item.url)}>
        <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
          <item.icon className="h-5 w-5" />
          {!isCollapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">HCP</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Admin Panel</h2>
              <p className="text-xs text-sidebar-foreground/70">Hemera Capital Partners</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <NavMenuItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemMenuItems.map((item) => (
                <NavMenuItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Suporte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportMenuItems.map((item) => (
                <NavMenuItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground text-sm font-medium">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
              <p className="text-xs text-sidebar-foreground/70">admin@hcp.com</p>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
