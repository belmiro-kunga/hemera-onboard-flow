// Base data transformer
import { logger } from '../logging/logger';

export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput;
  transformArray(input: TInput[]): TOutput[];
  reverse?(output: TOutput): TInput;
  reverseArray?(output: TOutput[]): TInput[];
}

export abstract class BaseTransformer<TInput, TOutput> implements DataTransformer<TInput, TOutput> {
  abstract transform(input: TInput): TOutput;

  transformArray(input: TInput[]): TOutput[] {
    return input.map(item => this.transform(item));
  }

  reverse?(output: TOutput): TInput {
    throw new Error('Reverse transformation not implemented');
  }

  reverseArray?(output: TOutput[]): TInput[] {
    if (!this.reverse) {
      throw new Error('Reverse transformation not implemented');
    }
    return output.map(item => this.reverse!(item));
  }

  protected logTransformation(operation: string, input: any, output: any): void {
    logger.debug(`Data transformation: ${operation}`, {
      inputType: typeof input,
      outputType: typeof output,
      transformer: this.constructor.name
    });
  }

  protected validateInput(input: any, requiredFields: string[]): void {
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected object');
    }

    for (const field of requiredFields) {
      if (!(field in input)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  protected safeTransform<T>(
    operation: () => T,
    fallback: T,
    context: string
  ): T {
    try {
      return operation();
    } catch (error) {
      logger.warn(`Transformation failed: ${context}`, error);
      return fallback;
    }
  }
}

// Utility functions for common transformations
export class TransformUtils {
  static normalizeDate(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toISOString();
    } catch (error) {
      logger.warn('Date normalization failed', error, { date });
      return null;
    }
  }

  static normalizeString(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  static normalizeNumber(value: any, defaultValue: number = 0): number {
    if (typeof value === 'number' && !isNaN(value)) return value;
    
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? defaultValue : parsed;
  }

  static normalizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') return value !== 0;
    return Boolean(value);
  }

  static normalizeArray<T>(value: any, itemTransformer?: (item: any) => T): T[] {
    if (!Array.isArray(value)) return [];
    
    if (itemTransformer) {
      return value.map(item => itemTransformer(item));
    }
    
    return value;
  }

  static removeNullUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        result[key as keyof T] = value;
      }
    }
    
    return result;
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (Array.isArray(obj)) return obj.map(item => TransformUtils.deepClone(item)) as unknown as T;
    
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = TransformUtils.deepClone(obj[key]);
      }
    }
    
    return cloned;
  }

  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    
    return result;
  }

  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...obj };
    
    for (const key of keys) {
      delete result[key];
    }
    
    return result;
  }

  static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  static transformKeys<T extends Record<string, any>>(
    obj: T,
    transformer: (key: string) => string
  ): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = transformer(key);
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[newKey] = TransformUtils.transformKeys(value, transformer);
      } else if (Array.isArray(value)) {
        result[newKey] = value.map(item => 
          item && typeof item === 'object' && !(item instanceof Date)
            ? TransformUtils.transformKeys(item, transformer)
            : item
        );
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  }
}