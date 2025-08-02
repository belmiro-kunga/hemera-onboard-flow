// Migration test and runner script

import { runDatabaseMigrations, getDatabaseMigrationStatus } from './migration-runner';
import { checkDatabaseConnection } from './database';
import { logger } from './database-utils';

async function runMigrationTest(): Promise<boolean> {
  console.log('🔄 Starting database migration process...');
  
  try {
    // 1. Check database connection
    console.log('🔌 Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed');
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // 2. Get current migration status
    console.log('📊 Checking current migration status...');
    try {
      const statusBefore = await getDatabaseMigrationStatus();
      console.log(`📋 Current status: ${statusBefore.appliedMigrations}/${statusBefore.totalMigrations} migrations applied`);
      
      if (statusBefore.pendingMigrations > 0) {
        console.log(`🔄 ${statusBefore.pendingMigrations} pending migrations to apply`);
      } else {
        console.log('✅ All migrations are already applied');
      }
    } catch (error) {
      console.log('ℹ️  Migration table not found - this is normal for first run');
    }
    
    // 3. Run migrations
    console.log('🚀 Running database migrations...');
    const result = await runDatabaseMigrations();
    
    if (!result.success) {
      console.error('❌ Migration process failed:');
      result.errors.forEach(error => console.error(`  - ${error}`));
      return false;
    }
    
    if (result.migrationsApplied === 0) {
      console.log('✅ No new migrations to apply - database is up to date');
    } else {
      console.log(`✅ Successfully applied ${result.migrationsApplied} migrations:`);
      result.appliedMigrations.forEach(migration => {
        console.log(`  ✓ ${migration}`);
      });
    }
    
    // 4. Get final migration status
    console.log('📊 Final migration status:');
    const statusAfter = await getDatabaseMigrationStatus();
    console.log(`  Total migrations: ${statusAfter.totalMigrations}`);
    console.log(`  Applied: ${statusAfter.appliedMigrations}`);
    console.log(`  Pending: ${statusAfter.pendingMigrations}`);
    
    if (statusAfter.lastMigration) {
      console.log(`  Last applied: ${statusAfter.lastMigration} at ${statusAfter.lastAppliedAt}`);
    }
    
    // 5. Verify database structure
    console.log('🔍 Verifying database structure...');
    await verifyDatabaseStructure();
    
    console.log('🎉 Migration process completed successfully!');
    return true;
    
  } catch (error) {
    console.error('💥 Migration process failed with error:', error);
    logger.error('Migration test failed:', error);
    return false;
  }
}

async function verifyDatabaseStructure(): Promise<void> {
  const { sql } = await import('./database');
  
  try {
    // Check if key tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log(`📋 Found ${tableNames.length} tables:`, tableNames.join(', '));
    
    // Check key tables
    const expectedTables = [
      'profiles',
      'video_courses',
      'course_enrollments',
      'course_assignments',
      'simulados',
      'notifications',
      'schema_migrations'
    ];
    
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.warn('⚠️  Missing expected tables:', missingTables.join(', '));
    } else {
      console.log('✅ All expected tables are present');
    }
    
    // Check if auth schema exists
    const authTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auth' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log(`🔐 Auth schema has ${authTables.length} tables`);
    
    // Check if key functions exist
    const functions = await sql`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION'
      ORDER BY routine_name
    `;
    
    const functionNames = functions.map(f => f.routine_name);
    console.log(`⚙️  Found ${functionNames.length} functions:`, functionNames.slice(0, 5).join(', ') + (functionNames.length > 5 ? '...' : ''));
    
    // Test a key function
    try {
      await sql`SELECT auth.uid()`;
      console.log('✅ Auth functions are working');
    } catch (error) {
      console.warn('⚠️  Auth functions may not be working properly:', error);
    }
    
  } catch (error) {
    console.error('❌ Database structure verification failed:', error);
    throw error;
  }
}

// Run migration test if this file is executed directly
if (require.main === module) {
  runMigrationTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Migration test execution error:', error);
      process.exit(1);
    });
}

export { runMigrationTest };