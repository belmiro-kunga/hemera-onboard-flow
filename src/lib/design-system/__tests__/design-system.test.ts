/**
 * Design System Tests
 * 
 * Tests for the core design system functionality
 */

import { describe, it, expect } from 'vitest';
import {
  designSystem,
  getToken,
  getColor,
  getSpacing,
  getRadius,
  getElevation,
  getLayout,
  getHeadingStyle,
  getBodyStyle,
  getSidebarStyle,
  getHeaderStyle,
  getCardStyle,
  getButtonStyle,
  validateDesignSystem,
  generateCSSCustomProperties,
  getDesignSystemInfo,
  getSemanticColor,
  validateColorCombination,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  validateColorAccessibility,
  getBestTextColor,
  isLightColor
} from '../index';

describe('Design System', () => {
  describe('designSystem configuration', () => {
    it('should have all required token categories', () => {
      expect(designSystem).toHaveProperty('typography');
      expect(designSystem).toHaveProperty('colors');
      expect(designSystem).toHaveProperty('spacing');
      expect(designSystem).toHaveProperty('radius');
      expect(designSystem).toHaveProperty('elevation');
      expect(designSystem).toHaveProperty('layout');
      expect(designSystem).toHaveProperty('components');
      expect(designSystem).toHaveProperty('icons');
      expect(designSystem).toHaveProperty('feedback');
    });

    it('should have correct typography configuration', () => {
      expect(designSystem.typography.fontFamily).toBe('Inter, sans-serif');
      expect(designSystem.typography.fontWeights.regular).toBe(400);
      expect(designSystem.typography.fontWeights.medium).toBe(500);
      expect(designSystem.typography.fontWeights.bold).toBe(700);
    });

    it('should have correct color tokens', () => {
      expect(designSystem.colors.primary).toBe('#3B82F6');
      expect(designSystem.colors.success).toBe('#10B981');
      expect(designSystem.colors.warning).toBe('#F59E0B');
      expect(designSystem.colors.danger).toBe('#EF4444');
    });

    it('should have correct spacing tokens', () => {
      expect(designSystem.spacing.xs).toBe('4px');
      expect(designSystem.spacing.sm).toBe('8px');
      expect(designSystem.spacing.md).toBe('16px');
      expect(designSystem.spacing.lg).toBe('24px');
      expect(designSystem.spacing.xl).toBe('32px');
    });

    it('should have correct radius tokens', () => {
      expect(designSystem.radius.sm).toBe('4px');
      expect(designSystem.radius.md).toBe('8px');
      expect(designSystem.radius.lg).toBe('12px');
    });

    it('should have correct elevation tokens', () => {
      expect(designSystem.elevation.none).toBe('none');
      expect(designSystem.elevation.low).toContain('rgba(0, 0, 0, 0.1)');
      expect(designSystem.elevation.medium).toContain('rgba(0, 0, 0, 0.1)');
      expect(designSystem.elevation.high).toContain('rgba(0, 0, 0, 0.1)');
    });

    it('should have correct layout tokens', () => {
      expect(designSystem.layout.sidebarWidth).toBe('250px');
      expect(designSystem.layout.headerHeight).toBe('64px');
      expect(designSystem.layout.contentPadding).toBe('24px');
    });
  });

  describe('getToken utility', () => {
    it('should return token category when no path is provided', () => {
      const colors = getToken('colors');
      expect(colors).toBe(designSystem.colors);
    });

    it('should return specific token value with path', () => {
      const primaryColor = getToken('colors', 'primary');
      expect(primaryColor).toBe('#3B82F6');
    });

    it('should return nested token value', () => {
      const h1FontSize = getToken('typography', 'headings.h1.fontSize');
      expect(h1FontSize).toBe('24px');
    });

    it('should return fallback for missing token', () => {
      const missingToken = getToken('colors', 'nonexistent', '#000000');
      expect(missingToken).toBe('#000000');
    });
  });

  describe('getColor utility', () => {
    it('should return correct color value', () => {
      expect(getColor('primary')).toBe('#3B82F6');
      expect(getColor('success')).toBe('#10B981');
    });

    it('should return fallback for invalid color', () => {
      const fallback = '#000000';
      // @ts-expect-error Testing invalid key
      expect(getColor('invalid', fallback)).toBe(fallback);
    });
  });

  describe('getSpacing utility', () => {
    it('should return correct spacing value', () => {
      expect(getSpacing('md')).toBe('16px');
      expect(getSpacing('lg')).toBe('24px');
    });

    it('should return fallback for invalid spacing', () => {
      const fallback = '0px';
      // @ts-expect-error Testing invalid key
      expect(getSpacing('invalid', fallback)).toBe(fallback);
    });
  });

  describe('getRadius utility', () => {
    it('should return correct radius value', () => {
      expect(getRadius('sm')).toBe('4px');
      expect(getRadius('md')).toBe('8px');
      expect(getRadius('lg')).toBe('12px');
    });

    it('should return fallback for invalid radius', () => {
      const fallback = '0px';
      // @ts-expect-error Testing invalid key
      expect(getRadius('invalid', fallback)).toBe(fallback);
    });
  });

  describe('getElevation utility', () => {
    it('should return correct elevation value', () => {
      expect(getElevation('none')).toBe('none');
      expect(getElevation('low')).toContain('rgba(0, 0, 0, 0.1)');
      expect(getElevation('medium')).toContain('rgba(0, 0, 0, 0.1)');
      expect(getElevation('high')).toContain('rgba(0, 0, 0, 0.1)');
    });

    it('should return fallback for invalid elevation', () => {
      const fallback = 'none';
      // @ts-expect-error Testing invalid key
      expect(getElevation('invalid', fallback)).toBe(fallback);
    });
  });

  describe('getLayout utility', () => {
    it('should return correct layout value', () => {
      expect(getLayout('sidebarWidth')).toBe('250px');
      expect(getLayout('headerHeight')).toBe('64px');
      expect(getLayout('contentPadding')).toBe('24px');
    });

    it('should return fallback for invalid layout', () => {
      const fallback = '0px';
      // @ts-expect-error Testing invalid key
      expect(getLayout('invalid', fallback)).toBe(fallback);
    });
  });

  describe('getHeadingStyle utility', () => {
    it('should return correct heading styles', () => {
      const h1Style = getHeadingStyle('h1');
      expect(h1Style.fontSize).toBe('24px');
      expect(h1Style.fontWeight).toBe('700');
      expect(h1Style.fontFamily).toBe('Inter, sans-serif');
      expect(h1Style.lineHeight).toBe('1.2');

      const h2Style = getHeadingStyle('h2');
      expect(h2Style.fontSize).toBe('20px');
      expect(h2Style.fontWeight).toBe('700');
      expect(h2Style.lineHeight).toBe('1.3');

      const h3Style = getHeadingStyle('h3');
      expect(h3Style.fontSize).toBe('18px');
      expect(h3Style.fontWeight).toBe('500');
      expect(h3Style.lineHeight).toBe('1.4');
    });
  });

  describe('getBodyStyle utility', () => {
    it('should return correct body text style', () => {
      const bodyStyle = getBodyStyle();
      expect(bodyStyle.fontSize).toBe('14px');
      expect(bodyStyle.fontWeight).toBe('400');
      expect(bodyStyle.fontFamily).toBe('Inter, sans-serif');
      expect(bodyStyle.lineHeight).toBe('1.5');
    });
  });

  describe('Component Styling Utilities (Task 5)', () => {
    describe('getSidebarStyle utility', () => {
      it('should return correct sidebar styling tokens', () => {
        const sidebarStyle = getSidebarStyle();
        expect(sidebarStyle.background).toBe('#FFFFFF');
        expect(sidebarStyle.border).toBe('#E5E7EB');
        expect(sidebarStyle.activeItemBackground).toBe('#EBF8FF');
        expect(sidebarStyle.activeItemColor).toBe('#3B82F6');
      });
    });

    describe('getHeaderStyle utility', () => {
      it('should return correct header styling tokens', () => {
        const headerStyle = getHeaderStyle();
        expect(headerStyle.background).toBe('#FFFFFF');
        expect(headerStyle.border).toBe('#E5E7EB');
        expect(headerStyle.fontSize).toBe('16px');
        expect(headerStyle.fontWeight).toBe('500');
      });
    });

    describe('getCardStyle utility', () => {
      it('should return correct card styling tokens', () => {
        const cardStyle = getCardStyle();
        expect(cardStyle.background).toBe('#FFFFFF');
        expect(cardStyle.borderRadius).toBe('8px');
        expect(cardStyle.shadow).toContain('rgba(0, 0, 0, 0.1)');
        expect(cardStyle.padding).toBe('16px');
      });
    });

    describe('getButtonStyle utility', () => {
      it('should return correct primary button styling tokens', () => {
        const primaryButtonStyle = getButtonStyle('primary');
        expect(primaryButtonStyle.background).toBe('#3B82F6');
        expect(primaryButtonStyle.color).toBe('#FFFFFF');
        expect(primaryButtonStyle.borderRadius).toBe('8px');
        expect(primaryButtonStyle.padding).toBe('8px 16px');
        expect(primaryButtonStyle.border).toBeUndefined();
      });

      it('should return correct secondary button styling tokens', () => {
        const secondaryButtonStyle = getButtonStyle('secondary');
        expect(secondaryButtonStyle.background).toBe('#FFFFFF');
        expect(secondaryButtonStyle.color).toBe('#374151');
        expect(secondaryButtonStyle.border).toBe('#D1D5DB');
        expect(secondaryButtonStyle.borderRadius).toBe('8px');
        expect(secondaryButtonStyle.padding).toBe('8px 16px');
      });

      it('should default to primary variant when no variant specified', () => {
        const defaultButtonStyle = getButtonStyle();
        const primaryButtonStyle = getButtonStyle('primary');
        expect(defaultButtonStyle).toEqual(primaryButtonStyle);
      });
    });
  });

  describe('validateDesignSystem utility', () => {
    it('should validate design system successfully', () => {
      const validation = validateDesignSystem();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('generateCSSCustomProperties utility', () => {
    it('should generate CSS custom properties', () => {
      const cssProps = generateCSSCustomProperties();
      
      expect(cssProps['--font-family']).toBe('Inter, sans-serif');
      expect(cssProps['--color-primary']).toBe('#3B82F6');
      expect(cssProps['--spacing-md']).toBe('16px');
      expect(cssProps['--radius-md']).toBe('8px');
    });

    it('should convert camelCase to kebab-case for CSS properties', () => {
      const cssProps = generateCSSCustomProperties();
      
      expect(cssProps['--color-text-primary']).toBe('#111827');
      expect(cssProps['--layout-sidebar-width']).toBe('250px');
      expect(cssProps['--layout-header-height']).toBe('64px');
    });

    it('should generate component-specific CSS custom properties (Task 5)', () => {
      const cssProps = generateCSSCustomProperties();
      
      // Sidebar component properties
      expect(cssProps['--sidebar-bg']).toBe('#FFFFFF');
      expect(cssProps['--sidebar-border']).toBe('#E5E7EB');
      expect(cssProps['--sidebar-active-bg']).toBe('#EBF8FF');
      expect(cssProps['--sidebar-active-color']).toBe('#3B82F6');
      
      // Header component properties
      expect(cssProps['--header-bg']).toBe('#FFFFFF');
      expect(cssProps['--header-border']).toBe('#E5E7EB');
      expect(cssProps['--header-font-size']).toBe('16px');
      expect(cssProps['--header-font-weight']).toBe('500');
      
      // Card component properties
      expect(cssProps['--card-bg']).toBe('#FFFFFF');
      expect(cssProps['--card-border-radius']).toBe('8px');
      expect(cssProps['--card-shadow']).toContain('rgba(0, 0, 0, 0.1)');
      expect(cssProps['--card-padding']).toBe('16px');
      
      // Button component properties
      expect(cssProps['--button-primary-bg']).toBe('#3B82F6');
      expect(cssProps['--button-primary-color']).toBe('#FFFFFF');
      expect(cssProps['--button-primary-border-radius']).toBe('8px');
      expect(cssProps['--button-primary-padding']).toBe('8px 16px');
      
      expect(cssProps['--button-secondary-bg']).toBe('#FFFFFF');
      expect(cssProps['--button-secondary-color']).toBe('#374151');
      expect(cssProps['--button-secondary-border']).toBe('#D1D5DB');
      expect(cssProps['--button-secondary-border-radius']).toBe('8px');
      expect(cssProps['--button-secondary-padding']).toBe('8px 16px');
    });
  });

  describe('getDesignSystemInfo utility', () => {
    it('should return design system metadata', () => {
      const info = getDesignSystemInfo();
      
      expect(info.version).toBe('1.0.0');
      expect(info.tokenCount).toBeGreaterThan(0);
      expect(info.categories).toContain('colors');
      expect(info.categories).toContain('typography');
      expect(info.categories).toContain('spacing');
    });
  });

  describe('Color Accessibility Utilities', () => {
    describe('getContrastRatio', () => {
      it('should calculate correct contrast ratios', () => {
        // White on black should have maximum contrast
        expect(getContrastRatio('#FFFFFF', '#000000')).toBe(21);
        
        // Same colors should have minimum contrast
        expect(getContrastRatio('#FFFFFF', '#FFFFFF')).toBe(1);
        
        // Design system primary on white should have good contrast
        const primaryContrast = getContrastRatio('#3B82F6', '#FFFFFF');
        expect(primaryContrast).toBeGreaterThan(3);
      });
    });

    describe('WCAG compliance checks', () => {
      it('should correctly identify WCAG AA compliance', () => {
        expect(meetsWCAGAA('#000000', '#FFFFFF')).toBe(true);
        expect(meetsWCAGAA('#3B82F6', '#FFFFFF')).toBe(true);
        expect(meetsWCAGAA('#CCCCCC', '#FFFFFF')).toBe(false);
      });

      it('should correctly identify WCAG AAA compliance', () => {
        expect(meetsWCAGAAA('#000000', '#FFFFFF')).toBe(true);
        expect(meetsWCAGAAA('#3B82F6', '#FFFFFF')).toBe(false);
      });
    });

    describe('getBestTextColor', () => {
      it('should return white for dark backgrounds', () => {
        expect(getBestTextColor('#000000')).toBe('#FFFFFF');
        expect(getBestTextColor('#3B82F6')).toBe('#FFFFFF');
      });

      it('should return black for light backgrounds', () => {
        expect(getBestTextColor('#FFFFFF')).toBe('#000000');
        expect(getBestTextColor('#F9FAFB')).toBe('#000000');
      });
    });

    describe('isLightColor', () => {
      it('should correctly identify light colors', () => {
        expect(isLightColor('#FFFFFF')).toBe(true);
        expect(isLightColor('#F9FAFB')).toBe(true);
        expect(isLightColor('#000000')).toBe(false);
        expect(isLightColor('#3B82F6')).toBe(false);
      });
    });

    describe('getSemanticColor', () => {
      it('should return semantic color with accessibility info', () => {
        const primarySemantic = getSemanticColor('primary');
        
        expect(primarySemantic.color).toBe('#3B82F6');
        expect(primarySemantic.textColor).toBe('#FFFFFF');
        expect(typeof primarySemantic.accessible).toBe('boolean');
      });

      it('should return light variant when requested', () => {
        const primaryLight = getSemanticColor('primary', 'light');
        
        expect(primaryLight.color).not.toBe('#3B82F6');
        expect(primaryLight.textColor).toBeDefined();
        expect(typeof primaryLight.accessible).toBe('boolean');
      });
    });

    describe('validateColorCombination', () => {
      it('should validate color combinations correctly', () => {
        const validation = validateColorCombination('#000000', '#FFFFFF');
        
        expect(validation.isValid).toBe(true);
        expect(validation.ratio).toBe(21);
        expect(validation.level).toBe('AAA');
      });

      it('should provide recommendations for failing combinations', () => {
        const validation = validateColorCombination('#CCCCCC', '#FFFFFF');
        
        expect(validation.isValid).toBe(false);
        expect(validation.recommendation).toBeDefined();
      });
    });

    describe('validateColorAccessibility', () => {
      it('should validate all design system color combinations', () => {
        const validation = validateColorAccessibility();
        
        expect(validation.results).toBeInstanceOf(Array);
        expect(validation.results.length).toBeGreaterThan(0);
        expect(validation.summary.total).toBeGreaterThan(0);
        expect(typeof validation.isValid).toBe('boolean');
      });

      it('should provide detailed accessibility information', () => {
        const validation = validateColorAccessibility();
        const firstResult = validation.results[0];
        
        expect(firstResult.combination).toBeDefined();
        expect(firstResult.foreground).toBeDefined();
        expect(firstResult.background).toBeDefined();
        expect(firstResult.accessibility.level).toBeDefined();
        expect(firstResult.accessibility.ratio).toBeGreaterThan(0);
      });
    });
  });
});