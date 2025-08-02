// JWT token generation and verification utilities

import jwt from 'jsonwebtoken';
import { jwtConfig } from '../database-config';
import { logger } from '../database-utils';

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin?: boolean;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

export interface VerifyTokenResult {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
  isExpired?: boolean;
}

export class JWTManager {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days
  private static readonly ISSUER = 'hemera-system';
  private static readonly AUDIENCE = 'hemera-users';

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      const tokenPayload: JWTPayload = {
        ...payload,
        // Add session ID for token invalidation if needed
        sessionId: payload.sessionId || this.generateSessionId(),
      };

      const token = jwt.sign(tokenPayload, jwtConfig.secret, {
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithm: 'HS256',
      });

      logger.debug(`Access token generated for user: ${payload.userId}`);
      return token;
    } catch (error) {
      logger.error('Failed to generate access token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        sessionId: payload.sessionId || this.generateSessionId(),
        type: 'refresh',
      };

      const token = jwt.sign(tokenPayload, jwtConfig.secret, {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithm: 'HS256',
      });

      logger.debug(`Refresh token generated for user: ${payload.userId}`);
      return token;
    } catch (error) {
      logger.error('Failed to generate refresh token:', error);
      throw new Error('Refresh token generation failed');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    const sessionId = this.generateSessionId();
    const payloadWithSession = { ...payload, sessionId };

    const accessToken = this.generateAccessToken(payloadWithSession);
    const refreshToken = this.generateRefreshToken(payloadWithSession);

    // Calculate expiration dates
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      accessToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
    };
  }

  /**
   * Verify and decode token
   */
  static verifyToken(token: string): VerifyTokenResult {
    try {
      if (!token || typeof token !== 'string') {
        return {
          isValid: false,
          error: 'Token is required and must be a string',
        };
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/, '');

      const decoded = jwt.verify(cleanToken, jwtConfig.secret, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithms: ['HS256'],
      }) as JWTPayload;

      logger.debug(`Token verified successfully for user: ${decoded.userId}`);

      return {
        isValid: true,
        payload: decoded,
      };
    } catch (error) {
      logger.warn('Token verification failed:', error);

      if (error instanceof jwt.TokenExpiredError) {
        return {
          isValid: false,
          error: 'Token has expired',
          isExpired: true,
        };
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          error: 'Invalid token format',
        };
      }

      if (error instanceof jwt.NotBeforeError) {
        return {
          isValid: false,
          error: 'Token not active yet',
        };
      }

      return {
        isValid: false,
        error: 'Token verification failed',
      };
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const cleanToken = token.replace(/^Bearer\s+/, '');
      const decoded = jwt.decode(cleanToken) as JWTPayload;
      return decoded;
    } catch (error) {
      logger.warn('Token decoding failed:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch (error) {
      logger.warn('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get token expiration date
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error) {
      logger.warn('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      const verifyResult = this.verifyToken(refreshToken);
      
      if (!verifyResult.isValid || !verifyResult.payload) {
        logger.warn('Invalid refresh token provided');
        return null;
      }

      // Check if it's actually a refresh token
      const decoded = verifyResult.payload as any;
      if (decoded.type !== 'refresh') {
        logger.warn('Token is not a refresh token');
        return null;
      }

      // Generate new token pair
      const newTokenPair = this.generateTokenPair({
        userId: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        sessionId: decoded.sessionId,
      });

      logger.debug(`Access token refreshed for user: ${decoded.userId}`);
      return newTokenPair;
    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      return null;
    }
  }

  /**
   * Generate session ID
   */
  private static generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Extract user ID from token
   */
  static extractUserId(token: string): string | null {
    try {
      const decoded = this.decodeToken(token);
      return decoded?.userId || null;
    } catch (error) {
      logger.warn('Error extracting user ID from token:', error);
      return null;
    }
  }

  /**
   * Create token for password reset
   */
  static generatePasswordResetToken(userId: string, email: string): string {
    try {
      const payload = {
        userId,
        email,
        type: 'password_reset',
        // Short expiration for security
      };

      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: '1h', // 1 hour
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithm: 'HS256',
      });
    } catch (error) {
      logger.error('Failed to generate password reset token:', error);
      throw new Error('Password reset token generation failed');
    }
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): VerifyTokenResult {
    try {
      const result = this.verifyToken(token);
      
      if (!result.isValid || !result.payload) {
        return result;
      }

      const decoded = result.payload as any;
      if (decoded.type !== 'password_reset') {
        return {
          isValid: false,
          error: 'Invalid token type for password reset',
        };
      }

      return result;
    } catch (error) {
      logger.error('Password reset token verification failed:', error);
      return {
        isValid: false,
        error: 'Token verification failed',
      };
    }
  }
}

// Export convenience functions
export const generateAccessToken = JWTManager.generateAccessToken.bind(JWTManager);
export const generateRefreshToken = JWTManager.generateRefreshToken.bind(JWTManager);
export const generateTokenPair = JWTManager.generateTokenPair.bind(JWTManager);
export const verifyToken = JWTManager.verifyToken.bind(JWTManager);
export const refreshAccessToken = JWTManager.refreshAccessToken.bind(JWTManager);
export const isTokenExpired = JWTManager.isTokenExpired.bind(JWTManager);
export const extractUserId = JWTManager.extractUserId.bind(JWTManager);