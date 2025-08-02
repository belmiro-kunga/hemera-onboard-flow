// Database connection test utility

import { checkDatabaseConnection, database } from './database';
import { logger } from './database-utils';
import { validateAllConfigs, getConfigSummary } from './database-config';

export async function testDatabaseConnection(): Promise<boolean> {
  console.log('🔍 Testing database connection...');
  
  // 1. Validate configuration
  console.log('📋 Validating configuration...');
  const configValidation = validateAllConfigs();
  
  if (!configValidation.isValid) {
    console.error('❌ Configuration validation failed:');
    configValidation.errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  
  console.log('✅ Configuration is valid');
  console.log('📊 Configuration summary:', getConfigSummary());
  
  // 2. Test basic connection
  console.log('🔌 Testing basic connection...');
  const isConnected = await checkDatabaseConnection();
  
  if (!isConnected) {
    console.error('❌ Database connection failed');
    return false;
  }
  
  console.log('✅ Database connection successful');
  
  // 3. Test basic query
  console.log('📝 Testing basic query...');
  try {
    const result = await database.query('SELECT version() as version, now() as current_time');
    
    if (result.error) {
      console.error('❌ Basic query failed:', result.error);
      return false;
    }
    
    console.log('✅ Basic query successful');
    console.log('📊 Database info:', {
      version: result.data[0]?.version?.split(' ')[0] || 'Unknown',
      currentTime: result.data[0]?.current_time || 'Unknown',
    });
  } catch (error) {
    console.error('❌ Basic query error:', error);
    return false;
  }
  
  // 4. Test auth schema
  console.log('🔐 Testing auth schema...');
  try {
    const result = await database.query('SELECT count(*) as count FROM auth.users');
    
    if (result.error) {
      console.error('❌ Auth schema test failed:', result.error);
      return false;
    }
    
    console.log('✅ Auth schema accessible');
    console.log('👥 Users count:', result.data[0]?.count || 0);
  } catch (error) {
    console.error('❌ Auth schema error:', error);
    return false;
  }
  
  // 5. Test auth functions
  console.log('⚙️  Testing auth functions...');
  try {
    const result = await database.query('SELECT auth.uid() as current_user_id');
    
    if (result.error) {
      console.error('❌ Auth function test failed:', result.error);
      return false;
    }
    
    console.log('✅ Auth functions working');
    console.log('🆔 Current user ID:', result.data[0]?.current_user_id || 'null');
  } catch (error) {
    console.error('❌ Auth function error:', error);
    return false;
  }
  
  // 6. Test RLS policies (if any tables exist)
  console.log('🛡️  Testing table access...');
  try {
    const result = await database.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      LIMIT 5
    `);
    
    if (result.error) {
      console.error('❌ Table access test failed:', result.error);
      return false;
    }
    
    console.log('✅ Table access working');
    console.log('📋 Available tables:', result.data.map(row => row.table_name));
  } catch (error) {
    console.error('❌ Table access error:', error);
    return false;
  }
  
  // 7. Test query builder
  console.log('🔧 Testing query builder...');
  try {
    const result = await database
      .from('auth.users')
      .select('count(*) as total')
      .select_query();
    
    if (result.error) {
      console.error('❌ Query builder test failed:', result.error);
      return false;
    }
    
    console.log('✅ Query builder working');
    console.log('📊 Query result:', result.data[0]);
  } catch (error) {
    console.error('❌ Query builder error:', error);
    return false;
  }
  
  console.log('🎉 All database tests passed!');
  return true;
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution error:', error);
      process.exit(1);
    });
}