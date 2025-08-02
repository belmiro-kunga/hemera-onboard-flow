// Schema validation utilities

import { sql } from './database';
import { logger } from './database-utils';

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingTables: string[];
  missingColumns: string[];
  missingFunctions: string[];
  missingIndexes: string[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  indexes?: string[];
  constraints?: string[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
}

export class SchemaValidator {
  private expectedTables: TableSchema[] = [
    {
      name: 'profiles',
      columns: [
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'full_name', type: 'text', nullable: true },
        { name: 'job_position', type: 'text', nullable: true },
        { name: 'department', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: true },
      ],
      indexes: ['idx_profiles_user_id'],
    },
    {
      name: 'video_courses',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'title', type: 'text', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'is_active', type: 'boolean', nullable: true },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false },
      ],
    },
    {
      name: 'course_enrollments',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'course_id', type: 'uuid', nullable: false },
        { name: 'progress_percentage', type: 'integer', nullable: true },
        { name: 'enrolled_at', type: 'timestamp with time zone', nullable: false },
        { name: 'completed_at', type: 'timestamp with time zone', nullable: true },
      ],
      indexes: ['idx_course_enrollments_user_id', 'idx_course_enrollments_course_id'],
    },
    {
      name: 'course_assignments',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'content_type', type: 'character varying', nullable: false },
        { name: 'content_id', type: 'uuid', nullable: false },
        { name: 'assigned_by', type: 'uuid', nullable: false },
        { name: 'status', type: 'character varying', nullable: true },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true },
      ],
      indexes: ['idx_course_assignments_user_id', 'idx_course_assignments_status'],
    },
    {
      name: 'simulados',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'title', type: 'text', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'is_active', type: 'boolean', nullable: true },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false },
      ],
    },
    {
      name: 'notifications',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'title', type: 'character varying', nullable: false },
        { name: 'message', type: 'text', nullable: false },
        { name: 'type', type: 'character varying', nullable: false },
        { name: 'is_read', type: 'boolean', nullable: true },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true },
      ],
      indexes: ['idx_notifications_user_id'],
    },
  ];

  private expectedFunctions: string[] = [
    'is_admin_user',
    'update_updated_at_column',
    'update_enrollment_progress',
    'update_assignment_status',
    'mark_overdue_assignments',
    'apply_template_to_user',
    'queue_email',
    'create_notification',
    'mark_notification_read',
    'get_unread_notification_count',
  ];

  async validateSchema(): Promise<SchemaValidationResult> {
    const result: SchemaValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingTables: [],
      missingColumns: [],
      missingFunctions: [],
      missingIndexes: [],
    };

    try {
      logger.info('Starting schema validation...');

      // Validate tables and columns
      await this.validateTables(result);

      // Validate functions
      await this.validateFunctions(result);

      // Validate indexes
      await this.validateIndexes(result);

      // Validate RLS policies
      await this.validateRLSPolicies(result);

      // Determine overall validity
      result.isValid = result.errors.length === 0;

      if (result.isValid) {
        logger.info('Schema validation passed');
      } else {
        logger.error(`Schema validation failed with ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      logger.error('Schema validation failed:', error);
      result.isValid = false;
      result.errors.push(`Validation process failed: ${error}`);
      return result;
    }
  }

  private async validateTables(result: SchemaValidationResult): Promise<void> {
    // Get all tables in public schema
    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;

    const existingTableNames = existingTables.map(t => t.table_name);

    // Check for missing tables
    for (const expectedTable of this.expectedTables) {
      if (!existingTableNames.includes(expectedTable.name)) {
        result.missingTables.push(expectedTable.name);
        result.errors.push(`Missing table: ${expectedTable.name}`);
        continue;
      }

      // Validate columns for existing tables
      await this.validateTableColumns(expectedTable, result);
    }
  }

  private async validateTableColumns(
    expectedTable: TableSchema,
    result: SchemaValidationResult
  ): Promise<void> {
    try {
      const existingColumns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${expectedTable.name}
      `;

      const existingColumnNames = existingColumns.map(c => c.column_name);

      // Check for missing columns
      for (const expectedColumn of expectedTable.columns) {
        if (!existingColumnNames.includes(expectedColumn.name)) {
          result.missingColumns.push(`${expectedTable.name}.${expectedColumn.name}`);
          result.errors.push(`Missing column: ${expectedTable.name}.${expectedColumn.name}`);
          continue;
        }

        // Validate column properties
        const existingColumn = existingColumns.find(c => c.column_name === expectedColumn.name);
        if (existingColumn) {
          // Check data type (simplified check)
          if (!this.isCompatibleType(existingColumn.data_type, expectedColumn.type)) {
            result.warnings.push(
              `Column type mismatch: ${expectedTable.name}.${expectedColumn.name} ` +
              `expected ${expectedColumn.type}, got ${existingColumn.data_type}`
            );
          }

          // Check nullable constraint
          const isNullable = existingColumn.is_nullable === 'YES';
          if (isNullable !== expectedColumn.nullable) {
            result.warnings.push(
              `Column nullable mismatch: ${expectedTable.name}.${expectedColumn.name} ` +
              `expected ${expectedColumn.nullable ? 'nullable' : 'not null'}, got ${isNullable ? 'nullable' : 'not null'}`
            );
          }
        }
      }
    } catch (error) {
      result.errors.push(`Failed to validate columns for table ${expectedTable.name}: ${error}`);
    }
  }

  private async validateFunctions(result: SchemaValidationResult): Promise<void> {
    try {
      const existingFunctions = await sql`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
      `;

      const existingFunctionNames = existingFunctions.map(f => f.routine_name);

      // Check for missing functions
      for (const expectedFunction of this.expectedFunctions) {
        if (!existingFunctionNames.includes(expectedFunction)) {
          result.missingFunctions.push(expectedFunction);
          result.errors.push(`Missing function: ${expectedFunction}`);
        }
      }
    } catch (error) {
      result.errors.push(`Failed to validate functions: ${error}`);
    }
  }

  private async validateIndexes(result: SchemaValidationResult): Promise<void> {
    try {
      const existingIndexes = await sql`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
      `;

      const existingIndexNames = existingIndexes.map(i => i.indexname);

      // Check for missing indexes
      for (const expectedTable of this.expectedTables) {
        if (expectedTable.indexes) {
          for (const expectedIndex of expectedTable.indexes) {
            if (!existingIndexNames.includes(expectedIndex)) {
              result.missingIndexes.push(expectedIndex);
              result.warnings.push(`Missing index: ${expectedIndex}`);
            }
          }
        }
      }
    } catch (error) {
      result.errors.push(`Failed to validate indexes: ${error}`);
    }
  }

  private async validateRLSPolicies(result: SchemaValidationResult): Promise<void> {
    try {
      // Check if RLS is enabled on key tables
      const rlsStatus = await sql`
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'video_courses', 'course_enrollments', 'course_assignments', 'notifications')
      `;

      for (const table of rlsStatus) {
        if (!table.rowsecurity) {
          result.warnings.push(`RLS not enabled on table: ${table.tablename}`);
        }
      }

      // Check for existence of key policies
      const policies = await sql`
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
      `;

      const policyCount = policies.length;
      if (policyCount === 0) {
        result.warnings.push('No RLS policies found - this may be intentional for local development');
      } else {
        logger.info(`Found ${policyCount} RLS policies`);
      }
    } catch (error) {
      result.warnings.push(`Failed to validate RLS policies: ${error}`);
    }
  }

  private isCompatibleType(actualType: string, expectedType: string): boolean {
    // Normalize type names for comparison
    const normalize = (type: string) => type.toLowerCase().replace(/\s+/g, ' ').trim();
    
    const actual = normalize(actualType);
    const expected = normalize(expectedType);

    // Direct match
    if (actual === expected) return true;

    // Common type aliases
    const typeAliases: Record<string, string[]> = {
      'uuid': ['uuid'],
      'text': ['text', 'character varying'],
      'character varying': ['character varying', 'varchar', 'text'],
      'integer': ['integer', 'int', 'int4'],
      'boolean': ['boolean', 'bool'],
      'timestamp with time zone': ['timestamp with time zone', 'timestamptz'],
    };

    // Check if types are compatible
    for (const [canonical, aliases] of Object.entries(typeAliases)) {
      if (aliases.includes(actual) && aliases.includes(expected)) {
        return true;
      }
    }

    return false;
  }

  async generateSchemaReport(): Promise<string> {
    const validation = await this.validateSchema();
    
    let report = '# Database Schema Validation Report\n\n';
    report += `**Status:** ${validation.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
    
    if (validation.errors.length > 0) {
      report += '## Errors\n\n';
      validation.errors.forEach(error => {
        report += `- ❌ ${error}\n`;
      });
      report += '\n';
    }
    
    if (validation.warnings.length > 0) {
      report += '## Warnings\n\n';
      validation.warnings.forEach(warning => {
        report += `- ⚠️ ${warning}\n`;
      });
      report += '\n';
    }
    
    if (validation.missingTables.length > 0) {
      report += '## Missing Tables\n\n';
      validation.missingTables.forEach(table => {
        report += `- ${table}\n`;
      });
      report += '\n';
    }
    
    if (validation.missingColumns.length > 0) {
      report += '## Missing Columns\n\n';
      validation.missingColumns.forEach(column => {
        report += `- ${column}\n`;
      });
      report += '\n';
    }
    
    if (validation.missingFunctions.length > 0) {
      report += '## Missing Functions\n\n';
      validation.missingFunctions.forEach(func => {
        report += `- ${func}\n`;
      });
      report += '\n';
    }
    
    if (validation.missingIndexes.length > 0) {
      report += '## Missing Indexes\n\n';
      validation.missingIndexes.forEach(index => {
        report += `- ${index}\n`;
      });
      report += '\n';
    }
    
    return report;
  }
}

// Create default schema validator instance
export const schemaValidator = new SchemaValidator();

// Utility function to validate schema
export async function validateDatabaseSchema(): Promise<SchemaValidationResult> {
  return await schemaValidator.validateSchema();
}