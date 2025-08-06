/**
 * Validação das Correções Críticas do Design System
 * 
 * Este script valida que as correções críticas foram implementadas corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Validando Correções Críticas do Design System');
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

// Test 1: Verificar Color Scales Completas
console.log('\n🎨 Testando Color Scales Completas...');
try {
  const tokensPath = path.join(__dirname, 'src/lib/design-system/tokens.ts');
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  validateTest(
    'Primary color scale (50-900) definida',
    tokensContent.includes('primaryScale: {') && 
    tokensContent.includes('50: "#EBF8FF"') &&
    tokensContent.includes('900: "#1E3A8A"'),
    'Escala completa de cores primárias deve estar definida'
  );
  
  validateTest(
    'Secondary color scale (50-900) definida',
    tokensContent.includes('secondaryScale: {') && 
    tokensContent.includes('50: "#F8FAFC"') &&
    tokensContent.includes('900: "#0F172A"'),
    'Escala completa de cores secundárias deve estar definida'
  );
  
  validateTest(
    'Success color scale (50-900) definida',
    tokensContent.includes('successScale: {') && 
    tokensContent.includes('50: "#D1FAE5"') &&
    tokensContent.includes('900: "#064E3B"'),
    'Escala completa de cores de sucesso deve estar definida'
  );
  
  validateTest(
    'Warning color scale (50-900) definida',
    tokensContent.includes('warningScale: {') && 
    tokensContent.includes('50: "#FEF3C7"') &&
    tokensContent.includes('900: "#78350F"'),
    'Escala completa de cores de aviso deve estar definida'
  );
  
  validateTest(
    'Danger color scale (50-900) definida',
    tokensContent.includes('dangerScale: {') && 
    tokensContent.includes('50: "#FEE2E2"') &&
    tokensContent.includes('900: "#7F1D1D"'),
    'Escala completa de cores de perigo deve estar definida'
  );
  
  validateTest(
    'Accent color scale (50-900) definida',
    tokensContent.includes('accentScale: {') && 
    tokensContent.includes('50: "#F3E8FF"') &&
    tokensContent.includes('900: "#4C1D95"'),
    'Escala completa de cores de destaque deve estar definida'
  );
  
} catch (error) {
  validateTest('Arquivo de tokens existe', false, error.message);
}

// Test 2: Verificar Typography Expandida
console.log('\n📝 Testando Typography Expandida...');
try {
  const tokensPath = path.join(__dirname, 'src/lib/design-system/tokens.ts');
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  validateTest(
    'Todos os headings (h1-h6) definidos',
    tokensContent.includes('h1: { fontSize: "32px"') &&
    tokensContent.includes('h2: { fontSize: "24px"') &&
    tokensContent.includes('h3: { fontSize: "20px"') &&
    tokensContent.includes('h4: { fontSize: "18px"') &&
    tokensContent.includes('h5: { fontSize: "16px"') &&
    tokensContent.includes('h6: { fontSize: "14px"'),
    'Todos os níveis de heading devem estar definidos'
  );
  
  validateTest(
    'Font weights expandidos',
    tokensContent.includes('semibold: 600') &&
    tokensContent.includes('extrabold: 800'),
    'Novos pesos de fonte devem estar definidos'
  );
  
  validateTest(
    'Small e caption text definidos',
    tokensContent.includes('small: { fontSize: "12px"') &&
    tokensContent.includes('caption: { fontSize: "11px"'),
    'Estilos de texto pequeno devem estar definidos'
  );
  
} catch (error) {
  validateTest('Typography expandida check failed', false, error.message);
}

// Test 3: Verificar Spacing Expandido
console.log('\n📏 Testando Spacing Expandido...');
try {
  const tokensPath = path.join(__dirname, 'src/lib/design-system/tokens.ts');
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  validateTest(
    'Spacing scale expandida (2xs-4xl)',
    tokensContent.includes('"2xs": "2px"') &&
    tokensContent.includes('"2xl": "48px"') &&
    tokensContent.includes('"3xl": "64px"') &&
    tokensContent.includes('"4xl": "96px"'),
    'Escala de spacing expandida deve estar definida'
  );
  
} catch (error) {
  validateTest('Spacing expandido check failed', false, error.message);
}

// Test 4: Verificar Estados dos Componentes
console.log('\n🎛️ Testando Estados dos Componentes...');
try {
  const tokensPath = path.join(__dirname, 'src/lib/design-system/tokens.ts');
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  validateTest(
    'Estados do botão primário definidos',
    tokensContent.includes('hover: {') &&
    tokensContent.includes('active: {') &&
    tokensContent.includes('focus: {') &&
    tokensContent.includes('disabled: {'),
    'Estados hover, active, focus e disabled devem estar definidos'
  );
  
  validateTest(
    'Estados hover com transform e shadow',
    tokensContent.includes('transform: "translateY(-1px)"') &&
    tokensContent.includes('shadow: "0 4px 8px rgba(59, 130, 246, 0.3)"'),
    'Estados hover devem incluir transformações e sombras'
  );
  
  validateTest(
    'Estados disabled com cursor not-allowed',
    tokensContent.includes('cursor: "not-allowed"'),
    'Estados disabled devem incluir cursor apropriado'
  );
  
} catch (error) {
  validateTest('Estados dos componentes check failed', false, error.message);
}

// Test 5: Verificar Animation Tokens
console.log('\n⚡ Testando Animation Tokens...');
try {
  const tokensPath = path.join(__dirname, 'src/lib/design-system/tokens.ts');
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  validateTest(
    'Animation duration tokens definidos',
    tokensContent.includes('duration: {') &&
    tokensContent.includes('fast: "150ms"') &&
    tokensContent.includes('normal: "200ms"') &&
    tokensContent.includes('slow: "300ms"') &&
    tokensContent.includes('slower: "500ms"'),
    'Tokens de duração de animação devem estar definidos'
  );
  
  validateTest(
    'Animation easing tokens definidos',
    tokensContent.includes('easing: {') &&
    tokensContent.includes('linear: "linear"') &&
    tokensContent.includes('easeIn: "cubic-bezier(0.4, 0, 1, 1)"') &&
    tokensContent.includes('easeOut: "cubic-bezier(0, 0, 0.2, 1)"') &&
    tokensContent.includes('easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"'),
    'Tokens de easing de animação devem estar definidos'
  );
  
  validateTest(
    'Animation delay tokens definidos',
    tokensContent.includes('delay: {') &&
    tokensContent.includes('none: "0ms"') &&
    tokensContent.includes('short: "100ms"') &&
    tokensContent.includes('medium: "200ms"') &&
    tokensContent.includes('long: "500ms"'),
    'Tokens de delay de animação devem estar definidos'
  );
  
} catch (error) {
  validateTest('Animation tokens check failed', false, error.message);
}

// Test 6: Verificar CSS Atualizado
console.log('\n🎨 Testando CSS Atualizado...');
try {
  const cssPath = path.join(__dirname, 'src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  validateTest(
    'Novos headings no CSS (h4, h5, h6)',
    cssContent.includes('--heading-4-font-size: 18px') &&
    cssContent.includes('--heading-5-font-size: 16px') &&
    cssContent.includes('--heading-6-font-size: 14px'),
    'Novos tokens de heading devem estar no CSS'
  );
  
  validateTest(
    'Utility classes para novos headings',
    cssContent.includes('.heading-4 {') &&
    cssContent.includes('.heading-5 {') &&
    cssContent.includes('.heading-6 {'),
    'Classes utilitárias para novos headings devem existir'
  );
  
  validateTest(
    'Small e caption utility classes',
    cssContent.includes('.small-text {') &&
    cssContent.includes('.caption-text {'),
    'Classes utilitárias para texto pequeno devem existir'
  );
  
  validateTest(
    'HTML elements mapeados (h4, h5, h6)',
    cssContent.includes('h4 {') &&
    cssContent.includes('h5 {') &&
    cssContent.includes('h6 {') &&
    cssContent.includes('small {'),
    'Elementos HTML devem estar mapeados para as classes'
  );
  
} catch (error) {
  validateTest('CSS atualizado check failed', false, error.message);
}

// Test 7: Verificar Tailwind Config Atualizado
console.log('\n⚙️ Testando Tailwind Config Atualizado...');
try {
  const tailwindPath = path.join(__dirname, 'tailwind.config.ts');
  const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');
  
  validateTest(
    'Spacing expandido no Tailwind',
    tailwindContent.includes("'ds-2xs': designSystem.spacing[\"2xs\"]") &&
    tailwindContent.includes("'ds-2xl': designSystem.spacing[\"2xl\"]") &&
    tailwindContent.includes("'ds-3xl': designSystem.spacing[\"3xl\"]") &&
    tailwindContent.includes("'ds-4xl': designSystem.spacing[\"4xl\"]"),
    'Spacing expandido deve estar no Tailwind config'
  );
  
  validateTest(
    'Typography expandida no Tailwind',
    tailwindContent.includes("'heading-4': ['18px'") &&
    tailwindContent.includes("'heading-5': ['16px'") &&
    tailwindContent.includes("'heading-6': ['14px'") &&
    tailwindContent.includes("'small': ['12px'") &&
    tailwindContent.includes("'caption': ['11px'"),
    'Typography expandida deve estar no Tailwind config'
  );
  
  validateTest(
    'Color scales completas no Tailwind',
    tailwindContent.includes('designSystem.colors.primaryScale[50]') &&
    tailwindContent.includes('designSystem.colors.primaryScale[900]') &&
    tailwindContent.includes('designSystem.colors.secondaryScale[50]') &&
    tailwindContent.includes('designSystem.colors.successScale[900]'),
    'Color scales completas devem estar no Tailwind config'
  );
  
} catch (error) {
  validateTest('Tailwind config atualizado check failed', false, error.message);
}

// Test 8: Verificar Types Atualizados
console.log('\n📋 Testando Types Atualizados...');
try {
  const typesPath = path.join(__dirname, 'src/lib/design-system/types.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  validateTest(
    'ColorScale interface definida',
    typesContent.includes('export interface ColorScale {') &&
    typesContent.includes('50: string;') &&
    typesContent.includes('900: string;'),
    'Interface ColorScale deve estar definida'
  );
  
  validateTest(
    'ComponentState interface definida',
    typesContent.includes('export interface ComponentState {') &&
    typesContent.includes('background?: string;') &&
    typesContent.includes('transform?: string;') &&
    typesContent.includes('cursor?: string;'),
    'Interface ComponentState deve estar definida'
  );
  
  validateTest(
    'AnimationTokens interface definida',
    typesContent.includes('export interface AnimationTokens {') &&
    typesContent.includes('duration: {') &&
    typesContent.includes('easing: {') &&
    typesContent.includes('delay: {'),
    'Interface AnimationTokens deve estar definida'
  );
  
  validateTest(
    'Typography expandida nos types',
    typesContent.includes('h4: { fontSize: string;') &&
    typesContent.includes('h5: { fontSize: string;') &&
    typesContent.includes('h6: { fontSize: string;') &&
    typesContent.includes('small: { fontSize: string;') &&
    typesContent.includes('caption: { fontSize: string;'),
    'Typography expandida deve estar nos types'
  );
  
} catch (error) {
  validateTest('Types atualizados check failed', false, error.message);
}

// Test 9: Verificar Utils Atualizados
console.log('\n🔧 Testando Utils Atualizados...');
try {
  const utilsPath = path.join(__dirname, 'src/lib/design-system/utils.ts');
  const utilsContent = fs.readFileSync(utilsPath, 'utf8');
  
  validateTest(
    'getColorScale function definida',
    utilsContent.includes('export function getColorScale(') &&
    utilsContent.includes("'primaryScale' | 'secondaryScale'") &&
    utilsContent.includes('shade: 50 | 100 | 200'),
    'Função getColorScale deve estar definida'
  );
  
  validateTest(
    'getAnimation function definida',
    utilsContent.includes('export function getAnimation(') &&
    utilsContent.includes("'duration' | 'easing' | 'delay'"),
    'Função getAnimation deve estar definida'
  );
  
  validateTest(
    'getHeadingStyle expandido',
    utilsContent.includes("'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'"),
    'getHeadingStyle deve suportar todos os headings'
  );
  
} catch (error) {
  validateTest('Utils atualizados check failed', false, error.message);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 RESUMO DA VALIDAÇÃO');
console.log('='.repeat(70));

const passedTests = results.filter(r => r.passed).length;
const totalTests = results.length;

console.log(`✅ Passou: ${passedTests}/${totalTests} testes`);

if (!allTestsPassed) {
  console.log('\n❌ Testes Falharam:');
  results.filter(r => !r.passed).forEach(result => {
    console.log(`   • ${result.testName}`);
    if (result.details) console.log(`     ${result.details}`);
  });
}

console.log('\n🎯 Status das Correções Críticas:');
if (allTestsPassed) {
  console.log('✅ COMPLETAS - Todas as correções críticas foram implementadas com sucesso');
  console.log('\n📋 Correções Implementadas:');
  console.log('   🎨 Color scales completas (50-900) para todas as cores semânticas');
  console.log('   📝 Typography expandida com h4, h5, h6, small, caption');
  console.log('   📏 Spacing scale expandido (2xs, 2xl, 3xl, 4xl)');
  console.log('   🎛️ Estados dos componentes (hover, active, focus, disabled)');
  console.log('   ⚡ Animation tokens (duration, easing, delay)');
  console.log('   🔧 Utilities atualizadas para suportar novos tokens');
  console.log('   🎨 CSS e Tailwind config completamente atualizados');
  console.log('   📋 TypeScript types expandidos e validados');
} else {
  console.log('❌ INCOMPLETAS - Algumas correções ainda precisam ser finalizadas');
}

console.log('\n' + '='.repeat(70));

process.exit(allTestsPassed ? 0 : 1);