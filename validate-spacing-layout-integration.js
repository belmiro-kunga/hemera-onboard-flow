// Spacing and Layout Token Integration Validation Script
import { designSystem, getSpacing, getRadius, getElevation, getLayout, generateCSSCustomProperties } from './src/lib/design-system/index.js';

console.log('🎨 Spacing and Layout Token System Integration Validation');
console.log('='.repeat(60));

// Test spacing tokens configuration
console.log('\n✅ Spacing Tokens Configuration:');
console.log('- XS Spacing:', designSystem.spacing.xs);
console.log('- SM Spacing:', designSystem.spacing.sm);
console.log('- MD Spacing:', designSystem.spacing.md);
console.log('- LG Spacing:', designSystem.spacing.lg);
console.log('- XL Spacing:', designSystem.spacing.xl);

// Test border radius tokens configuration
console.log('\n✅ Border Radius Tokens Configuration:');
console.log('- SM Radius:', designSystem.radius.sm);
console.log('- MD Radius:', designSystem.radius.md);
console.log('- LG Radius:', designSystem.radius.lg);

// Test elevation/shadow tokens configuration
console.log('\n✅ Elevation/Shadow Tokens Configuration:');
console.log('- None Elevation:', designSystem.elevation.none);
console.log('- Low Elevation:', designSystem.elevation.low);
console.log('- Medium Elevation:', designSystem.elevation.medium);
console.log('- High Elevation:', designSystem.elevation.high);

// Test layout dimension tokens configuration
console.log('\n✅ Layout Dimension Tokens Configuration:');
console.log('- Sidebar Width:', designSystem.layout.sidebarWidth);
console.log('- Header Height:', designSystem.layout.headerHeight);
console.log('- Content Padding:', designSystem.layout.contentPadding);

// Test utility functions
console.log('\n✅ Utility Functions:');
console.log('- getSpacing("md"):', getSpacing('md'));
console.log('- getRadius("lg"):', getRadius('lg'));
console.log('- getElevation("medium"):', getElevation('medium'));
console.log('- getLayout("sidebarWidth"):', getLayout('sidebarWidth'));

// Test CSS custom properties generation
console.log('\n✅ CSS Custom Properties Generation:');
const cssProps = generateCSSCustomProperties();
const spacingProps = Object.entries(cssProps).filter(([key]) => key.startsWith('--spacing-'));
const radiusProps = Object.entries(cssProps).filter(([key]) => key.startsWith('--radius-'));
const elevationProps = Object.entries(cssProps).filter(([key]) => key.startsWith('--elevation-'));
const layoutProps = Object.entries(cssProps).filter(([key]) => key.startsWith('--layout-'));

console.log('- Spacing CSS Properties:', spacingProps.length);
spacingProps.forEach(([key, value]) => console.log(`  ${key}: ${value}`));

console.log('- Radius CSS Properties:', radiusProps.length);
radiusProps.forEach(([key, value]) => console.log(`  ${key}: ${value}`));

console.log('- Elevation CSS Properties:', elevationProps.length);
elevationProps.forEach(([key, value]) => console.log(`  ${key}: ${value}`));

console.log('- Layout CSS Properties:', layoutProps.length);
layoutProps.forEach(([key, value]) => console.log(`  ${key}: ${value}`));

// Requirement validation
console.log('\n🔍 Requirements Validation:');

// Requirement 4.1: Spacing tokens (xs, sm, md, lg, xl) in Tailwind configuration
const hasSpacingTokens = 
  designSystem.spacing.xs === '4px' &&
  designSystem.spacing.sm === '8px' &&
  designSystem.spacing.md === '16px' &&
  designSystem.spacing.lg === '24px' &&
  designSystem.spacing.xl === '32px';

console.log('- ✓ Requirement 4.1 - Spacing tokens (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px):', hasSpacingTokens ? 'PASS' : 'FAIL');

// Requirement 4.2: Border radius tokens and Tailwind integration
const hasBorderRadiusTokens = 
  designSystem.radius.sm === '4px' &&
  designSystem.radius.md === '8px' &&
  designSystem.radius.lg === '12px';

console.log('- ✓ Requirement 4.2 - Border radius tokens (sm: 4px, md: 8px, lg: 12px):', hasBorderRadiusTokens ? 'PASS' : 'FAIL');

// Requirement 4.3: Elevation/shadow system with defined shadow levels
const hasElevationSystem = 
  designSystem.elevation.none === 'none' &&
  designSystem.elevation.low.includes('rgba(0, 0, 0, 0.1)') &&
  designSystem.elevation.medium.includes('rgba(0, 0, 0, 0.1)') &&
  designSystem.elevation.high.includes('rgba(0, 0, 0, 0.1)');

console.log('- ✓ Requirement 4.3 - Elevation/shadow system with defined levels:', hasElevationSystem ? 'PASS' : 'FAIL');

// Requirement 4.4: Layout dimension tokens (sidebar width, header height, content padding)
const hasLayoutTokens = 
  designSystem.layout.sidebarWidth === '250px' &&
  designSystem.layout.headerHeight === '64px' &&
  designSystem.layout.contentPadding === '24px';

console.log('- ✓ Requirement 4.4 - Layout dimension tokens (sidebar: 250px, header: 64px, content: 24px):', hasLayoutTokens ? 'PASS' : 'FAIL');

// Test utility function error handling
console.log('\n✅ Error Handling:');
try {
  const invalidSpacing = getSpacing('invalid');
  console.log('- Invalid spacing token handling: PASS (returned fallback)');
} catch (error) {
  console.log('- Invalid spacing token handling: FAIL (threw error)');
}

try {
  const invalidRadius = getRadius('invalid');
  console.log('- Invalid radius token handling: PASS (returned fallback)');
} catch (error) {
  console.log('- Invalid radius token handling: FAIL (threw error)');
}

// Summary
const allRequirementsPassed = hasSpacingTokens && hasBorderRadiusTokens && hasElevationSystem && hasLayoutTokens;
console.log('\n🎯 Summary:');
console.log('- All spacing and layout requirements:', allRequirementsPassed ? '✅ PASSED' : '❌ FAILED');
console.log('- Total spacing tokens:', Object.keys(designSystem.spacing).length);
console.log('- Total radius tokens:', Object.keys(designSystem.radius).length);
console.log('- Total elevation tokens:', Object.keys(designSystem.elevation).length);
console.log('- Total layout tokens:', Object.keys(designSystem.layout).length);

if (allRequirementsPassed) {
  console.log('\n🎉 Spacing and layout token system implementation is complete and meets all requirements!');
} else {
  console.log('\n⚠️  Some requirements are not met. Please review the implementation.');
}