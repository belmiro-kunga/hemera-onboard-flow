// Authentication system tests

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { checkDatabaseConnection } from '../../database';
import { PasswordManager } from '../password-utils';
import { JWTManager } from '../jwt-utils';
import { AuthService } from '../auth-service';
import { SessionManager } from '../session-manager';

describe('Authentication System', () => {
  beforeAll(async () => {
    // Ensure database connection is working
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed. Make sure PostgreSQL is running.');
    }
  });

  describe('Password Manager', () => {
    it('should hash passwords securely', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await PasswordManager.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await PasswordManager.hashPassword(password);
      
      const isValid = await PasswordManager.verifyPassword(password, hashedPassword);
      const isInvalid = await PasswordManager.verifyPassword('WrongPassword', hashedPassword);
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('should validate password strength', () => {
      const weakPassword = '123';
      const mediumPassword = 'Password123';
      const strongPassword = 'StrongPassword123!';
      
      const weakResult = PasswordManager.validatePassword(weakPassword);
      const mediumResult = PasswordManager.validatePassword(mediumPassword);
      const strongResult = PasswordManager.validatePassword(strongPassword);
      
      expect(weakResult.isValid).toBe(false);
      expect(weakResult.strength).toBe('weak');
      expect(weakResult.errors.length).toBeGreaterThan(0);
      
      expect(mediumResult.strength).toBe('medium');
      expect(strongResult.strength).toBe('strong');
    });

    it('should generate secure passwords', () => {
      const password = PasswordManager.generateSecurePassword(16);
      
      expect(password).toBeDefined();
      expect(password.length).toBe(16);
      
      const validation = PasswordManager.validatePassword(password);
      expect(validation.strength).toBeOneOf(['medium', 'strong']);
    });
  });

  describe('JWT Manager', () => {
    const testPayload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      isAdmin: false,
    };

    it('should generate valid access tokens', () => {
      const token = JWTManager.generateAccessToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate valid refresh tokens', () => {
      const token = JWTManager.generateRefreshToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate token pairs', () => {
      const tokenPair = JWTManager.generateTokenPair(testPayload);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.expiresAt).toBeInstanceOf(Date);
      expect(tokenPair.refreshExpiresAt).toBeInstanceOf(Date);
    });

    it('should verify tokens correctly', () => {
      const token = JWTManager.generateAccessToken(testPayload);
      const result = JWTManager.verifyToken(token);
      
      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testPayload.userId);
      expect(result.payload?.email).toBe(testPayload.email);
    });

    it('should reject invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      const result = JWTManager.verifyToken(invalidToken);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should decode tokens without verification', () => {
      const token = JWTManager.generateAccessToken(testPayload);
      const decoded = JWTManager.decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
    });

    it('should extract user ID from tokens', () => {
      const token = JWTManager.generateAccessToken(testPayload);
      const userId = JWTManager.extractUserId(token);
      
      expect(userId).toBe(testPayload.userId);
    });
  });

  describe('Session Manager', () => {
    const mockSession = {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed: true,
      },
      tokens: JWTManager.generateTokenPair({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        isAdmin: false,
      }),
      isAdmin: false,
      lastRefresh: new Date().toISOString(),
    };

    beforeEach(() => {
      // Clear localStorage before each test
      SessionManager.clearSession();
    });

    it('should save and load sessions', () => {
      SessionManager.saveSession(mockSession);
      const loadedSession = SessionManager.loadSession();
      
      expect(loadedSession).toBeDefined();
      expect(loadedSession?.user.id).toBe(mockSession.user.id);
      expect(loadedSession?.user.email).toBe(mockSession.user.email);
    });

    it('should clear sessions', () => {
      SessionManager.saveSession(mockSession);
      SessionManager.clearSession();
      const loadedSession = SessionManager.loadSession();
      
      expect(loadedSession).toBeNull();
    });

    it('should get access token', () => {
      SessionManager.saveSession(mockSession);
      const token = SessionManager.getAccessToken();
      
      expect(token).toBe(mockSession.tokens.accessToken);
    });

    it('should get current user', () => {
      SessionManager.saveSession(mockSession);
      const user = SessionManager.getCurrentUser();
      
      expect(user).toBeDefined();
      expect(user?.id).toBe(mockSession.user.id);
      expect(user?.email).toBe(mockSession.user.email);
    });

    it('should check admin status', () => {
      SessionManager.saveSession(mockSession);
      const isAdmin = SessionManager.isCurrentUserAdmin();
      
      expect(isAdmin).toBe(mockSession.isAdmin);
    });

    it('should validate session integrity', () => {
      const validSession = mockSession;
      const invalidSession = { ...mockSession, user: null };
      
      expect(SessionManager.validateSession(validSession)).toBe(true);
      expect(SessionManager.validateSession(invalidSession as any)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      full_name: 'Test User',
    };

    it('should register and login user', async () => {
      // Register user
      const registerResult = await AuthService.register(testUser);
      
      expect(registerResult.success).toBe(true);
      expect(registerResult.user).toBeDefined();
      expect(registerResult.tokens).toBeDefined();
      expect(registerResult.user?.email).toBe(testUser.email);

      if (!registerResult.user) return;

      // Login with same credentials
      const loginResult = await AuthService.login({
        email: testUser.email,
        password: testUser.password,
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toBeDefined();
      expect(loginResult.tokens).toBeDefined();
      expect(loginResult.user?.id).toBe(registerResult.user.id);

      // Clean up - delete test user
      // Note: In a real test environment, you'd want to clean up test data
    }, 10000); // Increase timeout for database operations

    it('should handle invalid login credentials', async () => {
      const loginResult = await AuthService.login({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBeDefined();
    });

    it('should refresh tokens', async () => {
      // First register a user
      const registerResult = await AuthService.register({
        email: `refresh-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });

      expect(registerResult.success).toBe(true);
      if (!registerResult.tokens) return;

      // Refresh tokens
      const refreshResult = await AuthService.refreshToken(registerResult.tokens.refreshToken);

      expect(refreshResult.success).toBe(true);
      expect(refreshResult.tokens).toBeDefined();
      expect(refreshResult.tokens?.accessToken).not.toBe(registerResult.tokens.accessToken);
    }, 10000);
  });
});