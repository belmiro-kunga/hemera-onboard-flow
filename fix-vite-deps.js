#!/usr/bin/env node

/**
 * Script para corrigir problemas de dependências do Vite
 * Este script limpa o cache do Vite e força a reotimização das dependências
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixViteDeps() {
  console.log('🔧 Corrigindo dependências do Vite...');

  try {
    // 1. Remover cache do Vite
    const viteCacheDir = path.join(__dirname, 'node_modules', '.vite');
    try {
      await fs.rm(viteCacheDir, { recursive: true, force: true });
      console.log('✅ Cache do Vite removido');
    } catch (error) {
      console.log('ℹ️  Cache do Vite não encontrado (normal)');
    }

    // 2. Remover dist se existir
    const distDir = path.join(__dirname, 'dist');
    try {
      await fs.rm(distDir, { recursive: true, force: true });
      console.log('✅ Diretório dist removido');
    } catch (error) {
      console.log('ℹ️  Diretório dist não encontrado (normal)');
    }

    // 3. Verificar se as dependências críticas estão instaladas
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    const criticalDeps = ['postgres', 'dotenv', 'bcryptjs', 'jsonwebtoken'];
    const missingDeps = [];
    
    for (const dep of criticalDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length > 0) {
      console.log('⚠️  Dependências faltando:', missingDeps.join(', '));
    } else {
      console.log('✅ Todas as dependências críticas estão presentes');
    }

    // 4. Criar arquivo de configuração do Vite otimizado
    const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'postgres',
      'dotenv',
      'bcryptjs', 
      'jsonwebtoken',
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ],
    force: true
  },
  server: {
    port: 8080,
    host: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})`;

    await fs.writeFile(path.join(__dirname, 'vite.config.ts'), viteConfigContent);
    console.log('✅ Configuração do Vite atualizada');

    console.log('\n🎉 Correção concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Pare o servidor de desenvolvimento (Ctrl+C)');
    console.log('2. Execute: npm install');
    console.log('3. Execute: npm run dev');
    console.log('\nOu execute tudo de uma vez:');
    console.log('npm install && npm run dev');

  } catch (error) {
    console.error('❌ Erro ao corrigir dependências:', error.message);
    process.exit(1);
  }
}

fixViteDeps();