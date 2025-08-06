import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Video,
  UserCheck,
  Trophy,
  BarChart3,
  Settings,
  Bell,
  Presentation,
  FileBarChart,
  Award,
  HelpCircle,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  path?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: 'principal',
    label: 'Principal',
    icon: LayoutDashboard,
    children: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { id: 'usuarios', label: 'Usuários', icon: Users, path: '/admin/usuarios' },
      { id: 'simulados', label: 'Simulados', icon: FileText, path: '/admin/simulados' },
      { id: 'videos', label: 'Vídeos', icon: Video, path: '/admin/videos' },
      { id: 'atribuicoes', label: 'Atribuições', icon: UserCheck, path: '/admin/atribuicoes' },
      { id: 'gamificacao', label: 'Gamificação', icon: Trophy, path: '/admin/gamificacao' },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' }
    ]
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: Settings,
    children: [
      { id: 'cms', label: 'CMS', icon: FileText, path: '/admin/cms' },
      { id: 'notificacoes', label: 'Notificações', icon: Bell, path: '/admin/notificacoes' },
      { id: 'apresentacao', label: 'Apresentação', icon: Presentation, path: '/admin/apresentacao' },
      { id: 'relatorios', label: 'Relatórios', icon: FileBarChart, path: '/admin/relatorios' },
      { id: 'certificados', label: 'Certificados', icon: Award, path: '/admin/certificados' },
      { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/admin/configuracoes' }
    ]
  },
  {
    id: 'suporte',
    label: 'Suporte',
    icon: HelpCircle,
    children: [
      { id: 'suporte-tickets', label: 'Suporte', icon: HelpCircle, path: '/admin/suporte' }
    ]
  }
]

interface AdminPanelProps {
  children?: React.ReactNode
  currentPath?: string
}

export function AdminPanel({ children, currentPath = '/admin/dashboard' }: AdminPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['principal'])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const isActive = (path: string) => currentPath === path

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">HCP</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Hemera Capital Partners</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((section) => {
          const isExpanded = expandedSections.includes(section.id)
          const SectionIcon = section.icon

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <SectionIcon className="w-5 h-5" />
                  <span>{section.label}</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded ? "rotate-180" : ""
                  )} 
                />
              </button>

              {/* Section Items */}
              {isExpanded && section.children && (
                <div className="ml-6 space-y-1">
                  {section.children.map((item) => {
                    const ItemIcon = item.icon
                    const active = item.path && isActive(item.path)

                    return (
                      <a
                        key={item.id}
                        href={item.path || '#'}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors",
                          active
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <ItemIcon className={cn(
                          "w-4 h-4",
                          active ? "text-blue-600" : "text-gray-400"
                        )} />
                        <span>{item.label}</span>
                        {active && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto" />
                        )}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">admin@hcp.com</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-gray-200 transition-all duration-300",
        isSidebarOpen ? "lg:w-80" : "lg:w-20"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems
                  .flatMap(section => section.children || [])
                  .find(item => item.path === currentPath)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel