/**
 * Design System Entry Point
 * 
 * This file exports all design system components, types, and utilities
 * for easy consumption throughout the application.
 */

// Export types
export type {
  DesignSystem,
  TypographyTokens,
  ColorTokens,
  SpacingTokens,
  RadiusTokens,
  ElevationTokens,
  LayoutTokens,
  ComponentTokens,
  IconTokens,
  FeedbackTokens
} from './types';

// Export the main design system configuration
export { designSystem } from './tokens';

// Export utility functions
export {
  getToken,
  getColor,
  getSpacing,
  getRadius,
  getElevation,
  getLayout,
  getHeadingStyle,
  getBodyStyle,
  getComponentStyle,
  getSidebarStyle,
  getHeaderStyle,
  getCardStyle,
  getButtonStyle,
  generateCSSCustomProperties,
  validateDesignSystem,
  createStyleObject,
  getDesignSystemInfo,
  getSemanticColor,
  validateColorCombination
} from './utils';

// Export color accessibility utilities
export {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  meetsWCAGAALarge,
  getAccessibilityLevel,
  validateColorAccessibility,
  getBestTextColor,
  generateAccessibleVariants,
  isLightColor,
  getSemanticColorInfo
} from './color-accessibility';

// Export chart utilities
export {
  getChartLineColors,
  getChartFillColors,
  getDonutChartColors,
  getChartPointRadius,
  getLineColor,
  getFillColor,
  getDonutColor,
  createChartTheme,
  generateChartCSSProperties,
  getChartColorPalette,
  createChartConfig,
  getChartThemeClasses,
  generateChartLegend
} from './chart-utils';

export type { ChartTheme } from './chart-utils';

// Re-export everything for convenience
export * from './types';
export * from './tokens';
export * from './utils';