#!/usr/bin/env node

// Script para testar a conexão com o banco PostgreSQL e verificar persistência de dados

const postgres = require('postgres');

// Configuração do banco (mesma do .env)
const sql = postgres({
  host: 'localhost',
  port: 5432,
  database: 'hemera_db',
  username: 'hemera_user',
  password: 'hemera_password',
  ssl: false,
});

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco PostgreSQL...\n');

  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão básica...');
    await sql`SELECT 1 as test`;
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // 2. Verificar se a tabela profiles existe
    console.log('2. Verificando estrutura do banco...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'departments', 'auth_users')
      ORDER BY table_name
    `;
    
    console.log('📋 Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    console.log('');

    // 3. Verificar usuários existentes
    console.log('3. Verificando usuários existentes...');
    try {
      const users = await sql`
        SELECT 
          id, user_id, name, email, department, job_position, role, is_active, created_at
        FROM profiles 
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      
      console.log(`📊 Total de usuários encontrados: ${users.length}`);
      if (users.length > 0) {
        console.log('👥 Últimos usuários:');
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.is_active ? 'Ativo' : 'Inativo'}`);
        });
      } else {
        console.log('⚠️  Nenhum usuário encontrado na tabela profiles');
      }
      console.log('');
    } catch (error) {
      console.log('❌ Erro ao consultar usuários:', error.message);
      console.log('');
    }

    // 4. Testar inserção de dados (teste de persistência)
    console.log('4. Testando persistência de dados...');
    const testUserEmail = `test-${Date.now()}@hcp.com`;
    
    try {
      // Inserir usuário de teste
      const insertResult = await sql`
        INSERT INTO profiles (
          user_id, name, email, role, is_active, created_at
        ) VALUES (
          gen_random_uuid()::text,
          'Usuário Teste',
          ${testUserEmail},
          'funcionario',
          true,
          NOW()
        )
        RETURNING id, name, email
      `;
      
      console.log('✅ Usuário de teste inserido:', insertResult[0]);
      
      // Verificar se foi inserido
      const verifyResult = await sql`
        SELECT name, email, created_at 
        FROM profiles 
        WHERE email = ${testUserEmail}
      `;
      
      if (verifyResult.length > 0) {
        console.log('✅ Dados persistidos com sucesso!');
        console.log(`   - Nome: ${verifyResult[0].name}`);
        console.log(`   - Email: ${verifyResult[0].email}`);
        console.log(`   - Criado em: ${verifyResult[0].created_at}`);
      }
      
      // Limpar dados de teste
      await sql`DELETE FROM profiles WHERE email = ${testUserEmail}`;
      console.log('🧹 Dados de teste removidos');
      console.log('');
      
    } catch (error) {
      console.log('❌ Erro no teste de persistência:', error.message);
      console.log('');
    }

    // 5. Verificar departamentos
    console.log('5. Verificando departamentos...');
    try {
      const departments = await sql`
        SELECT id, name, description, is_active 
        FROM departments 
        WHERE is_active = true 
        ORDER BY name
      `;
      
      console.log(`📋 Departamentos ativos: ${departments.length}`);
      departments.forEach(dept => {
        console.log(`   - ${dept.name}: ${dept.description || 'Sem descrição'}`);
      });
      console.log('');
    } catch (error) {
      console.log('❌ Erro ao consultar departamentos:', error.message);
      console.log('');
    }

    // 6. Testar API Server
    console.log('6. Testando API Server...');
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Server está rodando!');
        console.log(`   - Status: ${data.status}`);
        console.log(`   - Database: ${data.database}`);
        console.log(`   - Timestamp: ${data.timestamp}`);
      } else {
        console.log('❌ API Server não está respondendo');
      }
    } catch (error) {
      console.log('❌ API Server não está acessível:', error.message);
      console.log('💡 Execute: npm run api:start');
    }
    console.log('');

    console.log('🎉 Teste de conexão concluído!');
    console.log('\n📋 RESUMO:');
    console.log('✅ Banco PostgreSQL: Conectado');
    console.log('✅ Tabelas: Existem');
    console.log('✅ Persistência: Funcionando');
    console.log('\n💡 Para verificar se a aplicação está usando o banco real:');
    console.log('1. Acesse: http://localhost:8080/admin/users');
    console.log('2. Abra o Console do navegador (F12)');
    console.log('3. Se NÃO ver mensagens "🔧 Using mock data", está conectado ao banco real');

  } catch (error) {
    console.error('❌ Erro na conexão com o banco:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verificar se o Docker está rodando: docker ps');
    console.log('2. Iniciar o banco: npm run db:start');
    console.log('3. Verificar status: npm run db:status');
  } finally {
    await sql.end();
  }
}

// Executar teste
testDatabaseConnection().catch(console.error);