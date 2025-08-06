// Simple validation script for the design system
import { designSystem, validateDesignSystem, getColor, getSpacing } from './src/lib/design-system/index.js';

console.log('🎨 Design System Validation');
console.log('============================');

// Test basic configuration
console.log('\n✅ Design System Configuration:');
console.log('- Typography font family:', designSystem.typography.fontFamily);
console.log('- Primary color:', designSystem.colors.primary);
console.log('- Medium spacing:', designSystem.spacing.md);

// Test utilities
console.log('\n✅ Utility Functions:');
console.log('- getColor("primary"):', getColor('primary'));
console.log('- getSpacing("lg"):', getSpacing('lg'));

// Test validation
console.log('\n✅ Design System Validation:');
const validation = validateDesignSystem();
console.log('- Is valid:', validation.isValid);
console.log('- Errors:', validation.errors.length === 0 ? 'None' : validation.errors);

console.log('\n🎉 Design System validation complete!');