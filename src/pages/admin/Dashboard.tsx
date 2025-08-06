import React from 'react'
import {
  Users,
  FileText,
  Video,
  Trophy,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Award,
  Gift
} from 'lucide-react'
import { useBirthdays } from '@/hooks/useBirthdays'
import { BirthdayCard } from '@/components/BirthdayCard'
import {
  getTypedAdminToken,
  createDashboardStyles,
  logDesignSystemUsage,
  validateAdminDashboardTokens
} from '@/lib/design-system/admin-dashboard-utils'

interface StatCardProps {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down'
  icon: React.ComponentType<any>
}

function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  // Log design system usage in development
  if (process.env.NODE_ENV === 'development') {
    logDesignSystemUsage('StatCard', [
      'stats.cardBackground',
      'stats.cardPadding',
      'stats.cardBorder',
      'stats.valueColor',
      'stats.labelColor',
      'stats.iconBackground',
      'stats.iconColor',
      'stats.trendUpColor',
      'stats.trendDownColor'
    ]);
  }

  const styles = {
    card: {
      backgroundColor: String(getTypedAdminToken('stats', 'cardBackground')),
      padding: String(getTypedAdminToken('stats', 'cardPadding')),
      border: `1px solid ${getTypedAdminToken('stats', 'cardBorder')}`,
      borderRadius: '8px',
      boxShadow: String(getTypedAdminToken('stats', 'cardShadow'))
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: String(getTypedAdminToken('stats', 'labelColor'))
    },
    value: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: String(getTypedAdminToken('stats', 'valueColor')),
      margin: '8px 0'
    },
    trend: {
      color: trend === 'up' 
        ? String(getTypedAdminToken('stats', 'trendUpColor'))
        : String(getTypedAdminToken('stats', 'trendDownColor')),
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    trendLabel: {
      fontSize: '0.875rem',
      color: String(getTypedAdminToken('stats', 'labelColor')),
      marginLeft: '4px'
    },
    iconContainer: {
      backgroundColor: String(getTypedAdminToken('stats', 'iconBackground')),
      color: String(getTypedAdminToken('stats', 'iconColor')),
      padding: '12px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={styles.label}>{title}</p>
          <p style={styles.value}>{value}</p>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
            {trend === 'up' ? (
              <TrendingUp style={{ width: '16px', height: '16px', color: styles.trend.color, marginRight: '4px' }} />
            ) : (
              <TrendingDown style={{ width: '16px', height: '16px', color: styles.trend.color, marginRight: '4px' }} />
            )}
            <span style={styles.trend}>
              {change}
            </span>
            <span style={styles.trendLabel}>vs mês anterior</span>
          </div>
        </div>
        <div style={styles.iconContainer}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
      </div>
    </div>
  )
}

interface ActivityItemProps {
  user: string
  action: string
  time: string
  type: 'success' | 'warning' | 'info'
}

function ActivityItem({ user, action, time, type }: ActivityItemProps) {
  // Log design system usage in development
  if (process.env.NODE_ENV === 'development') {
    logDesignSystemUsage('ActivityItem', [
      'activities.itemBackground',
      'activities.itemPadding',
      'activities.userColor',
      'activities.actionColor',
      'activities.timestampColor'
    ]);
  }

  const typeColors = {
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6'
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: String(getTypedAdminToken('activities', 'itemPadding')),
      backgroundColor: String(getTypedAdminToken('activities', 'itemBackground')),
      borderLeft: `3px solid ${typeColors[type]}`,
      marginBottom: '8px',
      borderRadius: '4px'
    },
    indicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: typeColors[type],
      flexShrink: 0
    },
    content: {
      flex: 1,
      minWidth: 0
    },
    user: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: String(getTypedAdminToken('activities', 'userColor')),
      margin: '0 0 4px 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    action: {
      fontSize: '0.875rem',
      color: String(getTypedAdminToken('activities', 'actionColor')),
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    timestamp: {
      fontSize: '0.875rem',
      color: String(getTypedAdminToken('activities', 'timestampColor')),
      flexShrink: 0
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.indicator} />
      <div style={styles.content}>
        <p style={styles.user}>{user}</p>
        <p style={styles.action}>{action}</p>
      </div>
      <div style={styles.timestamp}>{time}</div>
    </div>
  )
}

export function Dashboard() {
  // Validate design system in development
  if (process.env.NODE_ENV === 'development') {
    const validation = validateAdminDashboardTokens();
    if (!validation.isValid) {
      console.error('Design system validation failed:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('Design system warnings:', validation.warnings);
    }
  }

  // Get upcoming birthdays
  const { birthdays, loading: loadingBirthdays } = useBirthdays();

  // Create dashboard styles
  const dashboardStyles = createDashboardStyles('dashboard');
  const chartStyles = createDashboardStyles('charts');

  const stats = [
    {
      title: 'Total de Usuários',
      value: '2,847',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users
    },
    {
      title: 'Simulados Ativos',
      value: '156',
      change: '+8.2%',
      trend: 'up' as const,
      icon: FileText
    },
    {
      title: 'Vídeos Publicados',
      value: '89',
      change: '+15.3%',
      trend: 'up' as const,
      icon: Video
    },
    {
      title: 'Certificados Emitidos',
      value: '1,234',
      change: '-2.1%',
      trend: 'down' as const,
      icon: Award
    }
  ]

  const recentActivities = [
    {
      user: 'João Silva',
      action: 'Completou o simulado "Fundamentos de Investimento"',
      time: '2 min atrás',
      type: 'success' as const
    },
    {
      user: 'Maria Santos',
      action: 'Iniciou o curso "Análise Técnica Avançada"',
      time: '5 min atrás',
      type: 'info' as const
    },
    {
      user: 'Pedro Costa',
      action: 'Obteve certificação em "Gestão de Portfólio"',
      time: '10 min atrás',
      type: 'success' as const
    },
    {
      user: 'Ana Oliveira',
      action: 'Reportou problema no vídeo "Derivativos"',
      time: '15 min atrás',
      type: 'warning' as const
    },
    {
      user: 'Carlos Lima',
      action: 'Atualizou perfil e preferências',
      time: '20 min atrás',
      type: 'info' as const
    }
  ]

  const upcomingEvents = [
    {
      title: 'Webinar: Mercado de Ações 2024',
      date: '15 Mar',
      time: '14:00'
    },
    {
      title: 'Lançamento: Novo Curso de Criptomoedas',
      date: '18 Mar',
      time: '10:00'
    },
    {
      title: 'Manutenção do Sistema',
      date: '20 Mar',
      time: '02:00'
    }
  ]

  // Format birthdays for the BirthdayCard component
  const upcomingBirthdays = birthdays.map(birthday => ({
    id: birthday.user_id,
    name: birthday.name,
    birthday: birthday.birth_date,
    avatar: birthday.photo_url
  }))

  const containerStyles = {
    main: {
      backgroundColor: String(dashboardStyles.background),
      padding: String(dashboardStyles.padding),
      gap: '24px',
      display: 'flex',
      flexDirection: 'column' as const
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px',
      '@media (max-width: 1024px)': {
        gridTemplateColumns: '1fr'
      }
    },
    card: {
      backgroundColor: String(getTypedAdminToken('stats', 'cardBackground')),
      borderRadius: '8px',
      border: `1px solid ${getTypedAdminToken('stats', 'cardBorder')}`,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    cardHeader: {
      padding: '24px',
      borderBottom: `1px solid ${getTypedAdminToken('stats', 'cardBorder')}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: String(getTypedAdminToken('stats', 'valueColor')),
      margin: 0
    },
    cardContent: {
      padding: '24px'
    },
    button: {
      width: '100%',
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#3B82F6',
      padding: '8px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    chartContainer: {
      height: '256px',
      backgroundColor: String(chartStyles.backgroundColor),
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    chartPlaceholder: {
      textAlign: 'center' as const,
      color: String(chartStyles.axisColor)
    },
    eventItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '16px'
    },
    eventDate: {
      width: '48px',
      height: '48px',
      backgroundColor: String(getTypedAdminToken('stats', 'iconBackground')),
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    eventDateDay: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: String(getTypedAdminToken('stats', 'iconColor'))
    },
    eventDateMonth: {
      fontSize: '0.75rem',
      color: String(getTypedAdminToken('stats', 'iconColor')),
      opacity: 0.8
    },
    eventContent: {
      flex: 1,
      minWidth: 0
    },
    eventTitle: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: String(getTypedAdminToken('activities', 'userColor')),
      margin: '0 0 4px 0'
    },
    eventTime: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    eventTimeText: {
      fontSize: '0.75rem',
      color: String(getTypedAdminToken('activities', 'timestampColor'))
    }
  };

  return (
    <div style={containerStyles.main}>
        {/* Stats Grid */}
        <div style={containerStyles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div style={containerStyles.contentGrid}>
          {/* Recent Activity */}
          <div>
            <div style={containerStyles.card}>
              <div style={containerStyles.cardHeader}>
                <h3 style={containerStyles.cardTitle}>Atividade Recente</h3>
                <Activity style={{ width: '20px', height: '20px', color: String(getTypedAdminToken('activities', 'timestampColor')) }} />
              </div>
              <div style={containerStyles.cardContent}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {recentActivities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
                <div style={{ marginTop: '24px' }}>
                  <button style={containerStyles.button}>
                    Ver todas as atividades
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <div style={containerStyles.card}>
              <div style={containerStyles.cardHeader}>
                <h3 style={containerStyles.cardTitle}>Próximos Eventos</h3>
                <Calendar style={{ width: '20px', height: '20px', color: String(getTypedAdminToken('activities', 'timestampColor')) }} />
              </div>
              <div style={containerStyles.cardContent}>
                <div>
                  {upcomingEvents.map((event, index) => (
                    <div key={index} style={containerStyles.eventItem}>
                      <div style={containerStyles.eventDate}>
                        <span style={containerStyles.eventDateDay}>{event.date.split(' ')[0]}</span>
                        <span style={containerStyles.eventDateMonth}>{event.date.split(' ')[1]}</span>
                      </div>
                      <div style={containerStyles.eventContent}>
                        <p style={containerStyles.eventTitle}>{event.title}</p>
                        <div style={containerStyles.eventTime}>
                          <Clock style={{ width: '12px', height: '12px', color: String(getTypedAdminToken('activities', 'timestampColor')) }} />
                          <span style={containerStyles.eventTimeText}>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '24px' }}>
                  <button style={containerStyles.button}>
                    Ver calendário completo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div style={{
          backgroundColor: String(dashboardStyles.cardBackground),
          borderRadius: '8px',
          border: `1px solid ${getTypedAdminToken('stats', 'cardBorder')}`,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${getTypedAdminToken('stats', 'cardBorder')}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: String(getTypedAdminToken('stats', 'valueColor')),
              margin: 0
            }}>Próximos Aniversários</h3>
            <Gift style={{
              width: '20px',
              height: '20px',
              color: String(getTypedAdminToken('activities', 'timestampColor'))
            }} />
          </div>
          <div style={{ padding: '16px' }}>
            <BirthdayCard upcomingBirthdays={upcomingBirthdays} />
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div style={containerStyles.card}>
          <div style={containerStyles.cardHeader}>
            <h3 style={containerStyles.cardTitle}>Performance da Plataforma</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{ padding: '4px 12px', fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                7 dias
              </button>
              <button style={{ padding: '4px 12px', fontSize: '0.875rem', fontWeight: '500', color: 'white', backgroundColor: '#3B82F6', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                30 dias
              </button>
              <button style={{ padding: '4px 12px', fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                90 dias
              </button>
            </div>
          </div>
          <div style={containerStyles.cardContent}>
            <div style={containerStyles.chartContainer}>
              <div style={containerStyles.chartPlaceholder}>
                <TrendingUp style={{ width: '48px', height: '48px', color: String(chartStyles.axisColor), margin: '0 auto 8px' }} />
                <p style={{ color: String(chartStyles.axisColor), margin: '0 0 4px 0' }}>Gráfico de performance será exibido aqui</p>
                <p style={{ fontSize: '0.875rem', color: String(chartStyles.axisColor), opacity: 0.7, margin: 0 }}>Integração com biblioteca de gráficos em desenvolvimento</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Dashboard