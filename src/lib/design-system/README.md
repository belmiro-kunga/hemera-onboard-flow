# Design System Implementation

This directory contains the core design system implementation for the HCP Onboarding application.

## Files Structure

```
src/lib/design-system/
├── index.ts              # Main entry point, exports everything
├── types.ts              # TypeScript interfaces for all design token categories
├── tokens.ts             # Main design system configuration with all token values
├── utils.ts              # Utility functions for accessing design tokens safely
├── examples.ts           # Usage examples and demonstrations
├── README.md             # This documentation
└── __tests__/
    └── design-system.test.ts  # Comprehensive test suite
```

## Key Features

### 1. TypeScript Interfaces (types.ts)
- `DesignSystem` - Main interface for the entire design system
- `TypographyTokens` - Font families, weights, and sizes
- `ColorTokens` - Color palette and semantic colors
- `SpacingTokens` - Spacing scale (xs, sm, md, lg, xl)
- `RadiusTokens` - Border radius values
- `ElevationTokens` - Shadow definitions
- `LayoutTokens` - Layout dimensions
- `ComponentTokens` - Component-specific styling
- `IconTokens` - Icon styling guidelines
- `FeedbackTokens` - Notification and feedback styling

### 2. Design System Configuration (tokens.ts)
Complete implementation of all design tokens including:
- **Typography**: Inter font family, font weights (400, 500, 700), heading styles (h1-h3), body text
- **Colors**: Primary (#3B82F6), semantic colors (success, warning, danger, info), text colors
- **Spacing**: 5-point scale from xs (4px) to xl (32px)
- **Layout**: Sidebar width (250px), header height (64px), content padding (24px)
- **Components**: Styling for sidebar, header, cards, buttons, charts, badges
- **Elevation**: Shadow system with none, low, medium, high levels

### 3. Utility Functions (utils.ts)
Safe token access utilities:
- `getToken()` - Generic token accessor with fallback support
- `getColor()` - Color token accessor with validation
- `getSpacing()` - Spacing token accessor with validation
- `getHeadingStyle()` - Typography utilities for headings
- `getBodyStyle()` - Body text styling
- `getComponentStyle()` - Component-specific styling
- `generateCSSCustomProperties()` - CSS custom properties generation
- `validateDesignSystem()` - Design system validation
- `createStyleObject()` - CSS-in-JS style object creation
- `getDesignSystemInfo()` - Design system metadata

## Usage Examples

### Basic Token Access
```typescript
import { designSystem, getColor, getSpacing } from '@/lib/design-system';

// Direct access
const primaryColor = designSystem.colors.primary;

// Using utilities
const backgroundColor = getColor('surface');
const padding = getSpacing('md');
```

### Typography
```typescript
import { getHeadingStyle, getBodyStyle } from '@/lib/design-system';

const h1Style = getHeadingStyle('h1');
const bodyStyle = getBodyStyle();
```

### Component Styling
```typescript
import { getComponentStyle } from '@/lib/design-system';

const buttonStyle = getComponentStyle('button', 'primary');
const cardStyle = getComponentStyle('card');
```

### CSS Custom Properties
```typescript
import { generateCSSCustomProperties } from '@/lib/design-system';

const cssProps = generateCSSCustomProperties();
// Results in: { '--color-primary': '#3B82F6', '--spacing-md': '16px', ... }
```

## Requirements Compliance

This implementation satisfies the following requirements:

- **Requirement 1.1**: ✅ Centralized configuration for typography, colors, spacing, and component styles
- **Requirement 1.2**: ✅ Structured configuration object exposing all design values
- **Requirement 1.3**: ✅ Automatic component updates when design system changes

## Testing

The design system includes comprehensive tests in `__tests__/design-system.test.ts` covering:
- Configuration validation
- Utility function behavior
- Token access and fallbacks
- CSS custom property generation
- Design system validation

## Next Steps

This core implementation provides the foundation for:
1. Tailwind CSS integration (Task 2-4)
2. Component styling system (Task 5-8)
3. Existing component migration (Task 9)
4. Development tools and utilities (Task 10-12)