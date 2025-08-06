// Base validation classes and utilities
import { ValidationResult, ValidationError, IValidator } from '../types/base';
import { VALIDATION_CONSTANTS } from '../config/constants';

export abstract class BaseValidator<T> implements IValidator<T> {
  abstract validate(data: T): ValidationResult;

  validateField(field: keyof T, value: any): ValidationError | null {
    // Default implementation - can be overridden by specific validators
    return null;
  }

  protected createError(field: string, message: string, code: string, value?: any): ValidationError {
    return {
      field,
      message,
      code,
      value
    };
  }

  protected validateRequired(field: string, value: any): ValidationError | null {
    if (value === null || value === undefined || value === '') {
      return this.createError(field, VALIDATION_CONSTANTS.MESSAGES.REQUIRED, 'REQUIRED', value);
    }
    return null;
  }

  protected validateString(field: string, value: any, minLength?: number, maxLength?: number): ValidationError | null {
    if (typeof value !== 'string') {
      return this.createError(field, 'Deve ser um texto', 'INVALID_TYPE', value);
    }

    if (minLength !== undefined && value.length < minLength) {
      return this.createError(
        field, 
        `Deve ter pelo menos ${minLength} caracteres`, 
        'MIN_LENGTH', 
        value
      );
    }

    if (maxLength !== undefined && value.length > maxLength) {
      return this.createError(
        field, 
        `Deve ter no máximo ${maxLength} caracteres`, 
        'MAX_LENGTH', 
        value
      );
    }

    return null;
  }

  protected validateNumber(field: string, value: any, min?: number, max?: number): ValidationError | null {
    if (typeof value !== 'number' || isNaN(value)) {
      return this.createError(field, 'Deve ser um número válido', 'INVALID_TYPE', value);
    }

    if (min !== undefined && value < min) {
      return this.createError(field, `Deve ser pelo menos ${min}`, 'MIN_VALUE', value);
    }

    if (max !== undefined && value > max) {
      return this.createError(field, `Deve ser no máximo ${max}`, 'MAX_VALUE', value);
    }

    return null;
  }

  protected validateEmail(field: string, value: any): ValidationError | null {
    if (typeof value !== 'string') {
      return this.createError(field, 'Email deve ser um texto', 'INVALID_TYPE', value);
    }

    if (!VALIDATION_CONSTANTS.PATTERNS.EMAIL.test(value)) {
      return this.createError(field, VALIDATION_CONSTANTS.MESSAGES.EMAIL_INVALID, 'INVALID_EMAIL', value);
    }

    return null;
  }

  protected validateUrl(field: string, value: any): ValidationError | null {
    if (typeof value !== 'string') {
      return this.createError(field, 'URL deve ser um texto', 'INVALID_TYPE', value);
    }

    if (!VALIDATION_CONSTANTS.PATTERNS.URL.test(value)) {
      return this.createError(field, VALIDATION_CONSTANTS.MESSAGES.URL_INVALID, 'INVALID_URL', value);
    }

    return null;
  }

  protected validateArray(field: string, value: any, minLength?: number, maxLength?: number): ValidationError | null {
    if (!Array.isArray(value)) {
      return this.createError(field, 'Deve ser uma lista', 'INVALID_TYPE', value);
    }

    if (minLength !== undefined && value.length < minLength) {
      return this.createError(
        field, 
        `Deve ter pelo menos ${minLength} itens`, 
        'MIN_LENGTH', 
        value
      );
    }

    if (maxLength !== undefined && value.length > maxLength) {
      return this.createError(
        field, 
        `Deve ter no máximo ${maxLength} itens`, 
        'MAX_LENGTH', 
        value
      );
    }

    return null;
  }

  protected validateEnum<E>(field: string, value: any, enumValues: E[]): ValidationError | null {
    if (!enumValues.includes(value)) {
      return this.createError(
        field, 
        `Deve ser um dos valores: ${enumValues.join(', ')}`, 
        'INVALID_ENUM', 
        value
      );
    }

    return null;
  }

  protected validateDate(field: string, value: any): ValidationError | null {
    if (typeof value !== 'string') {
      return this.createError(field, 'Data deve ser um texto', 'INVALID_TYPE', value);
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return this.createError(field, 'Data inválida', 'INVALID_DATE', value);
    }

    return null;
  }

  protected validateBoolean(field: string, value: any): ValidationError | null {
    if (typeof value !== 'boolean') {
      return this.createError(field, 'Deve ser verdadeiro ou falso', 'INVALID_TYPE', value);
    }

    return null;
  }

  protected validateObject(field: string, value: any): ValidationError | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.createError(field, 'Deve ser um objeto', 'INVALID_TYPE', value);
    }

    return null;
  }

  protected combineErrors(...errors: (ValidationError | null)[]): ValidationError[] {
    return errors.filter((error): error is ValidationError => error !== null);
  }

  protected createValidationResult(errors: ValidationError[]): ValidationResult {
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Utility functions for common validations
export class ValidationUtils {
  static isValidId(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }

  static isValidTimestamp(value: any): boolean {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  static sanitizeString(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (password.length < VALIDATION_CONSTANTS.LENGTHS.PASSWORD_MIN) {
      errors.push({
        field: 'password',
        message: `Senha deve ter pelo menos ${VALIDATION_CONSTANTS.LENGTHS.PASSWORD_MIN} caracteres`,
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    if (password.length > VALIDATION_CONSTANTS.LENGTHS.PASSWORD_MAX) {
      errors.push({
        field: 'password',
        message: `Senha deve ter no máximo ${VALIDATION_CONSTANTS.LENGTHS.PASSWORD_MAX} caracteres`,
        code: 'PASSWORD_TOO_LONG'
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos uma letra minúscula',
        code: 'PASSWORD_NO_LOWERCASE'
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos uma letra maiúscula',
        code: 'PASSWORD_NO_UPPERCASE'
      });
    }

    if (!/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos um número',
        code: 'PASSWORD_NO_NUMBER'
      });
    }

    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Senha deve conter pelo menos um caractere especial',
        code: 'PASSWORD_NO_SPECIAL'
      });
    }

    return errors;
  }

  static validateFileSize(file: File, maxSize: number): ValidationError | null {
    if (file.size > maxSize) {
      return {
        field: 'file',
        message: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
        code: 'FILE_TOO_LARGE',
        value: file.size
      };
    }
    return null;
  }

  static validateFileType(file: File, allowedTypes: string[]): ValidationError | null {
    if (!allowedTypes.includes(file.type)) {
      return {
        field: 'file',
        message: `Tipo de arquivo não suportado. Tipos permitidos: ${allowedTypes.join(', ')}`,
        code: 'FILE_TYPE_INVALID',
        value: file.type
      };
    }
    return null;
  }
}

// Composite validator for combining multiple validators
export class CompositeValidator<T> extends BaseValidator<T> {
  private validators: IValidator<T>[] = [];

  constructor(validators: IValidator<T>[]) {
    super();
    this.validators = validators;
  }

  validate(data: T): ValidationResult {
    const allErrors: ValidationError[] = [];

    for (const validator of this.validators) {
      const result = validator.validate(data);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }

    return this.createValidationResult(allErrors);
  }

  addValidator(validator: IValidator<T>): void {
    this.validators.push(validator);
  }

  removeValidator(validator: IValidator<T>): void {
    const index = this.validators.indexOf(validator);
    if (index > -1) {
      this.validators.splice(index, 1);
    }
  }
}