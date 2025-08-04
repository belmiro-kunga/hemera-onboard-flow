// Authentication module with environment detection

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Common types and utilities
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  } | null;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

// Browser-safe auth implementation
const browserAuth = {
  async signIn(email: string, password: string) {
    console.warn('🔧 Using mock auth - signIn called');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Define valid admin credentials
    const validCredentials = [
      { email: 'superadmin@hcp.com', password: 'admin123', name: 'Super Administrador', role: 'admin' },
      { email: 'admin@hcp.com', password: 'admin123', name: 'Administrador', role: 'admin' },
      { email: 'funcionario.teste@hcp.com', password: '123456', name: 'Funcionário Teste', role: 'admin' }
    ];

    // Check credentials
    const validUser = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!validUser) {
      return {
        success: false,
        error: 'Credenciais inválidas'
      };
    }
    
    // Store the user in local storage (in a real app, this would be handled by a more secure mechanism)
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('mock-auth-user', JSON.stringify(validUser));
    }
    
    return {
      success: true,
      user: {
        id: `user-${validUser.email.split('@')[0]}`,
        email: validUser.email,
        name: validUser.name,
        role: validUser.role
      },
      tokens: {
        accessToken: `mock-access-token-${validUser.email}`,
        refreshToken: `mock-refresh-token-${validUser.email}`
      }
    };
  },

  async signUp(userData: any) {
    console.warn('🔧 Using mock auth - signUp called');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      user: {
        id: 'mock-user-id',
        email: userData.email,
        name: userData.full_name
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }
    };
  },

  async signOut() {
    console.warn('🔧 Using mock auth - signOut called');
    
    // Clear stored session
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('mock-auth-user');
    }
    
    return { success: true };
  },

  async refreshToken(refreshToken: string) {
    console.warn('🔧 Using mock auth - refreshToken called');
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      tokens: {
        accessToken: 'mock-new-access-token',
        refreshToken: 'mock-new-refresh-token'
      }
    };
  },

  async getCurrentUser() {
    console.warn('🔧 Using mock auth - getCurrentUser called');
    return {
      user: {
        id: 'mock-user-id',
        email: 'mock@example.com',
        name: 'Mock User'
      },
      isAuthenticated: false
    };
  },

  async getCurrentSession() {
    console.warn('🔧 Using mock auth - getCurrentSession called');
    
    // Check if there's a stored session (in a real app, this would be from localStorage/sessionStorage)
    const storedUser = typeof window !== 'undefined' ? window.localStorage?.getItem('mock-auth-user') : null;
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return {
          user,
          isAuthenticated: true,
          tokens: {
            accessToken: `mock-access-token-${user.email}`,
            refreshToken: `mock-refresh-token-${user.email}`
          }
        };
      } catch {
        // Invalid stored data, clear it
        if (typeof window !== 'undefined') {
          window.localStorage?.removeItem('mock-auth-user');
        }
      }
    }
    
    return {
      user: null,
      isAuthenticated: false,
      tokens: null
    };
  },

  async verifyToken(token: string) {
    console.warn('🔧 Using mock auth - verifyToken called');
    return {
      valid: true,
      user: {
        id: 'mock-user-id',
        email: 'mock@example.com'
      }
    };
  }
};

// Server-side auth implementation
let serverAuth = browserAuth;

if (!isBrowser) {
  try {
    const { AuthService } = require('./auth-service');
    
    serverAuth = {
      async signIn(email: string, password: string) {
        return AuthService.login({ email, password });
      },

      async signUp(userData: any) {
        return AuthService.register(userData);
      },

      async signOut() {
        return AuthService.logout();
      },

      async refreshToken(refreshToken: string) {
        return AuthService.refreshToken(refreshToken);
      },

      async getCurrentUser() {
        return {
          user: null,
          isAuthenticated: false
        };
      },

      async getCurrentSession() {
        return {
          user: null,
          isAuthenticated: false,
          tokens: null
        };
      },

      async verifyToken(token: string) {
        return AuthService.verifyToken(token);
      }
    };
  } catch (error) {
    console.warn('Could not load server auth service, using mock implementation');
  }
}

// Export the appropriate auth implementation
export const auth = isBrowser ? browserAuth : serverAuth;

// Mock AuthService for browser compatibility
export class AuthService {
  static async register(userData: any) {
    return auth.signUp(userData);
  }

  static async login(credentials: any) {
    return auth.signIn(credentials.email, credentials.password);
  }

  static async refreshToken(refreshToken: string) {
    return auth.refreshToken(refreshToken);
  }

  static async verifyToken(token: string) {
    return auth.verifyToken(token);
  }

  static async logout() {
    return auth.signOut();
  }
}

// Mock utility functions for browser compatibility
export const generateAccessToken = (userId: string, email: string) => {
  if (isBrowser) {
    return 'mock-access-token';
  }
  try {
    const { generateAccessToken: serverGenerateAccessToken } = require('./jwt-utils');
    return serverGenerateAccessToken(userId, email);
  } catch {
    return 'mock-access-token';
  }
};

export const generateRefreshToken = (userId: string, email: string) => {
  if (isBrowser) {
    return 'mock-refresh-token';
  }
  try {
    const { generateRefreshToken: serverGenerateRefreshToken } = require('./jwt-utils');
    return serverGenerateRefreshToken(userId, email);
  } catch {
    return 'mock-refresh-token';
  }
};

export const verifyAccessToken = (token: string) => {
  if (isBrowser) {
    return { valid: true, payload: { userId: 'mock', email: 'mock@example.com' } };
  }
  try {
    const { verifyAccessToken: serverVerifyAccessToken } = require('./jwt-utils');
    return serverVerifyAccessToken(token);
  } catch {
    return { valid: true, payload: { userId: 'mock', email: 'mock@example.com' } };
  }
};

export const verifyRefreshToken = (token: string) => {
  if (isBrowser) {
    return { valid: true, payload: { userId: 'mock', email: 'mock@example.com' } };
  }
  try {
    const { verifyRefreshToken: serverVerifyRefreshToken } = require('./jwt-utils');
    return serverVerifyRefreshToken(token);
  } catch {
    return { valid: true, payload: { userId: 'mock', email: 'mock@example.com' } };
  }
};

// Export default auth instance
export default auth;