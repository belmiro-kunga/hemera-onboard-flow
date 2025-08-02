// Authentication system exports

// Core services
export { AuthService, register, login, refreshToken, verifySession, changePassword } from './auth-service';
export type { 
  User, 
  UserProfile, 
  LoginCredentials, 
  RegisterData, 
  AuthResult, 
  SessionInfo 
} from './auth-service';

// Password utilities
export { 
  PasswordManager, 
  hashPassword, 
  verifyPassword, 
  validatePassword, 
  generateSecurePassword 
} from './password-utils';
export type { PasswordValidationResult } from './password-utils';

// JWT utilities
export { 
  JWTManager, 
  generateAccessToken, 
  generateRefreshToken, 
  generateTokenPair, 
  verifyToken, 
  refreshAccessToken, 
  isTokenExpired, 
  extractUserId 
} from './jwt-utils';
export type { JWTPayload, TokenPair, VerifyTokenResult } from './jwt-utils';

// Session management
export { 
  SessionManager, 
  saveSession, 
  loadSession, 
  clearSession, 
  getCurrentSession, 
  getAccessToken, 
  getCurrentUser, 
  isCurrentUserAdmin 
} from './session-manager';
export type { StoredSession, SessionState } from './session-manager';

// React hooks
export { 
  useAuthLogin, 
  useAuthRegister, 
  usePasswordChange, 
  useTokenRefresh, 
  useSessionVerification 
} from './auth-hooks';
export type { 
  UseAuthLoginReturn, 
  UseAuthRegisterReturn, 
  UsePasswordChangeReturn 
} from './auth-hooks';

// Convenience functions for common operations
export const auth = {
  // Authentication
  login,
  register,
  refreshToken,
  verifySession,
  changePassword,
  
  // Session management
  getCurrentSession,
  saveSession,
  clearSession,
  getAccessToken,
  getCurrentUser,
  isCurrentUserAdmin,
  
  // Password utilities
  hashPassword,
  verifyPassword,
  validatePassword,
  generateSecurePassword,
  
  // JWT utilities
  generateTokenPair,
  verifyToken,
  isTokenExpired,
  extractUserId,
};