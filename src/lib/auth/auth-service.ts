// Main authentication service

import { database } from '../database';
import { hashPassword, verifyPassword, validatePassword } from './password-utils';
import { generateTokenPair, verifyToken, refreshAccessToken, type TokenPair, type JWTPayload } from './jwt-utils';
import { logger } from '../database-utils';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  email_confirmed: boolean;
  last_sign_in_at?: string;
}

export interface UserProfile {
  user_id: string;
  full_name?: string;
  job_position?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  job_position?: string;
  department?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  profile?: UserProfile;
  tokens?: TokenPair;
  error?: string;
  isAdmin?: boolean;
}

export interface SessionInfo {
  user: User;
  profile?: UserProfile;
  isAdmin: boolean;
  tokens: TokenPair;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      logger.info(`Registration attempt for email: ${data.email}`);

      // Validate input
      const validation = this.validateRegistrationData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Check if user already exists
      const existingUser = await this.findUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user in auth.users table
      const userResult = await database
        .from('auth.users')
        .insert({
          email: data.email.toLowerCase().trim(),
          password_hash: hashedPassword,
          email_confirmed: false,
        });

      if (userResult.error) {
        logger.error('Failed to create user:', userResult.error);
        return {
          success: false,
          error: 'Failed to create user account',
        };
      }

      const newUser = userResult.data[0] as User;

      // Create user profile
      let profile: UserProfile | undefined;
      if (data.full_name || data.job_position || data.department) {
        const profileResult = await database
          .from('profiles')
          .insert({
            user_id: newUser.id,
            full_name: data.full_name,
            job_position: data.job_position,
            department: data.department,
          });

        if (profileResult.error) {
          logger.warn('Failed to create user profile:', profileResult.error);
        } else {
          profile = profileResult.data[0] as UserProfile;
        }
      }

      // Check if user is admin
      const isAdmin = await this.checkUserIsAdmin(newUser.id);

      // Generate tokens
      const tokens = generateTokenPair({
        userId: newUser.id,
        email: newUser.email,
        isAdmin,
      });

      logger.info(`User registered successfully: ${newUser.id}`);

      return {
        success: true,
        user: newUser,
        profile,
        tokens,
        isAdmin,
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      return {
        success: false,
        error: 'Registration failed due to server error',
      };
    }
  }

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      logger.info(`Login attempt for email: ${credentials.email}`);

      // Validate input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      // Find user by email
      const user = await this.findUserByEmail(credentials.email);
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Verify password
      const isPasswordValid = await verifyPassword(credentials.password, user.password_hash);
      if (!isPasswordValid) {
        logger.warn(`Failed login attempt for user: ${user.id}`);
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Update last sign in
      await this.updateLastSignIn(user.id);

      // Get user profile
      const profile = await this.getUserProfile(user.id);

      // Check if user is admin
      const isAdmin = await this.checkUserIsAdmin(user.id);

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        isAdmin,
      });

      logger.info(`User logged in successfully: ${user.id}`);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email_confirmed: user.email_confirmed,
          last_sign_in_at: user.last_sign_in_at,
        },
        profile,
        tokens,
        isAdmin,
      };
    } catch (error) {
      logger.error('Login failed:', error);
      return {
        success: false,
        error: 'Login failed due to server error',
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const newTokens = await refreshAccessToken(refreshToken);
      
      if (!newTokens) {
        return {
          success: false,
          error: 'Invalid or expired refresh token',
        };
      }

      // Get user info from token
      const tokenResult = verifyToken(newTokens.accessToken);
      if (!tokenResult.isValid || !tokenResult.payload) {
        return {
          success: false,
          error: 'Failed to generate valid tokens',
        };
      }

      const user = await this.findUserById(tokenResult.payload.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const profile = await this.getUserProfile(user.id);
      const isAdmin = await this.checkUserIsAdmin(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email_confirmed: user.email_confirmed,
          last_sign_in_at: user.last_sign_in_at,
        },
        profile,
        tokens: newTokens,
        isAdmin,
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }
  }

  /**
   * Verify session from token
   */
  static async verifySession(token: string): Promise<SessionInfo | null> {
    try {
      const tokenResult = verifyToken(token);
      
      if (!tokenResult.isValid || !tokenResult.payload) {
        return null;
      }

      const user = await this.findUserById(tokenResult.payload.userId);
      if (!user) {
        return null;
      }

      const profile = await this.getUserProfile(user.id);
      const isAdmin = await this.checkUserIsAdmin(user.id);

      // Generate new tokens if current one is close to expiry
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        isAdmin,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
          email_confirmed: user.email_confirmed,
          last_sign_in_at: user.last_sign_in_at,
        },
        profile,
        isAdmin,
        tokens,
      };
    } catch (error) {
      logger.error('Session verification failed:', error);
      return null;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      // Find user
      const user = await this.findUserById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', '),
        };
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      const updateResult = await database
        .from('auth.users')
        .eq('id', userId)
        .update({
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString(),
        });

      if (updateResult.error) {
        logger.error('Failed to update password:', updateResult.error);
        return {
          success: false,
          error: 'Failed to update password',
        };
      }

      logger.info(`Password changed successfully for user: ${userId}`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Password change failed:', error);
      return {
        success: false,
        error: 'Password change failed due to server error',
      };
    }
  }

  /**
   * Find user by email
   */
  private static async findUserByEmail(email: string): Promise<any | null> {
    try {
      const result = await database
        .from('auth.users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .limit(1)
        .select_query();

      return result.data?.[0] || null;
    } catch (error) {
      logger.error('Failed to find user by email:', error);
      return null;
    }
  }

  /**
   * Find user by ID
   */
  private static async findUserById(userId: string): Promise<any | null> {
    try {
      const result = await database
        .from('auth.users')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .select_query();

      return result.data?.[0] || null;
    } catch (error) {
      logger.error('Failed to find user by ID:', error);
      return null;
    }
  }

  /**
   * Get user profile
   */
  private static async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    try {
      const result = await database
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .select_query();

      return result.data?.[0] as UserProfile;
    } catch (error) {
      logger.warn('Failed to get user profile:', error);
      return undefined;
    }
  }

  /**
   * Check if user is admin
   */
  private static async checkUserIsAdmin(userId: string): Promise<boolean> {
    try {
      // Check if we're in browser mode (mock data)
      const isBrowser = typeof window !== 'undefined';
      
      if (isBrowser) {
        console.warn('🔧 Using mock admin check');
        // Mock admin check - return true for mock-admin user
        return userId === 'mock-admin';
      }
      
      try {
        // Try RPC function first
        const result = await database.rpc('is_admin_user', {
          user_uuid: userId,
        });

        return Boolean(result.data);
      } catch (rpcError) {
        // Fallback to manual query
        console.warn('RPC function not available, using fallback admin check');
        
        const { data, error } = await database
          .from('profiles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (error) throw error;
        
        return data?.role === 'admin' || data?.role === 'super_admin';
      }
    } catch (error) {
      logger.warn('Failed to check admin status:', error);
      return false;
    }
  }

  /**
   * Update last sign in timestamp
   */
  private static async updateLastSignIn(userId: string): Promise<void> {
    try {
      await database
        .from('auth.users')
        .eq('id', userId)
        .update({
          last_sign_in_at: new Date().toISOString(),
        });
    } catch (error) {
      logger.warn('Failed to update last sign in:', error);
    }
  }

  /**
   * Validate registration data
   */
  private static validateRegistrationData(data: RegisterData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    } else {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export convenience functions
export const register = AuthService.register.bind(AuthService);
export const login = AuthService.login.bind(AuthService);
export const refreshToken = AuthService.refreshToken.bind(AuthService);
export const verifySession = AuthService.verifySession.bind(AuthService);
export const changePassword = AuthService.changePassword.bind(AuthService);