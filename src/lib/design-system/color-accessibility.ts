/**
 * Color Accessibility Utilities
 * 
 * This file provides utilities for color accessibility validation and contrast checking
 * to ensure WCAG compliance for the design system colors.
 */

import { designSystem } from './tokens';
import type { ColorTokens } from './types';

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards (4.5:1 for normal text)
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards (7:1 for normal text)
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

/**
 * Check if color combination meets WCAG AA standards for large text (3:1)
 */
export function meetsWCAGAALarge(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 3;
}

/**
 * Get accessibility level for a color combination
 */
export function getAccessibilityLevel(foreground: string, background: string): {
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  ratio: number;
  passes: {
    aa: boolean;
    aaa: boolean;
    aaLarge: boolean;
  };
} {
  const ratio = getContrastRatio(foreground, background);
  const aa = ratio >= 4.5;
  const aaa = ratio >= 7;
  const aaLarge = ratio >= 3;

  let level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  if (aaa) {
    level = 'AAA';
  } else if (aa) {
    level = 'AA';
  } else if (aaLarge) {
    level = 'AA Large';
  } else {
    level = 'Fail';
  }

  return {
    level,
    ratio: Math.round(ratio * 100) / 100,
    passes: {
      aa,
      aaa,
      aaLarge
    }
  };
}

/**
 * Validate all design system color combinations for accessibility
 */
export function validateColorAccessibility(): {
  isValid: boolean;
  results: Array<{
    combination: string;
    foreground: string;
    background: string;
    accessibility: ReturnType<typeof getAccessibilityLevel>;
    recommendation?: string;
  }>;
  summary: {
    total: number;
    passing: number;
    failing: number;
    warnings: number;
  };
} {
  const results: Array<{
    combination: string;
    foreground: string;
    background: string;
    accessibility: ReturnType<typeof getAccessibilityLevel>;
    recommendation?: string;
  }> = [];

  // Test common color combinations
  const testCombinations = [
    { name: 'Primary on Surface', fg: 'primary', bg: 'surface' },
    { name: 'Primary on Background', fg: 'primary', bg: 'background' },
    { name: 'Text Primary on Surface', fg: 'textPrimary', bg: 'surface' },
    { name: 'Text Primary on Background', fg: 'textPrimary', bg: 'background' },
    { name: 'Text Secondary on Surface', fg: 'textSecondary', bg: 'surface' },
    { name: 'Text Secondary on Background', fg: 'textSecondary', bg: 'background' },
    { name: 'Success on Surface', fg: 'success', bg: 'surface' },
    { name: 'Warning on Surface', fg: 'warning', bg: 'surface' },
    { name: 'Danger on Surface', fg: 'danger', bg: 'surface' },
    { name: 'Info on Surface', fg: 'info', bg: 'surface' },
    { name: 'White on Primary', fg: '#FFFFFF', bg: 'primary' },
    { name: 'White on Success', fg: '#FFFFFF', bg: 'success' },
    { name: 'White on Warning', fg: '#FFFFFF', bg: 'warning' },
    { name: 'White on Danger', fg: '#FFFFFF', bg: 'danger' },
    { name: 'White on Secondary', fg: '#FFFFFF', bg: 'secondary' },
  ];

  testCombinations.forEach(({ name, fg, bg }) => {
    const foregroundColor = fg.startsWith('#') ? fg : designSystem.colors[fg as keyof ColorTokens];
    const backgroundColor = bg.startsWith('#') ? bg : designSystem.colors[bg as keyof ColorTokens];
    
    if (foregroundColor && backgroundColor) {
      const accessibility = getAccessibilityLevel(foregroundColor, backgroundColor);
      
      let recommendation: string | undefined;
      if (accessibility.level === 'Fail') {
        recommendation = 'This color combination does not meet accessibility standards. Consider using a darker foreground or lighter background.';
      } else if (accessibility.level === 'AA Large') {
        recommendation = 'This combination only meets standards for large text (18pt+ or 14pt+ bold).';
      }

      results.push({
        combination: name,
        foreground: foregroundColor,
        background: backgroundColor,
        accessibility,
        recommendation
      });
    }
  });

  const passing = results.filter(r => r.accessibility.passes.aa).length;
  const failing = results.filter(r => !r.accessibility.passes.aaLarge).length;
  const warnings = results.filter(r => r.accessibility.level === 'AA Large').length;

  return {
    isValid: failing === 0,
    results,
    summary: {
      total: results.length,
      passing,
      failing,
      warnings
    }
  };
}

/**
 * Get the best text color (black or white) for a given background color
 */
export function getBestTextColor(backgroundColor: string): '#000000' | '#FFFFFF' {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

/**
 * Generate accessible color variants for a base color
 */
export function generateAccessibleVariants(baseColor: string): {
  light: string;
  dark: string;
  textOnLight: string;
  textOnDark: string;
} {
  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    return {
      light: '#F0F0F0',
      dark: '#333333',
      textOnLight: '#000000',
      textOnDark: '#FFFFFF'
    };
  }

  // Generate light variant (increase lightness)
  const lightR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.8));
  const lightG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.8));
  const lightB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.8));
  const light = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;

  // Generate dark variant (decrease lightness)
  const darkR = Math.round(rgb.r * 0.3);
  const darkG = Math.round(rgb.g * 0.3);
  const darkB = Math.round(rgb.b * 0.3);
  const dark = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

  return {
    light,
    dark,
    textOnLight: getBestTextColor(light),
    textOnDark: getBestTextColor(dark)
  };
}

/**
 * Check if a color is considered "light" or "dark"
 */
export function isLightColor(color: string): boolean {
  return getRelativeLuminance(color) > 0.5;
}

/**
 * Get semantic color information with accessibility data
 */
export function getSemanticColorInfo() {
  const colors = designSystem.colors;
  
  return {
    primary: {
      color: colors.primary,
      isLight: isLightColor(colors.primary),
      bestTextColor: getBestTextColor(colors.primary),
      variants: generateAccessibleVariants(colors.primary),
      onSurface: getAccessibilityLevel(colors.primary, colors.surface),
      onBackground: getAccessibilityLevel(colors.primary, colors.background)
    },
    success: {
      color: colors.success,
      isLight: isLightColor(colors.success),
      bestTextColor: getBestTextColor(colors.success),
      variants: generateAccessibleVariants(colors.success),
      onSurface: getAccessibilityLevel(colors.success, colors.surface),
      onBackground: getAccessibilityLevel(colors.success, colors.background)
    },
    warning: {
      color: colors.warning,
      isLight: isLightColor(colors.warning),
      bestTextColor: getBestTextColor(colors.warning),
      variants: generateAccessibleVariants(colors.warning),
      onSurface: getAccessibilityLevel(colors.warning, colors.surface),
      onBackground: getAccessibilityLevel(colors.warning, colors.background)
    },
    danger: {
      color: colors.danger,
      isLight: isLightColor(colors.danger),
      bestTextColor: getBestTextColor(colors.danger),
      variants: generateAccessibleVariants(colors.danger),
      onSurface: getAccessibilityLevel(colors.danger, colors.surface),
      onBackground: getAccessibilityLevel(colors.danger, colors.background)
    },
    info: {
      color: colors.info,
      isLight: isLightColor(colors.info),
      bestTextColor: getBestTextColor(colors.info),
      variants: generateAccessibleVariants(colors.info),
      onSurface: getAccessibilityLevel(colors.info, colors.surface),
      onBackground: getAccessibilityLevel(colors.info, colors.background)
    }
  };
}