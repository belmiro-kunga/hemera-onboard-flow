#!/usr/bin/env node

/**
 * Data Transformation Script for Hemera Project
 * This script transforms exported Supabase data for local PostgreSQL compatibility
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXPORT_DIR = path.join(__dirname, '..', 'data-export');
const TRANSFORMED_DIR = path.join(__dirname, '..', 'data-transformed');

class DataTransformer {
  constructor() {
    this.transformStats = {
      totalFiles: 0,
      transformedFiles: 0,
      totalRecords: 0,
      transformedRecords: 0,
      errors: []
    };
  }

  async ensureTransformedDirectory() {
    try {
      await fs.mkdir(TRANSFORMED_DIR, { recursive: true });
      console.log(`📁 Transformed directory ready: ${TRANSFORMED_DIR}`);
    } catch (error) {
      console.error('❌ Failed to create transformed directory:', error.message);
      throw error;
    }
  }

  async loadManifest() {
    try {
      const manifestPath = path.join(EXPORT_DIR, 'manifest.json');
      const content = await fs.readFile(manifestPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ Could not load export manifest:', error.message);
      console.error('💡 Make sure you have exported data first: npm run data:export');
      throw error;
    }
  }

  // Transform auth.users data
  transformAuthUsers(records) {
    return records.map(record => {
      // Ensure required fields exist
      const transformed = {
        id: record.id,
        email: record.email,
        password_hash: record.encrypted_password || record.password_hash || '',
        email_confirmed: record.email_confirmed_at ? true : false,
        created_at: record.created_at,
        updated_at: record.updated_at,
        last_sign_in_at: record.last_sign_in_at,
        confirmation_token: record.confirmation_token,
        recovery_token: record.recovery_token,
        email_change_token: record.email_change_token_new,
        email_change: record.email_change,
        phone: record.phone,
        phone_confirmed: record.phone_confirmed_at ? true : false,
        phone_change: record.phone_change,
        phone_change_token: record.phone_change_token,
        email_confirmed_at: record.email_confirmed_at,
        phone_confirmed_at: record.phone_confirmed_at,
        confirmation_sent_at: record.confirmation_sent_at,
        recovery_sent_at: record.recovery_sent_at,
        email_change_sent_at: record.email_change_sent_at,
        phone_change_sent_at: record.phone_change_sent_at,
        banned_until: record.banned_until,
        deleted_at: record.deleted_at
      };

      // Remove null/undefined values
      Object.keys(transformed).forEach(key => {
        if (transformed[key] === null || transformed[key] === undefined) {
          delete transformed[key];
        }
      });

      return transformed;
    });
  }

  // Transform profiles data
  transformProfiles(records) {
    return records.map(record => {
      const transformed = {
        ...record,
        // Ensure consistent field names
        user_id: record.user_id || record.id,
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
        is_active: record.is_active !== false, // Default to true
      };

      // Handle JSON fields
      if (typeof transformed.metadata === 'string') {
        try {
          transformed.metadata = JSON.parse(transformed.metadata);
        } catch {
          transformed.metadata = {};
        }
      }

      return transformed;
    });
  }

  // Transform video courses data
  transformVideoCourses(records) {
    return records.map(record => {
      const transformed = {
        ...record,
        // Ensure boolean fields are properly set
        is_active: record.is_active !== false,
        is_featured: record.is_featured === true,
        // Handle duration conversion
        duration_minutes: record.duration_minutes || record.duration_hours * 60 || 0,
        // Ensure required fields
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
      };

      // Handle JSON fields
      if (typeof transformed.metadata === 'string') {
        try {
          transformed.metadata = JSON.parse(transformed.metadata);
        } catch {
          transformed.metadata = {};
        }
      }

      return transformed;
    });
  }

  // Transform simulados data
  transformSimulados(records) {
    return records.map(record => {
      const transformed = {
        ...record,
        // Ensure boolean fields
        is_active: record.is_active !== false,
        is_public: record.is_public !== false,
        // Handle numeric fields
        duration_minutes: parseInt(record.duration_minutes) || 60,
        total_questions: parseInt(record.total_questions) || 0,
        passing_score: parseFloat(record.passing_score) || 70.0,
        // Ensure required fields
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
      };

      return transformed;
    });
  }

  // Transform course assignments data
  transformCourseAssignments(records) {
    return records.map(record => {
      const transformed = {
        ...record,
        // Ensure status is valid
        status: record.status || 'assigned',
        priority: record.priority || 'medium',
        // Handle dates
        assigned_at: record.assigned_at || record.created_at || new Date().toISOString(),
        due_date: record.due_date,
        completed_at: record.completed_at,
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
      };

      return transformed;
    });
  }

  // Transform organizational chart data
  transformOrganizationalChart(records) {
    return records.map(record => {
      const transformed = {
        ...record,
        // Ensure boolean fields
        is_active: record.is_active !== false,
        show_in_presentation: record.show_in_presentation === true,
        // Handle numeric fields
        order_position: parseInt(record.order_position) || 0,
        // Ensure required fields
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
      };

      return transformed;
    });
  }

  // Transform site settings data
  transformSiteSettings(records) {
    return records.map(record => {
      const transformed = {
        ...record,
        // Ensure required fields
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString(),
      };

      // Handle JSON values
      if (record.setting_key && record.setting_value) {
        try {
          // Try to parse as JSON if it looks like JSON
          if (typeof record.setting_value === 'string' && 
              (record.setting_value.startsWith('{') || record.setting_value.startsWith('['))) {
            transformed.setting_value = JSON.parse(record.setting_value);
          }
        } catch {
          // Keep as string if not valid JSON
        }
      }

      return transformed;
    });
  }

  // Generic transformation for most tables
  transformGeneric(records) {
    return records.map(record => {
      const transformed = { ...record };

      // Ensure common timestamp fields
      if (!transformed.created_at) {
        transformed.created_at = new Date().toISOString();
      }
      if (!transformed.updated_at) {
        transformed.updated_at = new Date().toISOString();
      }

      // Handle common boolean fields
      if ('is_active' in transformed && transformed.is_active !== false) {
        transformed.is_active = true;
      }

      return transformed;
    });
  }

  async transformFile(fileName) {
    try {
      const tableName = fileName.replace('.json', '');
      console.log(`🔄 Transforming: ${tableName}`);

      // Load original data
      const filePath = path.join(EXPORT_DIR, fileName);
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      if (!data.records || !Array.isArray(data.records)) {
        throw new Error('Invalid data format');
      }

      let transformedRecords;

      // Apply specific transformations based on table
      switch (tableName) {
        case 'auth_users':
          transformedRecords = this.transformAuthUsers(data.records);
          break;
        case 'profiles':
          transformedRecords = this.transformProfiles(data.records);
          break;
        case 'video_courses':
          transformedRecords = this.transformVideoCourses(data.records);
          break;
        case 'simulados':
          transformedRecords = this.transformSimulados(data.records);
          break;
        case 'course_assignments':
          transformedRecords = this.transformCourseAssignments(data.records);
          break;
        case 'organizational_chart':
          transformedRecords = this.transformOrganizationalChart(data.records);
          break;
        case 'site_settings':
          transformedRecords = this.transformSiteSettings(data.records);
          break;
        default:
          transformedRecords = this.transformGeneric(data.records);
      }

      // Create transformed data structure
      const transformedData = {
        ...data,
        transformedAt: new Date().toISOString(),
        originalRecordCount: data.records.length,
        transformedRecordCount: transformedRecords.length,
        records: transformedRecords
      };

      // Save transformed data
      const outputPath = path.join(TRANSFORMED_DIR, fileName);
      await fs.writeFile(outputPath, JSON.stringify(transformedData, null, 2));

      console.log(`✅ Transformed ${transformedRecords.length} records for ${tableName}`);
      return { records: transformedRecords.length, skipped: false };

    } catch (error) {
      console.error(`❌ Error transforming ${fileName}:`, error.message);
      this.transformStats.errors.push({ file: fileName, error: error.message });
      return { records: 0, skipped: true };
    }
  }

  async transformAllFiles() {
    console.log('🔄 Starting data transformation...');

    const manifest = await this.loadManifest();
    this.transformStats.totalFiles = manifest.files.length;

    for (const fileInfo of manifest.files) {
      const result = await this.transformFile(fileInfo.filename);
      
      if (!result.skipped) {
        this.transformStats.transformedFiles++;
        this.transformStats.transformedRecords += result.records;
      }
    }
  }

  async generateTransformedManifest() {
    const manifest = {
      transformedAt: new Date().toISOString(),
      totalFiles: this.transformStats.totalFiles,
      transformedFiles: this.transformStats.transformedFiles,
      totalRecords: this.transformStats.transformedRecords,
      errors: this.transformStats.errors,
      files: []
    };

    // List all transformed files
    try {
      const files = await fs.readdir(TRANSFORMED_DIR);
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'manifest.json') {
          const filePath = path.join(TRANSFORMED_DIR, file);
          const stats = await fs.stat(filePath);
          manifest.files.push({
            filename: file,
            size: stats.size,
            table: file.replace('.json', '')
          });
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not list transformed files:', error.message);
    }

    const manifestPath = path.join(TRANSFORMED_DIR, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('📋 Transformation manifest created');
    return manifest;
  }

  async printSummary() {
    console.log('\n📊 Transformation Summary');
    console.log('=========================');
    console.log(`✅ Files transformed: ${this.transformStats.transformedFiles}/${this.transformStats.totalFiles}`);
    console.log(`📝 Records transformed: ${this.transformStats.transformedRecords}`);
    console.log(`📁 Output directory: ${TRANSFORMED_DIR}`);
    
    if (this.transformStats.errors.length > 0) {
      console.log(`⚠️  Errors encountered: ${this.transformStats.errors.length}`);
      this.transformStats.errors.forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`);
      });
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Review the transformed data files');
    console.log('   2. Import data to local database: npm run data:import');
  }
}

// Main execution
async function main() {
  const transformer = new DataTransformer();

  try {
    await transformer.ensureTransformedDirectory();
    await transformer.transformAllFiles();
    await transformer.generateTransformedManifest();
    await transformer.printSummary();

    console.log('\n🎉 Data transformation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Transformation failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DataTransformer };