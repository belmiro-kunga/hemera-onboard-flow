# Admin Dashboard Design System Documentation

This document provides comprehensive guidance on using the design system utilities specifically for the admin dashboard.

## Overview

The admin dashboard design system utilities provide:
- TypeScript-safe token access
- CSS-in-JS utilities for React components
- Development mode validation
- Responsive design helpers
- Component-specific styling tokens

## Installation and Setup

```typescript
import {
  adminDashboardUtils,
  getAdminDashboardTokens,
  createDashboardStyles,
  validateAdminDashboardTokens,
  getTypedAdminToken
} from '@/lib/design-system/admin-dashboard-utils';
```

## Core Utilities

### 1. Token Access

#### Basic Token Access
```typescript
// Get all admin dashboard tokens
const tokens = getAdminDashboardTokens();

// Access specific categories
const dashboardBg = tokens.dashboard.background;
const cardPadding = tokens.stats.cardPadding;
const chartColors = tokens.charts.backgroundColor;
```

#### Type-Safe Token Access
```typescript
// Type-safe token access with validation
const backgroundColor = getTypedAdminToken('dashboard', 'background');
const cardShadow = getTypedAdminToken('stats', 'cardShadow');
const iconColor = getTypedAdminToken('stats', 'iconColor');
```

### 2. CSS-in-JS Utilities

#### Component Styling
```typescript
// Create styles for dashboard components
const dashboardStyles = createDashboardStyles('dashboard');
const statsStyles = createDashboardStyles('stats');
const chartStyles = createDashboardStyles('charts');

// Use in React components
const StatsCard = () => (
  <div style={{
    backgroundColor: statsStyles.cardBackground,
    padding: statsStyles.cardPadding,
    boxShadow: statsStyles.cardShadow,
    border: `1px solid ${statsStyles.cardBorder}`
  }}>
    {/* Card content */}
  </div>
);
```

#### CSS Custom Properties
```typescript
// Generate CSS custom properties
const cssProps = generateAdminDashboardCSSProperties();

// Apply to document root
Object.entries(cssProps).forEach(([property, value]) => {
  document.documentElement.style.setProperty(property, value);
});
```

### 3. Responsive Design

```typescript
// Create responsive styles
const responsiveStyles = createResponsiveDashboardStyles();

// Use with media queries
const DashboardGrid = styled.div`
  display: grid;
  
  @media (max-width: 768px) {
    grid-template-columns: ${responsiveStyles.mobile.gridTemplateColumns};
    gap: ${responsiveStyles.mobile.gap};
    padding: ${responsiveStyles.mobile.padding};
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: ${responsiveStyles.tablet.gridTemplateColumns};
    gap: ${responsiveStyles.tablet.gap};
    padding: ${responsiveStyles.tablet.padding};
  }
  
  @media (min-width: 1025px) {
    grid-template-columns: ${responsiveStyles.desktop.gridTemplateColumns};
    gap: ${responsiveStyles.desktop.gap};
    padding: ${responsiveStyles.desktop.padding};
  }
`;
```

## Component Examples

### Stats Card Component

```typescript
import React from 'react';
import { getTypedAdminToken, logDesignSystemUsage } from '@/lib/design-system/admin-dashboard-utils';

interface StatsCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, icon }) => {
  // Log design system usage in development
  logDesignSystemUsage('StatsCard', [
    'stats.cardBackground',
    'stats.cardPadding',
    'stats.cardShadow',
    'stats.valueColor',
    'stats.labelColor'
  ]);
  
  const styles = {
    card: {
      backgroundColor: getTypedAdminToken('stats', 'cardBackground'),
      padding: getTypedAdminToken('stats', 'cardPadding'),
      boxShadow: getTypedAdminToken('stats', 'cardShadow'),
      border: `1px solid ${getTypedAdminToken('stats', 'cardBorder')}`,
      borderRadius: '8px',
    },
    value: {
      color: getTypedAdminToken('stats', 'valueColor'),
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: '8px 0',
    },
    label: {
      color: getTypedAdminToken('stats', 'labelColor'),
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    trend: {
      color: trend === 'up' 
        ? getTypedAdminToken('stats', 'trendUpColor')
        : getTypedAdminToken('stats', 'trendDownColor'),
    },
    iconContainer: {
      backgroundColor: getTypedAdminToken('stats', 'iconBackground'),
      color: getTypedAdminToken('stats', 'iconColor'),
      padding: '12px',
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };
  
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={styles.label}>{title}</p>
          <p style={styles.value}>{value}</p>
          <span style={styles.trend}>
            {trend === 'up' ? '↗' : '↘'} 12.5%
          </span>
        </div>
        <div style={styles.iconContainer}>
          {icon}
        </div>
      </div>
    </div>
  );
};
```

### Chart Container Component

```typescript
import React from 'react';
import { createDashboardStyles } from '@/lib/design-system/admin-dashboard-utils';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
  const chartStyles = createDashboardStyles('charts');
  
  return (
    <div style={{
      backgroundColor: chartStyles.backgroundColor,
      padding: '24px',
      borderRadius: '8px',
      border: `1px solid ${chartStyles.gridColor}`,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '1.125rem',
        fontWeight: '600',
        color: chartStyles.axisColor
      }}>
        {title}
      </h3>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};
```

### Activity List Component

```typescript
import React from 'react';
import { getAdminDashboardTokens } from '@/lib/design-system/admin-dashboard-utils';

interface ActivityItemProps {
  user: string;
  action: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info';
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ user, action, timestamp, type }) => {
  const tokens = getAdminDashboardTokens();
  
  const typeColors = {
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6'
  };
  
  return (
    <div style={{
      backgroundColor: tokens.activities.itemBackground,
      padding: tokens.activities.itemPadding,
      borderLeft: `3px solid ${typeColors[type]}`,
      marginBottom: '8px',
      borderRadius: '4px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            color: tokens.activities.userColor,
            fontWeight: '500',
            margin: '0 0 4px 0'
          }}>
            {user}
          </p>
          <p style={{
            color: tokens.activities.actionColor,
            fontSize: '0.875rem',
            margin: 0
          }}>
            {action}
          </p>
        </div>
        <span style={{
          color: tokens.activities.timestampColor,
          fontSize: '0.75rem'
        }}>
          {timestamp}
        </span>
      </div>
    </div>
  );
};
```

## Development Mode Features

### Validation

```typescript
// Validate design system usage
const validation = validateAdminDashboardTokens();

if (!validation.isValid) {
  console.error('Design system validation failed:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Design system warnings:', validation.warnings);
}
```

### Usage Logging

```typescript
// Log design system usage for debugging
logDesignSystemUsage('MyComponent', [
  'dashboard.background',
  'stats.cardPadding',
  'charts.backgroundColor'
]);
```

## CSS Custom Properties Reference

### Dashboard Layout
- `--admin-dashboard-bg`: Main dashboard background
- `--admin-dashboard-grid-gap`: Grid gap between components
- `--admin-dashboard-card-spacing`: Spacing between cards
- `--admin-dashboard-header-height`: Header height
- `--admin-dashboard-sidebar-width`: Sidebar width

### Stats Cards
- `--admin-stats-card-bg`: Card background color
- `--admin-stats-card-border`: Card border color
- `--admin-stats-card-shadow`: Card shadow
- `--admin-stats-card-padding`: Card padding
- `--admin-stats-icon-bg`: Icon background color
- `--admin-stats-icon-color`: Icon color
- `--admin-stats-value-color`: Value text color
- `--admin-stats-label-color`: Label text color
- `--admin-stats-trend-up`: Positive trend color
- `--admin-stats-trend-down`: Negative trend color

### Charts
- `--admin-chart-bg`: Chart background
- `--admin-chart-grid`: Chart grid color
- `--admin-chart-axis`: Chart axis color
- `--admin-chart-tooltip-bg`: Tooltip background
- `--admin-chart-tooltip-border`: Tooltip border
- `--admin-chart-tooltip-shadow`: Tooltip shadow

### Activities
- `--admin-activity-item-bg`: Activity item background
- `--admin-activity-item-border`: Activity item border
- `--admin-activity-item-padding`: Activity item padding
- `--admin-activity-timestamp`: Timestamp color
- `--admin-activity-user`: User name color
- `--admin-activity-action`: Action description color

## Best Practices

1. **Always use typed token access** for better development experience
2. **Enable validation in development** to catch design system issues early
3. **Use responsive utilities** for consistent breakpoint behavior
4. **Log design system usage** in development for debugging
5. **Prefer CSS custom properties** for dynamic theming support
6. **Validate color contrast** for accessibility compliance
7. **Use semantic token names** rather than hardcoded values

## Migration Guide

To migrate existing admin dashboard components to use the design system:

1. Replace hardcoded colors with design tokens
2. Use spacing tokens instead of pixel values
3. Apply component-specific styling tokens
4. Add development mode validation
5. Update CSS to use custom properties
6. Test responsive behavior with provided utilities

## Troubleshooting

### Common Issues

1. **Token not found**: Check if the token exists in the design system
2. **Type errors**: Ensure you're using the correct token category and property names
3. **Validation failures**: Review the validation errors and fix missing tokens
4. **Contrast issues**: Use the accessibility utilities to check color combinations

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and using the logging utilities provided.