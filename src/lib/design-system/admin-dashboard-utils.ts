/**
 * Admin Dashboard Design System Utilities
 * 
 * This file contains specialized utilities for the admin dashboard,
 * including TypeScript support, CSS-in-JS utilities, validation,
 * and development mode helpers.
 */

import { designSystem } from './tokens';
import type { DesignSystem, ComponentState } from './types';
import { getToken, getColor, getSpacing, getComponentStyle } from './utils';

// Development mode validation flag
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Admin Dashboard specific design token utilities
 */
export interface AdminDashboardTokens {
  dashboard: {
    background: string;
    gridGap: string;
    cardSpacing: string;
    headerHeight: string;
    sidebarWidth: string;
  };
  stats: {
    cardBackground: string;
    cardBorder: string;
    cardShadow: string;
    cardPadding: string;
    iconBackground: string;
    iconColor: string;
    valueColor: string;
    labelColor: string;
    trendUpColor: string;
    trendDownColor: string;
  };
  charts: {
    backgroundColor: string;
    gridColor: string;
    axisColor: string;
    tooltipBackground: string;
    tooltipBorder: string;
    tooltipShadow: string;
  };
  activities: {
    itemBackground: string;
    itemBorder: string;
    itemPadding: string;
    timestampColor: string;
    userColor: string;
    actionColor: string;
  };
}

/**
 * Get admin dashboard specific tokens
 */
export function getAdminDashboardTokens(): AdminDashboardTokens {
  return {
    dashboard: {
      background: getColor('background'),
      gridGap: getSpacing('lg'),
      cardSpacing: getSpacing('md'),
      headerHeight: designSystem.layout.headerHeight,
      sidebarWidth: designSystem.layout.sidebarWidth,
    },
    stats: {
      cardBackground: getColor('surface'),
      cardBorder: getColor('border'),
      cardShadow: designSystem.elevation.low,
      cardPadding: getSpacing('lg'),
      iconBackground: getColor('primary') + '0D', // 5% opacity
      iconColor: getColor('primary'),
      valueColor: getColor('textPrimary'),
      labelColor: getColor('textSecondary'),
      trendUpColor: getColor('success'),
      trendDownColor: getColor('danger'),
    },
    charts: {
      backgroundColor: getColor('surface'),
      gridColor: getColor('border'),
      axisColor: getColor('textSecondary'),
      tooltipBackground: getColor('textPrimary'),
      tooltipBorder: getColor('border'),
      tooltipShadow: designSystem.elevation.medium,
    },
    activities: {
      itemBackground: getColor('surface'),
      itemBorder: getColor('border'),
      itemPadding: getSpacing('sm'),
      timestampColor: getColor('textSecondary'),
      userColor: getColor('textPrimary'),
      actionColor: getColor('textSecondary'),
    },
  };
}

/**
 * CSS-in-JS utilities for admin dashboard components
 */
export interface DashboardStyleObject {
  [key: string]: string;
}

/**
 * Create CSS-in-JS style object for dashboard components
 */
export function createDashboardStyles(component: keyof AdminDashboardTokens): DashboardStyleObject {
  const tokens = getAdminDashboardTokens();
  const componentTokens = tokens[component];
  
  if (isDevelopment && !componentTokens) {
    console.warn(`[Design System] Component '${component}' not found in admin dashboard tokens`);
    return {};
  }
  
  // Convert all values to strings to match DashboardStyleObject interface
  const styleObject: DashboardStyleObject = {};
  Object.entries(componentTokens).forEach(([key, value]) => {
    styleObject[key] = String(value);
  });
  
  return styleObject;
}

/**
 * Generate CSS custom properties for admin dashboard
 */
export function generateAdminDashboardCSSProperties(): Record<string, string> {
  const tokens = getAdminDashboardTokens();
  const cssProps: Record<string, string> = {};
  
  // Dashboard tokens
  cssProps['--admin-dashboard-bg'] = tokens.dashboard.background;
  cssProps['--admin-dashboard-grid-gap'] = tokens.dashboard.gridGap;
  cssProps['--admin-dashboard-card-spacing'] = tokens.dashboard.cardSpacing;
  cssProps['--admin-dashboard-header-height'] = tokens.dashboard.headerHeight;
  cssProps['--admin-dashboard-sidebar-width'] = tokens.dashboard.sidebarWidth;
  
  // Stats card tokens
  cssProps['--admin-stats-card-bg'] = tokens.stats.cardBackground;
  cssProps['--admin-stats-card-border'] = tokens.stats.cardBorder;
  cssProps['--admin-stats-card-shadow'] = tokens.stats.cardShadow;
  cssProps['--admin-stats-card-padding'] = tokens.stats.cardPadding;
  cssProps['--admin-stats-icon-bg'] = tokens.stats.iconBackground;
  cssProps['--admin-stats-icon-color'] = tokens.stats.iconColor;
  cssProps['--admin-stats-value-color'] = tokens.stats.valueColor;
  cssProps['--admin-stats-label-color'] = tokens.stats.labelColor;
  cssProps['--admin-stats-trend-up'] = tokens.stats.trendUpColor;
  cssProps['--admin-stats-trend-down'] = tokens.stats.trendDownColor;
  
  // Chart tokens
  cssProps['--admin-chart-bg'] = tokens.charts.backgroundColor;
  cssProps['--admin-chart-grid'] = tokens.charts.gridColor;
  cssProps['--admin-chart-axis'] = tokens.charts.axisColor;
  cssProps['--admin-chart-tooltip-bg'] = tokens.charts.tooltipBackground;
  cssProps['--admin-chart-tooltip-border'] = tokens.charts.tooltipBorder;
  cssProps['--admin-chart-tooltip-shadow'] = tokens.charts.tooltipShadow;
  
  // Activity tokens
  cssProps['--admin-activity-item-bg'] = tokens.activities.itemBackground;
  cssProps['--admin-activity-item-border'] = tokens.activities.itemBorder;
  cssProps['--admin-activity-item-padding'] = tokens.activities.itemPadding;
  cssProps['--admin-activity-timestamp'] = tokens.activities.timestampColor;
  cssProps['--admin-activity-user'] = tokens.activities.userColor;
  cssProps['--admin-activity-action'] = tokens.activities.actionColor;
  
  return cssProps;
}

/**
 * Development mode validation utilities
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate admin dashboard design system usage
 */
export function validateAdminDashboardTokens(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  if (!isDevelopment) {
    return result;
  }
  
  try {
    const tokens = getAdminDashboardTokens();
    
    // Validate required tokens exist
    const requiredTokens = [
      'dashboard.background',
      'stats.cardBackground',
      'charts.backgroundColor',
      'activities.itemBackground'
    ];
    
    requiredTokens.forEach(tokenPath => {
      const [category, property] = tokenPath.split('.');
      const categoryTokens = tokens[category as keyof AdminDashboardTokens];
      
      if (!categoryTokens || !categoryTokens[property as keyof typeof categoryTokens]) {
        result.errors.push(`Missing required token: ${tokenPath}`);
        result.isValid = false;
      }
    });
    
    // Validate color contrast for accessibility
    const backgroundColors = [
      tokens.dashboard.background,
      tokens.stats.cardBackground,
      tokens.charts.backgroundColor
    ];
    
    const textColors = [
      tokens.stats.valueColor,
      tokens.stats.labelColor,
      tokens.activities.userColor
    ];
    
    backgroundColors.forEach((bg, bgIndex) => {
      textColors.forEach((text, textIndex) => {
        // Simple contrast check (would need proper contrast ratio calculation in real implementation)
        if (bg === text) {
          result.warnings.push(`Potential contrast issue between background ${bgIndex} and text ${textIndex}`);
        }
      });
    });
    
  } catch (error) {
    result.errors.push(`Validation error: ${error}`);
    result.isValid = false;
  }
  
  return result;
}

/**
 * Development mode logger for design system usage
 */
export function logDesignSystemUsage(component: string, tokens: string[]): void {
  if (!isDevelopment) return;
  
  console.group(`[Design System] ${component}`);
  console.log('Tokens used:', tokens);
  
  const validation = validateAdminDashboardTokens();
  if (!validation.isValid) {
    console.error('Validation errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('Validation warnings:', validation.warnings);
  }
  
  console.groupEnd();
}

/**
 * TypeScript utility for type-safe token access
 */
export function getTypedAdminToken<T extends keyof AdminDashboardTokens>(
  category: T,
  property: keyof AdminDashboardTokens[T]
): string {
  const tokens = getAdminDashboardTokens();
  const value = tokens[category][property as keyof AdminDashboardTokens[T]];
  
  if (isDevelopment && !value) {
    console.warn(`[Design System] Token '${category}.${String(property)}' not found`);
  }
  
  return value as string || '';
}

/**
 * Create responsive dashboard styles
 */
export function createResponsiveDashboardStyles(): Record<string, DashboardStyleObject> {
  const tokens = getAdminDashboardTokens();
  
  return {
    mobile: {
      gridTemplateColumns: '1fr',
      gap: getSpacing('sm'),
      padding: getSpacing('sm'),
    },
    tablet: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: getSpacing('md'),
      padding: getSpacing('md'),
    },
    desktop: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: tokens.dashboard.gridGap,
      padding: tokens.dashboard.cardSpacing,
    },
  };
}

/**
 * Export all utilities for easy consumption
 */
export const adminDashboardUtils = {
  getTokens: getAdminDashboardTokens,
  createStyles: createDashboardStyles,
  generateCSSProperties: generateAdminDashboardCSSProperties,
  validate: validateAdminDashboardTokens,
  logUsage: logDesignSystemUsage,
  getTypedToken: getTypedAdminToken,
  createResponsiveStyles: createResponsiveDashboardStyles,
};

export default adminDashboardUtils;