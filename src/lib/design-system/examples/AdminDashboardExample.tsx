import React from 'react';
import {
  getTypedAdminToken,
  createDashboardStyles,
  logDesignSystemUsage,
  validateAdminDashboardTokens,
  generateAdminDashboardCSSProperties
} from '@/lib/design-system/admin-dashboard-utils';
import { Users, TrendingUp, Activity } from 'lucide-react';

/**
 * Example component demonstrating the use of admin dashboard design system utilities
 * This shows best practices for implementing design tokens in React components
 */
export const AdminDashboardExample: React.FC = () => {
  // Validate design system in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const validation = validateAdminDashboardTokens();
      if (!validation.isValid) {
        console.error('Design system validation failed:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('Design system warnings:', validation.warnings);
      }
    }
  }, []);

  // Generate CSS custom properties for dynamic theming
  React.useEffect(() => {
    const cssProps = generateAdminDashboardCSSProperties();
    Object.entries(cssProps).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }, []);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: getTypedAdminToken('dashboard', 'background'),
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: getTypedAdminToken('dashboard', 'textColor'),
        marginBottom: '32px'
      }}>
        Admin Dashboard Design System Example
      </h1>

      {/* Stats Cards Example */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatsCardExample />
        <ActivityCardExample />
        <ChartCardExample />
      </div>

      {/* CSS Custom Properties Example */}
      <CSSPropertiesExample />
    </div>
  );
};

/**
 * Example stats card using design system utilities
 */
const StatsCardExample: React.FC = () => {
  // Log design system usage for debugging
  logDesignSystemUsage('StatsCardExample', [
    'stats.cardBackground',
    'stats.cardPadding',
    'stats.cardShadow',
    'stats.valueColor',
    'stats.labelColor',
    'stats.iconBackground',
    'stats.iconColor',
    'stats.trendUpColor'
  ]);

  const styles = {
    card: {
      backgroundColor: getTypedAdminToken('stats', 'cardBackground'),
      padding: getTypedAdminToken('stats', 'cardPadding'),
      borderRadius: '8px',
      border: `1px solid ${getTypedAdminToken('stats', 'cardBorder')}`,
      boxShadow: getTypedAdminToken('stats', 'cardShadow')
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: getTypedAdminToken('stats', 'labelColor'),
      margin: 0
    },
    value: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: getTypedAdminToken('stats', 'valueColor'),
      margin: '8px 0'
    },
    trend: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: getTypedAdminToken('stats', 'trendUpColor'),
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    icon: {
      backgroundColor: getTypedAdminToken('stats', 'iconBackground'),
      color: getTypedAdminToken('stats', 'iconColor'),
      padding: '12px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <p style={styles.label}>Total Users</p>
          <p style={styles.value}>2,847</p>
          <div style={styles.trend}>
            <TrendingUp size={16} />
            <span>+12.5%</span>
            <span style={{ color: getTypedAdminToken('stats', 'labelColor') }}>vs last month</span>
          </div>
        </div>
        <div style={styles.icon}>
          <Users size={24} />
        </div>
      </div>
    </div>
  );
};

/**
 * Example activity card using design system utilities
 */
const ActivityCardExample: React.FC = () => {
  const dashboardStyles = createDashboardStyles('dashboard');
  
  logDesignSystemUsage('ActivityCardExample', [
    'dashboard.cardBackground',
    'dashboard.cardBorder',
    'dashboard.textColor',
    'activities.itemBackground',
    'activities.userColor',
    'activities.actionColor'
  ]);

  const activities = [
    { user: 'John Doe', action: 'Completed assessment', time: '2 min ago', type: 'success' as const },
    { user: 'Jane Smith', action: 'Started new course', time: '5 min ago', type: 'info' as const },
    { user: 'Bob Johnson', action: 'Updated profile', time: '10 min ago', type: 'info' as const }
  ];

  const styles = {
    card: {
      backgroundColor: getTypedAdminToken('dashboard', 'cardBackground'),
      borderRadius: '8px',
      border: `1px solid ${getTypedAdminToken('dashboard', 'cardBorder')}`,
      overflow: 'hidden' as const
    },
    header: {
      padding: '20px',
      borderBottom: `1px solid ${dashboardStyles.cardBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: dashboardStyles.textColor,
      margin: 0
    },
    content: {
      padding: '20px'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: getTypedAdminToken('activities', 'itemBackground'),
      borderRadius: '6px',
      marginBottom: '8px'
    },
    activityIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#10B981',
      flexShrink: 0
    },
    activityContent: {
      flex: 1
    },
    activityUser: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: getTypedAdminToken('activities', 'userColor'),
      margin: '0 0 2px 0'
    },
    activityAction: {
      fontSize: '0.875rem',
      color: getTypedAdminToken('activities', 'actionColor'),
      margin: 0
    },
    activityTime: {
      fontSize: '0.75rem',
      color: getTypedAdminToken('activities', 'timestampColor')
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Recent Activity</h3>
        <Activity size={20} style={{ color: getTypedAdminToken('activities', 'timestampColor') }} />
      </div>
      <div style={styles.content}>
        {activities.map((activity, index) => (
          <div key={index} style={styles.activityItem}>
            <div style={styles.activityIndicator} />
            <div style={styles.activityContent}>
              <p style={styles.activityUser}>{activity.user}</p>
              <p style={styles.activityAction}>{activity.action}</p>
            </div>
            <span style={styles.activityTime}>{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Example chart card using design system utilities
 */
const ChartCardExample: React.FC = () => {
  const chartStyles = createDashboardStyles('charts');
  
  logDesignSystemUsage('ChartCardExample', [
    'charts.backgroundColor',
    'charts.gridColor',
    'charts.axisColor'
  ]);

  const styles = {
    card: {
      backgroundColor: chartStyles.backgroundColor,
      borderRadius: '8px',
      border: `1px solid ${chartStyles.gridColor}`,
      padding: '24px'
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: chartStyles.axisColor,
      margin: '0 0 20px 0'
    },
    chartArea: {
      height: '200px',
      backgroundColor: chartStyles.backgroundColor,
      border: `1px solid ${chartStyles.gridColor}`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: chartStyles.axisColor
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Performance Chart</h3>
      <div style={styles.chartArea}>
        <div style={{ textAlign: 'center' }}>
          <TrendingUp size={48} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ margin: 0, opacity: 0.7 }}>Chart placeholder</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Example showing CSS custom properties usage
 */
const CSSPropertiesExample: React.FC = () => {
  const styles = {
    container: {
      backgroundColor: 'var(--admin-dashboard-bg)',
      padding: 'var(--admin-stats-card-padding)',
      borderRadius: '8px',
      border: '1px solid var(--admin-dashboard-card-border)',
      marginTop: '32px'
    },
    title: {
      color: 'var(--admin-dashboard-text)',
      fontSize: '1.125rem',
      fontWeight: '600',
      margin: '0 0 16px 0'
    },
    description: {
      color: 'var(--admin-stats-label)',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      margin: 0
    },
    codeBlock: {
      backgroundColor: 'var(--admin-chart-bg)',
      border: '1px solid var(--admin-chart-grid)',
      borderRadius: '4px',
      padding: '12px',
      marginTop: '12px',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      color: 'var(--admin-chart-axis)',
      overflow: 'auto'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>CSS Custom Properties Example</h3>
      <p style={styles.description}>
        This section demonstrates how to use CSS custom properties generated by the design system.
        These properties are automatically generated and can be used in CSS files or inline styles.
      </p>
      <div style={styles.codeBlock}>
        {`/* Example CSS usage */
.my-component {
  background-color: var(--admin-dashboard-bg);
  color: var(--admin-dashboard-text);
  padding: var(--admin-stats-card-padding);
  border: 1px solid var(--admin-dashboard-card-border);
  box-shadow: var(--admin-stats-card-shadow);
}`}
      </div>
    </div>
  );
};

export default AdminDashboardExample;