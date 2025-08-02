// Password hashing and validation utilities

import bcrypt from 'bcryptjs';
import { logger } from '../database-utils';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

export class PasswordManager {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
      }

      if (password.length > this.MAX_LENGTH) {
        throw new Error(`Password must be less than ${this.MAX_LENGTH} characters`);
      }

      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      logger.debug('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      logger.error('Password hashing failed:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
        return false;
      }

      const isValid = await bcrypt.compare(password, hashedPassword);
      logger.debug(`Password verification: ${isValid ? 'success' : 'failed'}`);
      
      return isValid;
    } catch (error) {
      logger.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Validate password strength and requirements
   */
  static validatePassword(password: string): PasswordValidationResult {
    const result: PasswordValidationResult = {
      isValid: true,
      errors: [],
      strength: 'weak',
      score: 0,
    };

    if (!password || typeof password !== 'string') {
      result.isValid = false;
      result.errors.push('Password is required');
      return result;
    }

    // Length validation
    if (password.length < this.MIN_LENGTH) {
      result.isValid = false;
      result.errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (password.length > this.MAX_LENGTH) {
      result.isValid = false;
      result.errors.push(`Password must be less than ${this.MAX_LENGTH} characters long`);
    }

    // Strength calculation
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      longLength: password.length >= 12,
    };

    // Score calculation
    if (checks.length) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.symbols) score += 1;
    if (checks.longLength) score += 1;

    result.score = score;

    // Strength determination
    if (score >= 5) {
      result.strength = 'strong';
    } else if (score >= 3) {
      result.strength = 'medium';
    } else {
      result.strength = 'weak';
    }

    // Additional validations for medium/strong passwords
    if (result.strength === 'weak') {
      if (!checks.lowercase) result.errors.push('Password must contain lowercase letters');
      if (!checks.uppercase) result.errors.push('Password must contain uppercase letters');
      if (!checks.numbers) result.errors.push('Password must contain numbers');
    }

    // Common password patterns to avoid
    const commonPatterns = [
      /^password/i,
      /^123456/,
      /^qwerty/i,
      /^admin/i,
      /^letmein/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        result.isValid = false;
        result.errors.push('Password contains common patterns and is not secure');
        break;
      }
    }

    // Sequential characters check
    if (this.hasSequentialChars(password)) {
      result.errors.push('Password should not contain sequential characters');
    }

    // Repeated characters check
    if (this.hasRepeatedChars(password)) {
      result.errors.push('Password should not contain too many repeated characters');
    }

    return result;
  }

  /**
   * Check for sequential characters (abc, 123, etc.)
   */
  private static hasSequentialChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for too many repeated characters
   */
  private static hasRepeatedChars(password: string): boolean {
    const charCount: Record<string, number> = {};
    
    for (const char of password) {
      charCount[char] = (charCount[char] || 0) + 1;
    }

    // If any character appears more than 3 times, it's too repetitive
    return Object.values(charCount).some(count => count > 3);
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Check if password needs to be rehashed (for security upgrades)
   */
  static async needsRehash(hashedPassword: string): Promise<boolean> {
    try {
      // Check if the hash was created with fewer rounds than current setting
      const rounds = bcrypt.getRounds(hashedPassword);
      return rounds < this.SALT_ROUNDS;
    } catch (error) {
      logger.warn('Could not determine hash rounds, assuming rehash needed:', error);
      return true;
    }
  }
}

// Export convenience functions
export const hashPassword = PasswordManager.hashPassword.bind(PasswordManager);
export const verifyPassword = PasswordManager.verifyPassword.bind(PasswordManager);
export const validatePassword = PasswordManager.validatePassword.bind(PasswordManager);
export const generateSecurePassword = PasswordManager.generateSecurePassword.bind(PasswordManager);