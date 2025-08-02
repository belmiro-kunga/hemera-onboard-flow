// React hooks for authentication

import { useState, useCallback } from 'react';
import { AuthService, type LoginCredentials, type RegisterData, type AuthResult } from './auth-service';
import { logger } from '../database-utils';

export interface UseAuthLoginReturn {
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthRegisterReturn {
  register: (data: RegisterData) => Promise<AuthResult>;
  isLoading: boolean;
  error: string | null;
}

export interface UsePasswordChangeReturn {
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for user login
 */
export function useAuthLogin(): UseAuthLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.login(credentials);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'Login failed due to network error';
      setError(errorMessage);
      logger.error('Login hook error:', error);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    isLoading,
    error,
  };
}

/**
 * Hook for user registration
 */
export function useAuthRegister(): UseAuthRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.register(data);
      
      if (!result.success) {
        setError(result.error || 'Registration failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'Registration failed due to network error';
      setError(errorMessage);
      logger.error('Registration hook error:', error);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    register,
    isLoading,
    error,
  };
}

/**
 * Hook for password change
 */
export function usePasswordChange(userId: string): UsePasswordChangeReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = useCallback(async (
    currentPassword: string, 
    newPassword: string
  ): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.changePassword(userId, currentPassword, newPassword);
      
      if (!result.success) {
        setError(result.error || 'Password change failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'Password change failed due to network error';
      setError(errorMessage);
      logger.error('Password change hook error:', error);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    changePassword,
    isLoading,
    error,
  };
}

/**
 * Hook for token refresh
 */
export function useTokenRefresh() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = useCallback(async (refreshToken: string): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.refreshToken(refreshToken);
      
      if (!result.success) {
        setError(result.error || 'Token refresh failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'Token refresh failed due to network error';
      setError(errorMessage);
      logger.error('Token refresh hook error:', error);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    refreshToken,
    isLoading,
    error,
  };
}

/**
 * Hook for session verification
 */
export function useSessionVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifySession = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await AuthService.verifySession(token);
      
      if (!session) {
        setError('Invalid or expired session');
      }

      return session;
    } catch (error) {
      const errorMessage = 'Session verification failed';
      setError(errorMessage);
      logger.error('Session verification hook error:', error);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    verifySession,
    isLoading,
    error,
  };
}