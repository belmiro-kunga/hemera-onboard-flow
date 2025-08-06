/**
 * Task 6 Validation Script
 * 
 * This script validates that the chart and visualization styling system
 * has been properly implemented according to requirement 5.5.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Validating Task 6: Chart and Visualization Styling Implementation');
console.log('=' .repeat(70));

let allTestsPassed = true;
const results = [];

function validateTest(testName, condition, details = '') {
  const passed = condition;
  results.push({ testName, passed, details });
  
  if (passed) {
    console.log(`✅ ${testName}`);
  } else {
    console.log(`❌ ${testName}`);
    if (details) console.log(`   ${details}`);
    allTestsPassed = false;
  }
}

// Test 1: Verify chart tokens exist in design system
console.log('\n📋 Testing Chart Tokens in Design System...');
try {
  const tokensPath = path.join(__dirname, 'src/lib/design-system/tokens.ts');
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  validateTest(
    'Chart line colors defined',
    tokensContent.includes('line: {') && tokensContent.includes('colors: ['),
    'Chart line colors should be defined in components.chart.line.colors'
  );
  
  validateTest(
    'Chart fill colors defined',
    tokensContent.includes('fillColors: ['),
    'Chart fill colors should be defined in components.chart.line.fillColors'
  );
  
  validateTest(
    'Chart point radius defined',
    tokensContent.includes('pointRadius:'),
    'Chart point radius should be defined in components.chart.line.pointRadius'
  );
  
  validateTest(
    'Donut chart colors defined',
    tokensContent.includes('donut: {') && tokensContent.includes('colors: ['),
    'Donut chart colors should be defined in components.chart.donut.colors'
  );
  
} catch (error) {
  validateTest('Design system tokens file exists', false, error.message);
}

// Test 2: Verify CSS custom properties for charts
console.log('\n🎨 Testing Chart CSS Custom Properties...');
try {
  const cssPath = path.join(__dirname, 'src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  validateTest(
    'Chart line color variables defined',
    cssContent.includes('--chart-line-color-1:') && 
    cssContent.includes('--chart-line-color-2:') &&
    cssContent.includes('--chart-line-color-3:'),
    'Chart line color CSS variables should be defined'
  );
  
  validateTest(
    'Chart fill color variables defined',
    cssContent.includes('--chart-fill-color-1:') && 
    cssContent.includes('--chart-fill-color-2:') &&
    cssContent.includes('--chart-fill-color-3:'),
    'Chart fill color CSS variables should be defined'
  );
  
  validateTest(
    'Chart point radius variable defined',
    cssContent.includes('--chart-point-radius:'),
    'Chart point radius CSS variable should be defined'
  );
  
  validateTest(
    'Donut chart color variables defined',
    cssContent.includes('--chart-donut-color-1:') && 
    cssContent.includes('--chart-donut-color-2:') &&
    cssContent.includes('--chart-donut-color-3:'),
    'Donut chart color CSS variables should be defined'
  );
  
} catch (error) {
  validateTest('CSS file exists', false, error.message);
}

// Test 3: Verify chart utility classes
console.log('\n🛠️ Testing Chart Utility Classes...');
try {
  const cssPath = path.join(__dirname, 'src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  validateTest(
    'Chart line utility classes defined',
    cssContent.includes('.ds-chart-line-1') && 
    cssContent.includes('.ds-chart-line-2') &&
    cssContent.includes('.ds-chart-line-3'),
    'Chart line utility classes should be defined'
  );
  
  validateTest(
    'Chart fill utility classes defined',
    cssContent.includes('.ds-chart-fill-1') && 
    cssContent.includes('.ds-chart-fill-2') &&
    cssContent.includes('.ds-chart-fill-3'),
    'Chart fill utility classes should be defined'
  );
  
  validateTest(
    'Chart point utility class defined',
    cssContent.includes('.ds-chart-point'),
    'Chart point utility class should be defined'
  );
  
  validateTest(
    'Donut chart utility classes defined',
    cssContent.includes('.ds-chart-donut-1') && 
    cssContent.includes('.ds-chart-donut-2') &&
    cssContent.includes('.ds-chart-donut-3'),
    'Donut chart utility classes should be defined'
  );
  
  validateTest(
    'Chart container utility class defined',
    cssContent.includes('.ds-chart-container'),
    'Chart container utility class should be defined'
  );
  
  validateTest(
    'Chart legend utility classes defined',
    cssContent.includes('.ds-chart-legend') && cssContent.includes('.ds-chart-legend-item'),
    'Chart legend utility classes should be defined'
  );
  
  validateTest(
    'Chart tooltip utility class defined',
    cssContent.includes('.ds-chart-tooltip'),
    'Chart tooltip utility class should be defined'
  );
  
} catch (error) {
  validateTest('CSS utility classes check failed', false, error.message);
}

// Test 4: Verify Tailwind configuration extensions
console.log('\n⚙️ Testing Tailwind Configuration...');
try {
  const tailwindPath = path.join(__dirname, 'tailwind.config.ts');
  const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');
  
  validateTest(
    'Chart colors in backgroundColor',
    tailwindContent.includes("'ds-chart-fill-1'") && 
    tailwindContent.includes("'ds-chart-donut-1'"),
    'Chart colors should be added to Tailwind backgroundColor'
  );
  
  validateTest(
    'Chart colors in borderColor',
    tailwindContent.includes("'ds-chart-line-1'") && 
    tailwindContent.includes("'ds-chart-line-2'"),
    'Chart line colors should be added to Tailwind borderColor'
  );
  
} catch (error) {
  validateTest('Tailwind configuration check failed', false, error.message);
}

// Test 5: Verify chart utilities file
console.log('\n🔧 Testing Chart Utilities...');
try {
  const chartUtilsPath = path.join(__dirname, 'src/lib/design-system/chart-utils.ts');
  const chartUtilsContent = fs.readFileSync(chartUtilsPath, 'utf8');
  
  validateTest(
    'Chart utilities file exists',
    fs.existsSync(chartUtilsPath),
    'Chart utilities file should exist'
  );
  
  validateTest(
    'Chart color getter functions defined',
    chartUtilsContent.includes('getChartLineColors') && 
    chartUtilsContent.includes('getChartFillColors') &&
    chartUtilsContent.includes('getDonutChartColors'),
    'Chart color getter functions should be defined'
  );
  
  validateTest(
    'Chart theme creation function defined',
    chartUtilsContent.includes('createChartTheme'),
    'Chart theme creation function should be defined'
  );
  
  validateTest(
    'Chart configuration function defined',
    chartUtilsContent.includes('createChartConfig'),
    'Chart configuration function should be defined'
  );
  
  validateTest(
    'Chart legend generation function defined',
    chartUtilsContent.includes('generateChartLegend'),
    'Chart legend generation function should be defined'
  );
  
} catch (error) {
  validateTest('Chart utilities file check failed', false, error.message);
}

// Test 6: Verify chart utilities are exported
console.log('\n📤 Testing Chart Utilities Export...');
try {
  const indexPath = path.join(__dirname, 'src/lib/design-system/index.ts');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  validateTest(
    'Chart utilities exported from main index',
    indexContent.includes('getChartLineColors') && 
    indexContent.includes('createChartTheme') &&
    indexContent.includes('generateChartLegend'),
    'Chart utilities should be exported from main design system index'
  );
  
  validateTest(
    'ChartTheme type exported',
    indexContent.includes('ChartTheme'),
    'ChartTheme type should be exported'
  );
  
} catch (error) {
  validateTest('Chart utilities export check failed', false, error.message);
}

// Test 7: Verify chart theming utilities
console.log('\n🎭 Testing Chart Theming Utilities...');
try {
  const cssPath = path.join(__dirname, 'src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  validateTest(
    'Chart theme classes defined',
    cssContent.includes('.chart-theme-primary') && 
    cssContent.includes('.chart-theme-success') &&
    cssContent.includes('.chart-theme-warning') &&
    cssContent.includes('.chart-theme-danger'),
    'Chart theme utility classes should be defined'
  );
  
} catch (error) {
  validateTest('Chart theming utilities check failed', false, error.message);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(70));

const passedTests = results.filter(r => r.passed).length;
const totalTests = results.length;

console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);

if (!allTestsPassed) {
  console.log('\n❌ Failed Tests:');
  results.filter(r => !r.passed).forEach(result => {
    console.log(`   • ${result.testName}`);
    if (result.details) console.log(`     ${result.details}`);
  });
}

console.log('\n🎯 Task 6 Implementation Status:');
if (allTestsPassed) {
  console.log('✅ COMPLETE - All chart and visualization styling requirements implemented');
  console.log('\n📋 Implemented Features:');
  console.log('   • Chart styling tokens for line charts (colors, fill, point radius)');
  console.log('   • Donut chart color palette system');
  console.log('   • Chart component utilities and CSS custom properties');
  console.log('   • Chart theming utilities for consistent visualization styling');
  console.log('   • TypeScript utilities for accessing chart tokens');
  console.log('   • Tailwind CSS integration for chart colors');
  console.log('   • Chart legend and tooltip styling utilities');
} else {
  console.log('❌ INCOMPLETE - Some requirements still need implementation');
}

console.log('\n' + '='.repeat(70));

process.exit(allTestsPassed ? 0 : 1);