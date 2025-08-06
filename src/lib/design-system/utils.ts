/**
 * Design System Utilities
 * 
 * This file contains utility functions for accessing design tokens safely
 * with TypeScript support and runtime validation.
 */

import { designSystem } from './tokens';
import type { DesignSystem, ColorTokens, TypographyTokens, SpacingTokens, ComponentState } from './types';
import {
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

/**
 * Get a design token value with type safety and fallback support
 */
export function getToken<T extends keyof DesignSystem>(
  category: T,
  path?: string,
  fallback?: any
): any {
  try {
    if (!path) {
      return designSystem[category];
    }

    const keys = path.split('.');
    let value: any = designSystem[category];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        if (fallback !== undefined) {
          return fallback;
        }
        throw new Error(`Design token not found: ${category}.${path}`);
      }
    }

    return value;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    console.warn(`Failed to access design token: ${category}.${path || ''}`, error);
    return undefined;
  }
}

/**
 * Get a color token with validation
 */
export function getColor(colorKey: keyof ColorTokens, fallback?: string): string {
  const color = getToken('colors', colorKey, fallback);
  
  if (typeof color !== 'string') {
    console.warn(`Invalid color token: ${colorKey}`);
    return fallback || '#000000';
  }
  
  return color;
}

/**
 * Get a color from a color scale
 */
export function getColorScale(
  scale: 'primaryScale' | 'secondaryScale' | 'successScale' | 'warningScale' | 'dangerScale' | 'accentScale',
  shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  fallback?: string
): string {
  const colorScale = getToken('colors', scale, {});
  const color = colorScale[shade];
  
  if (typeof color !== 'string') {
    console.warn(`Invalid color scale token: ${scale}.${shade}`);
    return fallback || '#000000';
  }
  
  return color;
}

/**
 * Get animation token with validation
 */
export function getAnimation(
  category: 'duration' | 'easing' | 'delay',
  key: string,
  fallback?: string
): string {
  const animation = getToken('animation', `${category}.${key}`, fallback);
  
  if (typeof animation !== 'string') {
    console.warn(`Invalid animation token: ${category}.${key}`);
    return fallback || '0ms';
  }
  
  return animation;
}

/**
 * Get a spacing token with validation
 */
export function getSpacing(spacingKey: keyof SpacingTokens, fallback?: string): string {
  const spacing = getToken('spacing', spacingKey, fallback);
  
  if (typeof spacing !== 'string') {
    console.warn(`Invalid spacing token: ${spacingKey}`);
    return fallback || '0px';
  }
  
  return spacing;
}

/**
 * Get a border radius token with validation
 */
export function getRadius(radiusKey: 'sm' | 'md' | 'lg', fallback?: string): string {
  const radius = getToken('radius', radiusKey, fallback);
  
  if (typeof radius !== 'string') {
    console.warn(`Invalid radius token: ${radiusKey}`);
    return fallback || '0px';
  }
  
  return radius;
}

/**
 * Get an elevation/shadow token with validation
 */
export function getElevation(elevationKey: 'none' | 'low' | 'medium' | 'high', fallback?: string): string {
  const elevation = getToken('elevation', elevationKey, fallback);
  
  if (typeof elevation !== 'string') {
    console.warn(`Invalid elevation token: ${elevationKey}`);
    return fallback || 'none';
  }
  
  return elevation;
}

/**
 * Get a layout dimension token with validation
 */
export function getLayout(layoutKey: 'sidebarWidth' | 'headerHeight' | 'contentPadding', fallback?: string): string {
  const layout = getToken('layout', layoutKey, fallback);
  
  if (typeof layout !== 'string') {
    console.warn(`Invalid layout token: ${layoutKey}`);
    return fallback || '0px';
  }
  
  return layout;
}

/**
 * Get typography values for a specific heading level
 */
export function getHeadingStyle(level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): {
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  lineHeight: string;
} {
  const headingStyle = getToken('typography', `headings.${level}`);
  const fontFamily = getToken('typography', 'fontFamily');
  
  return {
    fontSize: headingStyle?.fontSize || '16px',
    fontWeight: headingStyle?.fontWeight || '400',
    fontFamily: fontFamily || 'sans-serif',
    lineHeight: headingStyle?.lineHeight || '1.5'
  };
}

/**
 * Get body text style
 */
export function getBodyStyle(): {
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  lineHeight: string;
} {
  const bodyStyle = getToken('typography', 'body');
  const fontFamily = getToken('typography', 'fontFamily');
  
  return {
    fontSize: bodyStyle?.fontSize || '14px',
    fontWeight: bodyStyle?.fontWeight || '400',
    fontFamily: fontFamily || 'sans-serif',
    lineHeight: bodyStyle?.lineHeight || '1.5'
  };
}

/**
 * Get component styling tokens
 */
export function getComponentStyle(component: string, variant?: string): any {
  const path = variant ? `${component}.${variant}` : component;
  return getToken('components', path);
}

/**
 * Get sidebar component styling tokens (Requirement 5.1)
 */
export function getSidebarStyle(): {
  background: string;
  border: string;
  activeItemBackground: string;
  activeItemColor: string;
} {
  return getToken('components', 'sidebar', {
    background: '#FFFFFF',
    border: '#E5E7EB',
    activeItemBackground: '#EBF8FF',
    activeItemColor: '#3B82F6'
  });
}

/**
 * Get header component styling tokens (Requirement 5.2)
 */
export function getHeaderStyle(): {
  background: string;
  border: string;
  fontSize: string;
  fontWeight: string;
} {
  return getToken('components', 'header', {
    background: '#FFFFFF',
    border: '#E5E7EB',
    fontSize: '16px',
    fontWeight: '500'
  });
}

/**
 * Get card component styling tokens (Requirement 5.3)
 */
export function getCardStyle(): {
  background: string;
  borderRadius: string;
  shadow: string;
  padding: string;
} {
  return getToken('components', 'card', {
    background: '#FFFFFF',
    borderRadius: '8px',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '16px'
  });
}

/**
 * Get button component styling tokens (Requirement 5.4)
 */
export function getButtonStyle(variant: 'primary' | 'secondary' = 'primary'): {
  background: string;
  color: string;
  border?: string;
  borderRadius: string;
  padding: string;
} {
  return getToken('components', `button.${variant}`, {
    background: variant === 'primary' ? '#3B82F6' : '#FFFFFF',
    color: variant === 'primary' ? '#FFFFFF' : '#374151',
    border: variant === 'secondary' ? '#D1D5DB' : undefined,
    borderRadius: '8px',
    padding: '8px 16px'
  });
}

/**
 * Get button size styling tokens
 */
export function getButtonSize(size: 'sm' | 'md' | 'lg' = 'md'): {
  fontSize: string;
  padding: string;
  borderRadius: string;
} {
  return getToken('components', `button.sizes.${size}`, {
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '8px'
  });
}

/**
 * Get component state styling tokens
 */
export function getComponentState(component: string, variant: string, state: string): ComponentState {
  return getToken('components', `${component}.${variant}.${state}`, {});
}

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCSSCustomProperties(): Record<string, string> {
  const cssProps: Record<string, string> = {};

  // Typography
  cssProps['--font-family'] = designSystem.typography.fontFamily;
  cssProps['--font-weight-regular'] = designSystem.typography.fontWeights.regular.toString();
  cssProps['--font-weight-medium'] = designSystem.typography.fontWeights.medium.toString();
  cssProps['--font-weight-bold'] = designSystem.typography.fontWeights.bold.toString();
  
  // Heading styles
  cssProps['--heading-1-font-size'] = designSystem.typography.headings.h1.fontSize;
  cssProps['--heading-1-line-height'] = designSystem.typography.headings.h1.lineHeight;
  cssProps['--heading-1-font-weight'] = designSystem.typography.headings.h1.fontWeight;
  
  cssProps['--heading-2-font-size'] = designSystem.typography.headings.h2.fontSize;
  cssProps['--heading-2-line-height'] = designSystem.typography.headings.h2.lineHeight;
  cssProps['--heading-2-font-weight'] = designSystem.typography.headings.h2.fontWeight;
  
  cssProps['--heading-3-font-size'] = designSystem.typography.headings.h3.fontSize;
  cssProps['--heading-3-line-height'] = designSystem.typography.headings.h3.lineHeight;
  cssProps['--heading-3-font-weight'] = designSystem.typography.headings.h3.fontWeight;
  
  // Body text styles
  cssProps['--body-font-size'] = designSystem.typography.body.fontSize;
  cssProps['--body-line-height'] = designSystem.typography.body.lineHeight;
  cssProps['--body-font-weight'] = designSystem.typography.body.fontWeight;

  // Colors
  Object.entries(designSystem.colors).forEach(([key, value]) => {
    cssProps[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
  });

  // Spacing
  Object.entries(designSystem.spacing).forEach(([key, value]) => {
    cssProps[`--spacing-${key}`] = value;
  });

  // Radius
  Object.entries(designSystem.radius).forEach(([key, value]) => {
    cssProps[`--radius-${key}`] = value;
  });

  // Elevation
  Object.entries(designSystem.elevation).forEach(([key, value]) => {
    cssProps[`--elevation-${key}`] = value;
  });

  // Layout
  Object.entries(designSystem.layout).forEach(([key, value]) => {
    cssProps[`--layout-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
  });

  // Component tokens (Task 5 Implementation)
  // Sidebar component tokens (Requirement 5.1)
  cssProps['--sidebar-bg'] = designSystem.components.sidebar.background;
  cssProps['--sidebar-border'] = designSystem.components.sidebar.border;
  cssProps['--sidebar-active-bg'] = designSystem.components.sidebar.activeItemBackground;
  cssProps['--sidebar-active-color'] = designSystem.components.sidebar.activeItemColor;

  // Header component tokens (Requirement 5.2)
  cssProps['--header-bg'] = designSystem.components.header.background;
  cssProps['--header-border'] = designSystem.components.header.border;
  cssProps['--header-font-size'] = designSystem.components.header.fontSize;
  cssProps['--header-font-weight'] = designSystem.components.header.fontWeight;

  // Card component tokens (Requirement 5.3)
  cssProps['--card-bg'] = designSystem.components.card.background;
  cssProps['--card-border-radius'] = designSystem.components.card.borderRadius;
  cssProps['--card-shadow'] = designSystem.components.card.shadow;
  cssProps['--card-padding'] = designSystem.components.card.padding;

  // Button component tokens (Requirement 5.4)
  cssProps['--button-primary-bg'] = designSystem.components.button.primary.background;
  cssProps['--button-primary-color'] = designSystem.components.button.primary.color;
  cssProps['--button-primary-border-radius'] = designSystem.components.button.primary.borderRadius;
  cssProps['--button-primary-padding'] = designSystem.components.button.primary.padding;

  cssProps['--button-secondary-bg'] = designSystem.components.button.secondary.background;
  cssProps['--button-secondary-color'] = designSystem.components.button.secondary.color;
  cssProps['--button-secondary-border'] = designSystem.components.button.secondary.border;
  cssProps['--button-secondary-border-radius'] = designSystem.components.button.secondary.borderRadius;
  cssProps['--button-secondary-padding'] = designSystem.components.button.secondary.padding;

  // Color scales (Critical Gap Fix)
  Object.entries(designSystem.colors.primaryScale).forEach(([shade, color]) => {
    cssProps[`--primary-${shade}`] = color;
  });
  Object.entries(designSystem.colors.secondaryScale).forEach(([shade, color]) => {
    cssProps[`--secondary-${shade}`] = color;
  });
  Object.entries(designSystem.colors.successScale).forEach(([shade, color]) => {
    cssProps[`--success-${shade}`] = color;
  });
  Object.entries(designSystem.colors.warningScale).forEach(([shade, color]) => {
    cssProps[`--warning-${shade}`] = color;
  });
  Object.entries(designSystem.colors.dangerScale).forEach(([shade, color]) => {
    cssProps[`--danger-${shade}`] = color;
  });
  Object.entries(designSystem.colors.accentScale).forEach(([shade, color]) => {
    cssProps[`--accent-${shade}`] = color;
  });

  // Animation tokens (Critical Gap Fix)
  Object.entries(designSystem.animation.duration).forEach(([key, value]) => {
    cssProps[`--duration-${key}`] = value;
  });
  Object.entries(designSystem.animation.easing).forEach(([key, value]) => {
    cssProps[`--easing-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
  });
  Object.entries(designSystem.animation.delay).forEach(([key, value]) => {
    cssProps[`--delay-${key}`] = value;
  });

  return cssProps;
}

/**
 * Validate that all required design tokens are present
 */
export function validateDesignSystem(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required color tokens
  const requiredColors: (keyof ColorTokens)[] = [
    'primary', 'secondary', 'background', 'surface', 'textPrimary', 'textSecondary',
    'success', 'warning', 'danger', 'info'
  ];

  requiredColors.forEach(color => {
    if (!designSystem.colors[color]) {
      errors.push(`Missing required color token: ${color}`);
    }
  });

  // Check typography tokens
  if (!designSystem.typography.fontFamily) {
    errors.push('Missing typography.fontFamily');
  }

  if (!designSystem.typography.headings.h1 || !designSystem.typography.headings.h2 || !designSystem.typography.headings.h3) {
    errors.push('Missing required heading styles');
  }

  // Check spacing tokens
  const requiredSpacing: (keyof SpacingTokens)[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  requiredSpacing.forEach(spacing => {
    if (!designSystem.spacing[spacing]) {
      errors.push(`Missing required spacing token: ${spacing}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create a CSS-in-JS style object from design tokens
 */
export function createStyleObject(tokenPaths: Record<string, string>): Record<string, any> {
  const styles: Record<string, any> = {};

  Object.entries(tokenPaths).forEach(([cssProperty, tokenPath]) => {
    const [category, ...pathParts] = tokenPath.split('.');
    const value = getToken(category as keyof DesignSystem, pathParts.join('.'));
    
    if (value !== undefined) {
      styles[cssProperty] = value;
    }
  });

  return styles;
}

/**
 * Get design system version and metadata
 */
export function getDesignSystemInfo(): {
  version: string;
  tokenCount: number;
  categories: string[];
} {
  const categories = Object.keys(designSystem);
  let tokenCount = 0;

  // Count all tokens recursively
  function countTokens(obj: any): number {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        count += countTokens(value);
      } else {
        count += 1;
      }
    }
    return count;
  }

  tokenCount = countTokens(designSystem);

  return {
    version: '1.0.0',
    tokenCount,
    categories
  };
}

/**
 * Get semantic color with accessibility information
 */
export function getSemanticColor(
  colorKey: keyof ColorTokens,
  variant: 'default' | 'light' | 'dark' = 'default'
): {
  color: string;
  textColor: string;
  accessible: boolean;
} {
  const baseColor = getColor(colorKey);
  const variants = generateAccessibleVariants(baseColor);
  
  let color: string;
  let textColor: string;
  
  switch (variant) {
    case 'light':
      color = variants.light;
      textColor = variants.textOnLight;
      break;
    case 'dark':
      color = variants.dark;
      textColor = variants.textOnDark;
      break;
    default:
      color = baseColor;
      textColor = getBestTextColor(baseColor);
  }
  
  const accessible = meetsWCAGAA(textColor, color);
  
  return {
    color,
    textColor,
    accessible
  };
}

/**
 * Validate color combination accessibility
 */
export function validateColorCombination(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' | 'AA Large' = 'AA'
): {
  isValid: boolean;
  ratio: number;
  level: string;
  recommendation?: string;
} {
  const accessibility = getAccessibilityLevel(foreground, background);
  
  let isValid = false;
  switch (level) {
    case 'AAA':
      isValid = accessibility.passes.aaa;
      break;
    case 'AA Large':
      isValid = accessibility.passes.aaLarge;
      break;
    default:
      isValid = accessibility.passes.aa;
  }
  
  let recommendation: string | undefined;
  if (!isValid) {
    if (level === 'AA Large' && !accessibility.passes.aaLarge) {
      recommendation = 'Increase contrast ratio to at least 3:1 for large text';
    } else if (level === 'AA' && !accessibility.passes.aa) {
      recommendation = 'Increase contrast ratio to at least 4.5:1 for normal text';
    } else if (level === 'AAA' && !accessibility.passes.aaa) {
      recommendation = 'Increase contrast ratio to at least 7:1 for AAA compliance';
    }
  }
  
  return {
    isValid,
    ratio: accessibility.ratio,
    level: accessibility.level,
    recommendation
  };
}