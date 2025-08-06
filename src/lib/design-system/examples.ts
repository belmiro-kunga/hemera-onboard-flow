/**
 * Design System Usage Examples
 * 
 * This file demonstrates how to use the design system in various scenarios
 */

import {
  designSystem,
  getColor,
  getSpacing,
  getHeadingStyle,
  getBodyStyle,
  getComponentStyle,
  createStyleObject,
  generateCSSCustomProperties
} from './index';

// Example 1: Direct token access
export const exampleDirectAccess = {
  primaryColor: designSystem.colors.primary,
  mediumSpacing: designSystem.spacing.md,
  h1Style: designSystem.typography.headings.h1
};

// Example 2: Using utility functions
export const exampleUtilityUsage = {
  backgroundColor: getColor('background'),
  padding: getSpacing('lg'),
  color: getColor('textPrimary')
};

// Example 3: Typography utilities
export const exampleTypographyUsage = {
  headingStyle: getHeadingStyle('h1'),
  bodyStyle: getBodyStyle()
};

// Example 4: Component styling
export const exampleComponentUsage = {
  buttonPrimary: getComponentStyle('button', 'primary'),
  cardStyle: getComponentStyle('card'),
  sidebarStyle: getComponentStyle('sidebar')
};

// Example 5: CSS-in-JS style object
export const exampleCSSInJS = createStyleObject({
  backgroundColor: 'colors.surface',
  color: 'colors.textPrimary',
  padding: 'spacing.md',
  borderRadius: 'radius.md',
  boxShadow: 'elevation.low'
});

// Example 6: CSS custom properties generation
export const exampleCSSCustomProps = generateCSSCustomProperties();

// Example 7: React component usage (pseudo-code)
export const exampleReactComponent = `
import React from 'react';
import { getColor, getSpacing, getHeadingStyle } from '@/lib/design-system';

const ExampleComponent: React.FC = () => {
  const h1Style = getHeadingStyle('h1');
  
  return (
    <div style={{
      backgroundColor: getColor('surface'),
      padding: getSpacing('lg'),
      color: getColor('textPrimary')
    }}>
      <h1 style={h1Style}>
        Design System Example
      </h1>
      <p style={{
        fontSize: '14px',
        color: getColor('textSecondary')
      }}>
        This component uses the design system tokens.
      </p>
    </div>
  );
};
`;

// Example 8: Tailwind CSS integration (pseudo-code)
export const exampleTailwindIntegration = `
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${designSystem.colors.primary}',
        secondary: '${designSystem.colors.secondary}',
        success: '${designSystem.colors.success}',
        warning: '${designSystem.colors.warning}',
        danger: '${designSystem.colors.danger}',
      },
      spacing: {
        xs: '${designSystem.spacing.xs}',
        sm: '${designSystem.spacing.sm}',
        md: '${designSystem.spacing.md}',
        lg: '${designSystem.spacing.lg}',
        xl: '${designSystem.spacing.xl}',
      },
      fontFamily: {
        sans: ['${designSystem.typography.fontFamily}'],
      }
    }
  }
}
`;

console.log('Design System Examples loaded successfully!');