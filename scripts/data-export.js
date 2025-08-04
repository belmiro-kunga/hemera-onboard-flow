#!/usr/bin/env node

/**
 * Data Export Script for Hemera Project
 * This script exports data from Supabase to local files for migration
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const EXPORT_DIR = path.join(__dirname, '..', 'data-export');

// Tables to export (in dependency order)
const TABLES_TO_EXPORT = [
  'departments',
  'auth.users',
  'profiles',
  'video_courses',
  'video_lessons',
  'simulados',
  'questoes',
  'opcoes_resposta',
  'course_enrollments',
  'lesson_progress',
  'course_assignments',
  'assignment_templates',
  'template_courses',
  'assignment_notifications',
  'user_levels',
  'badges',
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

class DataExporter {
  constructor() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Missing Supabase credentials in environment variables');
      console.error('💡 Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
      process.exit(1);
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.exportStats = {
      totalTables: 0,
      totalRecords: 0,
      exportedTables: 0,
      errors: []
    };
  }

  async ensureExportDirectory() {
    try {
      await fs.mkdir(EXPORT_DIR, { recursive: true });
      console.log(`📁 Export directory ready: ${EXPORT_DIR}`);
    } catch (error) {
      console.error('❌ Failed to create export directory:', error.message);
      throw error;
    }
  }

  async exportTable(tableName) {
    try {
      console.log(`📋 Exporting table: ${tableName}`);
      
      // Handle auth.users table specially
      let query;
      if (tableName === 'auth.users') {
        // Use RPC or direct query for auth schema
        const { data, error } = await this.supabase.rpc('get_auth_users');
        if (error) {
          console.warn(`⚠️  Could not export ${tableName}: ${error.message}`);
          return { records: 0, skipped: true };
        }
        query = { data, error: null };
      } else {
        // Regular table export
        query = await this.supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: true, nullsFirst: false });
      }

      const { data, error } = query;

      if (error) {
        console.warn(`⚠️  Could not export ${tableName}: ${error.message}`);
        this.exportStats.errors.push({ table: tableName, error: error.message });
        return { records: 0, skipped: true };
      }

      const records = data || [];
      const fileName = `${tableName.replace('.', '_')}.json`;
      const filePath = path.join(EXPORT_DIR, fileName);

      // Add metadata
      const exportData = {
        table: tableName,
        exportedAt: new Date().toISOString(),
        recordCount: records.length,
        records: records
      };

      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
      
      console.log(`✅ Exported ${records.length} records from ${tableName}`);
      return { records: records.length, skipped: false };

    } catch (error) {
      console.error(`❌ Error exporting ${tableName}:`, error.message);
      this.exportStats.errors.push({ table: tableName, error: error.message });
      return { records: 0, skipped: true };
    }
  }

  async exportAllTables() {
    console.log('🚀 Starting data export from Supabase...');
    console.log(`📊 Tables to export: ${TABLES_TO_EXPORT.length}`);
    
    this.exportStats.totalTables = TABLES_TO_EXPORT.length;

    for (const tableName of TABLES_TO_EXPORT) {
      const result = await this.exportTable(tableName);
      
      if (!result.skipped) {
        this.exportStats.exportedTables++;
        this.exportStats.totalRecords += result.records;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async generateManifest() {
    const manifest = {
      exportedAt: new Date().toISOString(),
      supabaseUrl: SUPABASE_URL,
      totalTables: this.exportStats.totalTables,
      exportedTables: this.exportStats.exportedTables,
      totalRecords: this.exportStats.totalRecords,
      errors: this.exportStats.errors,
      files: []
    };

    // List all exported files
    try {
      const files = await fs.readdir(EXPORT_DIR);
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'manifest.json') {
          const filePath = path.join(EXPORT_DIR, file);
          const stats = await fs.stat(filePath);
          manifest.files.push({
            filename: file,
            size: stats.size,
            table: file.replace('.json', '').replace('_', '.')
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not list exported files:', error.message);
    }

    const manifestPath = path.join(EXPORT_DIR, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('📋 Export manifest created');
    return manifest;
  }

  async validateExport() {
    console.log('🔍 Validating exported data...');
    
    try {
      const manifestPath = path.join(EXPORT_DIR, 'manifest.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      let validationErrors = 0;

      for (const fileInfo of manifest.files) {
        const filePath = path.join(EXPORT_DIR, fileInfo.filename);
        
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          
          if (!data.records || !Array.isArray(data.records)) {
            console.error(`❌ Invalid data structure in ${fileInfo.filename}`);
            validationErrors++;
          } else if (data.recordCount !== data.records.length) {
            console.error(`❌ Record count mismatch in ${fileInfo.filename}`);
            validationErrors++;
          } else {
            console.log(`✅ ${fileInfo.filename}: ${data.recordCount} records`);
          }
        } catch (error) {
          console.error(`❌ Could not validate ${fileInfo.filename}:`, error.message);
          validationErrors++;
        }
      }

      if (validationErrors === 0) {
        console.log('✅ All exported files validated successfully');
        return true;
      } else {
        console.error(`❌ Found ${validationErrors} validation errors`);
        return false;
      }

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  async printSummary() {
    console.log('\n📊 Export Summary');
    console.log('=================');
    console.log(`✅ Tables exported: ${this.exportStats.exportedTables}/${this.exportStats.totalTables}`);
    console.log(`📝 Total records: ${this.exportStats.totalRecords}`);
    console.log(`📁 Export directory: ${EXPORT_DIR}`);
    
    if (this.exportStats.errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${this.exportStats.errors.length}`);
      this.exportStats.errors.forEach(error => {
        console.log(`   - ${error.table}: ${error.error}`);
      });
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Review the exported data files');
    console.log('   2. Run data transformation if needed: npm run data:transform');
    console.log('   3. Import data to local database: npm run data:import');
  }
}

// Main execution
async function main() {
  const exporter = new DataExporter();

  try {
    await exporter.ensureExportDirectory();
    await exporter.exportAllTables();
    await exporter.generateManifest();
    await exporter.validateExport();
    await exporter.printSummary();

    console.log('\n🎉 Data export completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DataExporter };