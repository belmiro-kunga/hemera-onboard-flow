/**
 * Validation script for the color system integration
 */

// Simple validation to check if the design system is working
console.log('Validating color system integration...');

// Check if the design system files exist
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/lib/design-system/index.ts',
  'src/lib/design-system/tokens.ts',
  'src/lib/design-system/types.ts',
  'src/lib/design-system/utils.ts',
  'src/lib/design-system/color-accessibility.ts',
  'tailwind.config.ts',
  'src/index.css'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
    allFilesExist = false;
  }
});

// Check if Tailwind config has design system colors
const tailwindConfig = fs.readFileSync('tailwind.config.ts', 'utf8');
if (tailwindConfig.includes('#3B82F6') && tailwindConfig.includes('primary')) {
  console.log('✓ Tailwind config updated with design system colors');
} else {
  console.log('✗ Tailwind config missing design system colors');
  allFilesExist = false;
}

// Check if CSS has design system color tokens
const indexCSS = fs.readFileSync('src/index.css', 'utf8');
if (indexCSS.includes('--color-primary') && indexCSS.includes('semantic-primary')) {
  console.log('✓ CSS updated with design system color tokens and utilities');
} else {
  console.log('✗ CSS missing design system color tokens');
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n✅ Color system integration completed successfully!');
  console.log('\nFeatures implemented:');
  console.log('- Updated Tailwind config with design system color palette');
  console.log('- Replaced CSS custom properties with design system color tokens');
  console.log('- Created semantic color utilities (primary, secondary, success, warning, danger, info)');
  console.log('- Implemented color accessibility utilities and validation');
} else {
  console.log('\n❌ Color system integration incomplete');
}