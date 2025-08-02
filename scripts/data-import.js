#!/usr/bin/env node

/**
 * Data Import Script for Hemera Project
 * This script imports data from exported files to local PostgreSQL database
 */

import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configuration
const IMPORT_DIR = path.join(__dirname, '..', 'data-export');
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hemera_db',
  username: process.env.DB_USER || 'hemera_user',
  password: process.env.DB_PASSWORD || 'hemera_password',
};

// Import order (respecting foreign key dependencies)
const IMPORT_ORDER = [
  'departments',
  'auth_users',
  'profiles',
  'video_courses',
  'video_lessons',
  'simulados',
  'questoes',
  'opcoes_resposta',
  'course_enrollments',
  'lesson_progress',
  'assignment_templates',
  'template_courses',
  'course_assignments',
  'assignment_notifications',
  'badges',
  'user_levels',
  'user_badges',
  'user_points',
  'course_certificates',
  'simulado_certificates',
  'simulado_attempts',
  'simulado_answers',
  'company_presentation',
  'organizational_chart',
  'site_settings',
  'email_templates',
  'email_queue',
  'email_logs',
  'presentation_views'
];

class DataImporter {
  constructor() {
    this.sql = postgres(DB_CONFIG);
    this.importStats = {
      totalFiles: 0,
      importedFiles: 0,
      totalRecords: 0,
      importedRecords: 0,
      errors: [],
      skipped: []
    };
  }

  async checkDatabaseConnection() {
    try {
      await this.sql`SELECT 1`;
      console.log('✅ Database connection established');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('💡 Make sure PostgreSQL is running: npm run db:start');
      return false;
    }
  }

  async loadManifest() {
    try {
      const manifestPath = path.join(IMPORT_DIR, 'manifest.json');
      const content = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(content);
      
      console.log('📋 Loaded export manifest');
      console.log(`   - Exported at: ${manifest.exportedAt}`);
      console.log(`   - Total files: ${manifest.files.length}`);
      console.log(`   - Total records: ${manifest.totalRecords}`);
      
      return manifest;
    } catch (error) {
      console.error('❌ Could not load manifest:', error.message);
      console.error('💡 Make sure you have exported data first: npm run data:export');
      throw error;
    }
  }

  async tableExists(tableName) {
    try {
      const result = await this.sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `;
      return result[0].exists;
    } catch (error) {
      console.warn(`⚠️  Could not check if table ${tableName} exists:`, error.message);
      return false;
    }
  }

  async getTableColumns(tableName) {
    try {
      const result = await this.sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `;
      return result;
    } catch (error) {
      console.warn(`⚠️  Could not get columns for table ${tableName}:`, error.message);
      return [];
    }
  }

  async importTable(fileName) {
    const tableName = fileName.replace('.json', '').replace('_', '.');
    const actualTableName = fileName.replace('.json', '');
    
    try {
      console.log(`📋 Importing table: ${tableName}`);
      
      // Check if table exists
      if (!(await this.tableExists(actualTableName))) {
        console.warn(`⚠️  Table ${actualTableName} does not exist, skipping`);
        this.importStats.skipped.push({ table: tableName, reason: 'Table does not exist' });
        return { records: 0, skipped: true };
      }

      // Load data file
      const filePath = path.join(IMPORT_DIR, fileName);
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      if (!data.records || !Array.isArray(data.records)) {
        throw new Error('Invalid data format');
      }

      const records = data.records;
      if (records.length === 0) {
        console.log(`ℹ️  No records to import for ${tableName}`);
        return { records: 0, skipped: false };
      }

      // Get table columns to validate data
      const columns = await this.getTableColumns(actualTableName);
      const columnNames = columns.map(col => col.column_name);

      // Filter records to only include existing columns
      const filteredRecords = records.map(record => {
        const filteredRecord = {};
        for (const [key, value] of Object.entries(record)) {
          if (columnNames.includes(key)) {
            filteredRecord[key] = value;
          }
        }
        return filteredRecord;
      });

      // Handle special cases
      if (actualTableName === 'auth_users') {
        // Import to auth.users table
        await this.importAuthUsers(filteredRecords);
      } else {
        // Regular table import
        await this.importRegularTable(actualTableName, filteredRecords);
      }

      console.log(`✅ Imported ${records.length} records to ${tableName}`);
      return { records: records.length, skipped: false };

    } catch (error) {
      console.error(`❌ Error importing ${tableName}:`, error.message);
      this.importStats.errors.push({ table: tableName, error: error.message });
      return { records: 0, skipped: true };
    }
  }

  async importAuthUsers(records) {
    // Special handling for auth.users table
    for (const record of records) {
      try {
        await this.sql`
          INSERT INTO auth.users ${this.sql(record)}
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = EXCLUDED.updated_at,
            email_confirmed = EXCLUDED.email_confirmed,
            last_sign_in_at = EXCLUDED.last_sign_in_at
        `;
      } catch (error) {
        console.warn(`⚠️  Could not import auth user ${record.id}:`, error.message);
      }
    }
  }

  async importRegularTable(tableName, records) {
    // Batch import for better performance
    const batchSize = 100;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        await this.sql`
          INSERT INTO ${this.sql(tableName)} ${this.sql(batch)}
          ON CONFLICT DO NOTHING
        `;
      } catch (error) {
        // Try individual inserts if batch fails
        console.warn(`⚠️  Batch insert failed for ${tableName}, trying individual inserts`);
        
        for (const record of batch) {
          try {
            await this.sql`
              INSERT INTO ${this.sql(tableName)} ${this.sql(record)}
              ON CONFLICT DO NOTHING
            `;
          } catch (individualError) {
            console.warn(`⚠️  Could not import record to ${tableName}:`, individualError.message);
          }
        }
      }
    }
  }

  async importAllTables() {
    console.log('🚀 Starting data import to local PostgreSQL...');
    
    const manifest = await this.loadManifest();
    this.importStats.totalFiles = manifest.files.length;

    // Import files in dependency order
    for (const tableFile of IMPORT_ORDER) {
      const fileName = `${tableFile}.json`;
      const fileExists = manifest.files.some(f => f.filename === fileName);
      
      if (fileExists) {
        const result = await this.importTable(fileName);
        
        if (!result.skipped) {
          this.importStats.importedFiles++;
          this.importStats.importedRecords += result.records;
        }
      } else {
        console.log(`ℹ️  File ${fileName} not found in export, skipping`);
        this.importStats.skipped.push({ table: tableFile, reason: 'File not found' });
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  async validateImport() {
    console.log('🔍 Validating imported data...');
    
    try {
      // Check some key tables
      const keyTables = ['profiles', 'video_courses', 'course_assignments'];
      
      for (const tableName of keyTables) {
        if (await this.tableExists(tableName)) {
          const result = await this.sql`
            SELECT COUNT(*) as count FROM ${this.sql(tableName)}
          `;
          const count = result[0].count;
          console.log(`✅ ${tableName}: ${count} records`);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  async updateSequences() {
    console.log('🔄 Updating database sequences...');
    
    try {
      // Get all sequences and update them
      const sequences = await this.sql`
        SELECT schemaname, sequencename, tablename, columnname
        FROM pg_sequences s
        JOIN information_schema.columns c ON c.column_default LIKE '%' || s.sequencename || '%'
        WHERE s.schemaname = 'public';
      `;

      for (const seq of sequences) {
        try {
          await this.sql`
            SELECT setval(${seq.sequencename}, 
              COALESCE((SELECT MAX(${this.sql(seq.columnname)}) FROM ${this.sql(seq.tablename)}), 1)
            );
          `;
          console.log(`✅ Updated sequence: ${seq.sequencename}`);
        } catch (error) {
          console.warn(`⚠️  Could not update sequence ${seq.sequencename}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not update sequences:', error.message);
    }
  }

  async printSummary() {
    console.log('\n📊 Import Summary');
    console.log('=================');
    console.log(`✅ Files imported: ${this.importStats.importedFiles}/${this.importStats.totalFiles}`);
    console.log(`📝 Records imported: ${this.importStats.importedRecords}`);
    console.log(`⏭️  Files skipped: ${this.importStats.skipped.length}`);
    
    if (this.importStats.skipped.length > 0) {
      console.log('\n⏭️  Skipped files:');
      this.importStats.skipped.forEach(skip => {
        console.log(`   - ${skip.table}: ${skip.reason}`);
      });
    }
    
    if (this.importStats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${this.importStats.errors.length}`);
      this.importStats.errors.forEach(error => {
        console.log(`   - ${error.table}: ${error.error}`);
      });
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Run database tests: npm run db:test');
    console.log('   2. Start the application: npm run dev');
    console.log('   3. Verify data integrity in the application');
  }

  async close() {
    await this.sql.end();
  }
}

// Main execution
async function main() {
  const importer = new DataImporter();

  try {
    if (!(await importer.checkDatabaseConnection())) {
      process.exit(1);
    }

    await importer.importAllTables();
    await importer.updateSequences();
    await importer.validateImport();
    await importer.printSummary();

    console.log('\n🎉 Data import completed successfully!');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await importer.close();
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DataImporter };