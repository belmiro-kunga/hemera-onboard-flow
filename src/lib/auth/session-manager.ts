// Session management utilities

import { type TokenPair, type JWTPayload, verifyToken, isTokenExpired } from './jwt-utils';
import { type User, type UserProfile, AuthService } from './auth-service';
import { logger } from '../database-utils';

export interface StoredSession {
  user: User;
  profile?: UserProfile;
  tokens: TokenPair;
  isAdmin: boolean;
  lastRefresh: string;
}

export interface SessionState {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  tokens: TokenPair | null;
}

export class SessionManager {
  private static readonly STORAGE_KEY = 'hemera_session';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  /**
   * Save session to localStorage
   */
  static saveSession(session: StoredSession): void {
    try {
      const sessionData = {
        ...session,
        lastRefresh: new Date().toISOString(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      logger.debug('Session saved to localStorage');
    } catch (error) {
      logger.error('Failed to save session:', error);
    }
  }

  /**
   * Load session from localStorage
   */
  static loadSession(): StoredSession | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData) as StoredSession;
      
      // Validate session structure
      if (!session.user || !session.tokens) {
        logger.warn('Invalid session structure found');
        this.clearSession();
        return null;
      }

      // Check if tokens are expired
      if (isTokenExpired(session.tokens.accessToken)) {
        logger.debug('Access token expired, session needs refresh');
        
        // If refresh token is also expired, clear session
        if (isTokenExpired(session.tokens.refreshToken)) {
          logger.debug('Refresh token also expired, clearing session');
          this.clearSession();
          return null;
        }
      }

      logger.debug('Session loaded from localStorage');
      return session;
    } catch (error) {
      logger.error('Failed to load session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session from localStorage
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      logger.debug('Session cleared from localStorage');
    } catch (error) {
      logger.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if session needs refresh
   */
  static needsRefresh(session: StoredSession): boolean {
    try {
      const tokenResult = verifyToken(session.tokens.accessToken);
      
      if (!tokenResult.isValid) {
        return true;
      }

      if (!tokenResult.payload?.exp) {
        return true;
      }

      const expirationTime = tokenResult.payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      return timeUntilExpiry <= this.REFRESH_THRESHOLD;
    } catch (error) {
      logger.error('Error checking if session needs refresh:', error);
      return true;
    }
  }

  /**
   * Refresh session tokens
   */
  static async refreshSession(session: StoredSession): Promise<StoredSession | null> {
    try {
      logger.debug('Refreshing session tokens');

      const result = await AuthService.refreshToken(session.tokens.refreshToken);
      
      if (!result.success || !result.tokens || !result.user) {
        logger.warn('Session refresh failed');
        this.clearSession();
        return null;
      }

      const refreshedSession: StoredSession = {
        user: result.user,
        profile: result.profile,
        tokens: result.tokens,
        isAdmin: result.isAdmin || false,
        lastRefresh: new Date().toISOString(),
      };

      this.saveSession(refreshedSession);
      logger.debug('Session refreshed successfully');

      return refreshedSession;
    } catch (error) {
      logger.error('Session refresh failed:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Get current session state
   */
  static async getCurrentSession(): Promise<SessionState> {
    try {
      const session = this.loadSession();
      
      if (!session) {
        return {
          isAuthenticated: false,
          user: null,
          profile: null,
          isAdmin: false,
          tokens: null,
        };
      }

      // Check if session needs refresh
      if (this.needsRefresh(session)) {
        const refreshedSession = await this.refreshSession(session);
        
        if (!refreshedSession) {
          return {
            isAuthenticated: false,
            user: null,
            profile: null,
            isAdmin: false,
            tokens: null,
          };
        }

        return {
          isAuthenticated: true,
          user: refreshedSession.user,
          profile: refreshedSession.profile || null,
          isAdmin: refreshedSession.isAdmin,
          tokens: refreshedSession.tokens,
        };
      }

      return {
        isAuthenticated: true,
        user: session.user,
        profile: session.profile || null,
        isAdmin: session.isAdmin,
        tokens: session.tokens,
      };
    } catch (error) {
      logger.error('Failed to get current session:', error);
      this.clearSession();
      
      return {
        isAuthenticated: false,
        user: null,
        profile: null,
        isAdmin: false,
        tokens: null,
      };
    }
  }

  /**
   * Update session user data
   */
  static updateSessionUser(user: User, profile?: UserProfile): void {
    try {
      const session = this.loadSession();
      
      if (!session) {
        logger.warn('No session to update');
        return;
      }

      const updatedSession: StoredSession = {
        ...session,
        user,
        profile: profile || session.profile,
        lastRefresh: new Date().toISOString(),
      };

      this.saveSession(updatedSession);
      logger.debug('Session user data updated');
    } catch (error) {
      logger.error('Failed to update session user data:', error);
    }
  }

  /**
   * Get access token from current session
   */
  static getAccessToken(): string | null {
    try {
      const session = this.loadSession();
      return session?.tokens.accessToken || null;
    } catch (error) {
      logger.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get current user from session
   */
  static getCurrentUser(): User | null {
    try {
      const session = this.loadSession();
      return session?.user || null;
    } catch (error) {
      logger.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Check if current user is admin
   */
  static isCurrentUserAdmin(): boolean {
    try {
      const session = this.loadSession();
      return session?.isAdmin || false;
    } catch (error) {
      logger.error('Failed to check admin status:', error);
      return false;
    }
  }

  /**
   * Get session expiration info
   */
  static getSessionExpiration(): { accessExpiry: Date | null; refreshExpiry: Date | null } {
    try {
      const session = this.loadSession();
      
      if (!session) {
        return { accessExpiry: null, refreshExpiry: null };
      }

      return {
        accessExpiry: session.tokens.expiresAt,
        refreshExpiry: session.tokens.refreshExpiresAt,
      };
    } catch (error) {
      logger.error('Failed to get session expiration:', error);
      return { accessExpiry: null, refreshExpiry: null };
    }
  }

  /**
   * Validate session integrity
   */
  static validateSession(session: StoredSession): boolean {
    try {
      // Check required fields
      if (!session.user || !session.tokens) {
        return false;
      }

      // Check user structure
      if (!session.user.id || !session.user.email) {
        return false;
      }

      // Check tokens structure
      if (!session.tokens.accessToken || !session.tokens.refreshToken) {
        return false;
      }

      // Verify token format (basic check)
      const tokenResult = verifyToken(session.tokens.accessToken);
      if (!tokenResult.isValid && !tokenResult.isExpired) {
        // If token is invalid (not just expired), session is corrupted
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Session validation failed:', error);
      return false;
    }
  }
}

// Export convenience functions
export const saveSession = SessionManager.saveSession.bind(SessionManager);
export const loadSession = SessionManager.loadSession.bind(SessionManager);
export const clearSession = SessionManager.clearSession.bind(SessionManager);
export const getCurrentSession = SessionManager.getCurrentSession.bind(SessionManager);
export const getAccessToken = SessionManager.getAccessToken.bind(SessionManager);
export const getCurrentUser = SessionManager.getCurrentUser.bind(SessionManager);
export const isCurrentUserAdmin = SessionManager.isCurrentUserAdmin.bind(SessionManager);