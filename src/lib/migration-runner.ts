// Database migration runner system

import { sql } from './database';
import { logger } from './database-utils';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface Migration {
  id: string;
  name: string;
  filename: string;
  content: string;
  checksum: string;
  appliedAt?: Date;
}

export interface MigrationResult {
  success: boolean;
  migrationsApplied: number;
  errors: string[];
  appliedMigrations: string[];
}

export class MigrationRunner {
  private migrationsPath: string;

  constructor(migrationsPath: string = 'database/migrations') {
    this.migrationsPath = migrationsPath;
  }

  // Create migrations table if it doesn't exist
  async createMigrationsTable(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS public.schema_migrations (
          id SERIAL PRIMARY KEY,
          migration_id VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          filename VARCHAR(255) NOT NULL,
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          execution_time_ms INTEGER,
          success BOOLEAN DEFAULT true
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_schema_migrations_id 
        ON public.schema_migrations(migration_id)
      `;

      logger.info('Migrations table created/verified');
    } catch (error) {
      logger.error('Failed to create migrations table:', error);
      throw error;
    }
  }

  // Get list of applied migrations
  async getAppliedMigrations(): Promise<string[]> {
    try {
      const result = await sql`
        SELECT migration_id 
        FROM public.schema_migrations 
        WHERE success = true
        ORDER BY applied_at
      `;

      return result.map(row => row.migration_id);
    } catch (error) {
      logger.error('Failed to get applied migrations:', error);
      return [];
    }
  }

  // Load migration files from disk
  loadMigrationFiles(): Migration[] {
    try {
      const files = readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const migrations: Migration[] = [];

      for (const filename of files) {
        const filePath = join(this.migrationsPath, filename);
        const content = readFileSync(filePath, 'utf-8');
        
        // Extract migration ID from filename (e.g., "001_initial_schema.sql" -> "001")
        const migrationId = filename.split('_')[0];
        const name = filename.replace('.sql', '').replace(/^\d+_/, '');
        
        // Simple checksum using content length and first/last chars
        const checksum = this.calculateChecksum(content);

        migrations.push({
          id: migrationId,
          name,
          filename,
          content,
          checksum,
        });
      }

      return migrations;
    } catch (error) {
      logger.error('Failed to load migration files:', error);
      throw error;
    }
  }

  // Calculate simple checksum for migration content
  private calculateChecksum(content: string): string {
    // Simple hash based on content length and sample characters
    const hash = content.length.toString(16) + 
                 content.charCodeAt(0).toString(16) + 
                 content.charCodeAt(Math.floor(content.length / 2)).toString(16) + 
                 content.charCodeAt(content.length - 1).toString(16);
    return hash.padStart(16, '0');
  }

  // Validate migration checksum
  async validateMigration(migration: Migration): Promise<boolean> {
    try {
      const result = await sql`
        SELECT checksum 
        FROM public.schema_migrations 
        WHERE migration_id = ${migration.id}
      `;

      if (result.length === 0) {
        return true; // Migration not applied yet
      }

      const storedChecksum = result[0].checksum;
      if (storedChecksum !== migration.checksum) {
        logger.warn(`Migration ${migration.id} checksum mismatch. Expected: ${migration.checksum}, Stored: ${storedChecksum}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to validate migration ${migration.id}:`, error);
      return false;
    }
  }

  // Apply a single migration
  async applyMigration(migration: Migration): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      logger.info(`Applying migration ${migration.id}: ${migration.name}`);

      // Execute migration in a transaction
      await sql.begin(async sql => {
        // Split migration content by semicolon and execute each statement
        const statements = migration.content
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            await sql.unsafe(statement);
          }
        }

        // Record migration as applied
        const executionTime = Date.now() - startTime;
        await sql`
          INSERT INTO public.schema_migrations (
            migration_id, 
            name, 
            filename, 
            checksum, 
            execution_time_ms,
            success
          ) VALUES (
            ${migration.id},
            ${migration.name},
            ${migration.filename},
            ${migration.checksum},
            ${executionTime},
            true
          )
          ON CONFLICT (migration_id) DO UPDATE SET
            checksum = EXCLUDED.checksum,
            execution_time_ms = EXCLUDED.execution_time_ms,
            applied_at = NOW()
        `;
      });

      logger.info(`Migration ${migration.id} applied successfully in ${Date.now() - startTime}ms`);
      return true;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Migration ${migration.id} failed:`, error);

      // Record failed migration
      try {
        await sql`
          INSERT INTO public.schema_migrations (
            migration_id, 
            name, 
            filename, 
            checksum, 
            execution_time_ms,
            success
          ) VALUES (
            ${migration.id},
            ${migration.name},
            ${migration.filename},
            ${migration.checksum},
            ${executionTime},
            false
          )
          ON CONFLICT (migration_id) DO UPDATE SET
            success = false,
            execution_time_ms = EXCLUDED.execution_time_ms,
            applied_at = NOW()
        `;
      } catch (recordError) {
        logger.error('Failed to record migration failure:', recordError);
      }

      return false;
    }
  }

  // Run all pending migrations
  async runMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migrationsApplied: 0,
      errors: [],
      appliedMigrations: [],
    };

    try {
      // Ensure migrations table exists
      await this.createMigrationsTable();

      // Load migration files
      const migrations = this.loadMigrationFiles();
      logger.info(`Found ${migrations.length} migration files`);

      // Get already applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      logger.info(`${appliedMigrations.length} migrations already applied`);

      // Filter pending migrations
      const pendingMigrations = migrations.filter(
        migration => !appliedMigrations.includes(migration.id)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations to apply');
        return result;
      }

      logger.info(`Applying ${pendingMigrations.length} pending migrations`);

      // Apply each pending migration
      for (const migration of pendingMigrations) {
        // Validate migration
        const isValid = await this.validateMigration(migration);
        if (!isValid) {
          const error = `Migration ${migration.id} validation failed`;
          result.errors.push(error);
          result.success = false;
          continue;
        }

        // Apply migration
        const success = await this.applyMigration(migration);
        if (success) {
          result.migrationsApplied++;
          result.appliedMigrations.push(migration.id);
        } else {
          const error = `Migration ${migration.id} failed to apply`;
          result.errors.push(error);
          result.success = false;
        }
      }

      if (result.success) {
        logger.info(`Successfully applied ${result.migrationsApplied} migrations`);
      } else {
        logger.error(`Migration process completed with errors: ${result.errors.join(', ')}`);
      }

      return result;
    } catch (error) {
      logger.error('Migration runner failed:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      return result;
    }
  }

  // Get migration status
  async getMigrationStatus(): Promise<{
    totalMigrations: number;
    appliedMigrations: number;
    pendingMigrations: number;
    lastMigration?: string;
    lastAppliedAt?: Date;
  }> {
    try {
      const migrations = this.loadMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations();

      // Get last applied migration info
      const lastMigrationResult = await sql`
        SELECT migration_id, applied_at 
        FROM public.schema_migrations 
        WHERE success = true
        ORDER BY applied_at DESC 
        LIMIT 1
      `;

      return {
        totalMigrations: migrations.length,
        appliedMigrations: appliedMigrations.length,
        pendingMigrations: migrations.length - appliedMigrations.length,
        lastMigration: lastMigrationResult[0]?.migration_id,
        lastAppliedAt: lastMigrationResult[0]?.applied_at,
      };
    } catch (error) {
      logger.error('Failed to get migration status:', error);
      throw error;
    }
  }

  // Rollback last migration (dangerous - use with caution)
  async rollbackLastMigration(): Promise<boolean> {
    try {
      logger.warn('Rolling back last migration - this is a dangerous operation!');

      const lastMigration = await sql`
        SELECT migration_id, name 
        FROM public.schema_migrations 
        WHERE success = true
        ORDER BY applied_at DESC 
        LIMIT 1
      `;

      if (lastMigration.length === 0) {
        logger.info('No migrations to rollback');
        return true;
      }

      const migrationId = lastMigration[0].migration_id;
      const migrationName = lastMigration[0].name;

      // Remove migration record
      await sql`
        DELETE FROM public.schema_migrations 
        WHERE migration_id = ${migrationId}
      `;

      logger.warn(`Rolled back migration ${migrationId}: ${migrationName}`);
      logger.warn('Note: This only removes the migration record. Database schema changes are NOT automatically reverted!');

      return true;
    } catch (error) {
      logger.error('Failed to rollback migration:', error);
      return false;
    }
  }
}

// Create default migration runner instance
export const migrationRunner = new MigrationRunner();

// Utility function to run migrations
export async function runDatabaseMigrations(): Promise<MigrationResult> {
  return await migrationRunner.runMigrations();
}

// Utility function to get migration status
export async function getDatabaseMigrationStatus() {
  return await migrationRunner.getMigrationStatus();
}