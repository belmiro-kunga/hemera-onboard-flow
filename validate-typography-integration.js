// Typography Integration Validation Script
import { designSystem, getHeadingStyle, getBodyStyle, generateCSSCustomProperties } from './src/lib/design-system/index.js';

console.log('🎨 Typography System Integration Validation');
console.log('=============================================');

// Test typography configuration
console.log('\n✅ Typography Configuration:');
console.log('- Font Family:', designSystem.typography.fontFamily);
console.log('- Font Weights:', designSystem.typography.fontWeights);
console.log('- H1 Style:', designSystem.typography.headings.h1);
console.log('- H2 Style:', designSystem.typography.headings.h2);
console.log('- H3 Style:', designSystem.typography.headings.h3);
console.log('- Body Style:', designSystem.typography.body);

// Test utility functions
console.log('\n✅ Typography Utilities:');
console.log('- getHeadingStyle("h1"):', getHeadingStyle('h1'));
console.log('- getHeadingStyle("h2"):', getHeadingStyle('h2'));
console.log('- getHeadingStyle("h3"):', getHeadingStyle('h3'));
console.log('- getBodyStyle():', getBodyStyle());

// Test CSS custom properties generation
console.log('\n✅ CSS Custom Properties:');
const cssProps = generateCSSCustomProperties();
const typographyProps = Object.entries(cssProps)
  .filter(([key]) => key.includes('font') || key.includes('heading') || key.includes('body'))
  .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

console.log('Typography CSS Properties:', typographyProps);

// Validate requirements
console.log('\n✅ Requirements Validation:');

// Requirement 2.1: Inter font family as primary typeface
const hasInterFont = designSystem.typography.fontFamily.includes('Inter');
console.log('- ✓ Inter font family:', hasInterFont ? 'PASS' : 'FAIL');

// Requirement 2.2: Defined font sizes for headings
const hasHeadingSizes = 
  designSystem.typography.headings.h1.fontSize === '24px' &&
  designSystem.typography.headings.h2.fontSize === '20px' &&
  designSystem.typography.headings.h3.fontSize === '18px';
console.log('- ✓ Heading font sizes (h1: 24px, h2: 20px, h3: 18px):', hasHeadingSizes ? 'PASS' : 'FAIL');

// Requirement 2.3: Body text 14px with 400 font weight
const hasBodyText = 
  designSystem.typography.body.fontSize === '14px' &&
  designSystem.typography.body.fontWeight === '400';
console.log('- ✓ Body text (14px, weight 400):', hasBodyText ? 'PASS' : 'FAIL');

// Requirement 2.4: Font weights for regular (400), medium (500), and bold (700)
const hasFontWeights = 
  designSystem.typography.fontWeights.regular === 400 &&
  designSystem.typography.fontWeights.medium === 500 &&
  designSystem.typography.fontWeights.bold === 700;
console.log('- ✓ Font weights (400, 500, 700):', hasFontWeights ? 'PASS' : 'FAIL');

// Check line heights are included
const hasLineHeights = 
  designSystem.typography.headings.h1.lineHeight &&
  designSystem.typography.headings.h2.lineHeight &&
  designSystem.typography.headings.h3.lineHeight &&
  designSystem.typography.body.lineHeight;
console.log('- ✓ Line heights defined:', hasLineHeights ? 'PASS' : 'FAIL');

console.log('\n🎉 Typography integration validation complete!');

// Summary
const allPassed = hasInterFont && hasHeadingSizes && hasBodyText && hasFontWeights && hasLineHeights;
console.log('\n📊 Summary:', allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌');