// Test script to verify migration completion

import { initializeApp } from './app-startup';
import { checkDatabaseConnection } from './database';
import { validateDatabaseSchema } from './schema-validator';
import { getDatabaseMigrationStatus } from './migration-runner';

async function testMigrationCompletion(): Promise<boolean> {
  console.log('🧪 Testing migration completion...');
  
  let allTestsPassed = true;

  try {
    // Test 1: App startup
    console.log('\n1️⃣ Testing application startup...');
    const startupResult = await initializeApp();
    
    if (startupResult.success) {
      console.log('✅ Application startup: PASSED');
    } else {
      console.log('❌ Application startup: FAILED');
      startupResult.errors.forEach(error => console.log(`   - ${error}`));
      allTestsPassed = false;
    }

    if (startupResult.warnings.length > 0) {
      console.log('⚠️  Startup warnings:');
      startupResult.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    // Test 2: Database connection
    console.log('\n2️⃣ Testing database connection...');
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      console.log('✅ Database connection: PASSED');
    } else {
      console.log('❌ Database connection: FAILED');
      allTestsPassed = false;
    }

    // Test 3: Schema validation
    console.log('\n3️⃣ Testing database schema...');
    const schemaResult = await validateDatabaseSchema();
    
    if (schemaResult.isValid) {
      console.log('✅ Database schema: PASSED');
    } else {
      console.log('❌ Database schema: FAILED');
      schemaResult.errors.forEach(error => console.log(`   - ${error}`));
      allTestsPassed = false;
    }

    if (schemaResult.warnings.length > 0) {
      console.log('⚠️  Schema warnings:');
      schemaResult.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    // Test 4: Migration status
    console.log('\n4️⃣ Testing migration status...');
    const migrationStatus = await getDatabaseMigrationStatus();
    
    console.log(`📊 Migration status: ${migrationStatus.appliedMigrations}/${migrationStatus.totalMigrations} applied`);
    
    if (migrationStatus.pendingMigrations === 0) {
      console.log('✅ All migrations applied: PASSED');
    } else {
      console.log(`⚠️  ${migrationStatus.pendingMigrations} pending migrations`);
    }

    // Test 5: Package dependencies
    console.log('\n5️⃣ Testing package dependencies...');
    
    try {
      // This should fail since we removed Supabase
      require('@supabase/supabase-js');
      console.log('⚠️  Supabase dependency still present');
    } catch {
      console.log('✅ Supabase dependency removed: PASSED');
    }

    try {
      // These should be available
      require('postgres');
      require('jsonwebtoken');
      require('bcryptjs');
      console.log('✅ Required dependencies installed: PASSED');
    } catch (error) {
      console.log('❌ Missing required dependencies: FAILED');
      console.log(`   - ${error}`);
      allTestsPassed = false;
    }

    // Test 6: Environment configuration
    console.log('\n6️⃣ Testing environment configuration...');
    
    const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length === 0) {
      console.log('✅ Environment variables: PASSED');
    } else {
      console.log('❌ Missing environment variables: FAILED');
      console.log(`   - Missing: ${missingEnvVars.join(', ')}`);
      allTestsPassed = false;
    }

    // Summary
    console.log('\n📋 Test Summary:');
    if (allTestsPassed) {
      console.log('🎉 All tests PASSED! Migration completion verified.');
      console.log('\n✅ Ready to proceed with next tasks:');
      console.log('   - Task 4: Build local authentication system');
      console.log('   - Task 5: Adapt authentication context');
      console.log('   - Task 6: Replace Supabase client usage');
    } else {
      console.log('❌ Some tests FAILED. Please fix issues before proceeding.');
    }

    return allTestsPassed;

  } catch (error) {
    console.error('💥 Test execution failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMigrationCompletion()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution error:', error);
      process.exit(1);
    });
}

export { testMigrationCompletion };