// Local authentication context using the new auth system

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import auth, { type User as LocalUser, type Session as LocalSession } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/database-utils';

// Compatibility types to match Supabase interface
export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
  email_confirmed?: boolean;
  last_sign_in_at?: string;
  // Additional fields for compatibility
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department?: string;
  job_position?: string;
  role: string;
  is_active: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData?: { full_name?: string; job_position?: string; department?: string }) => Promise<{ error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Convert local user to compatible format
  const convertUser = useCallback((localUser: LocalUser): User => {
    return {
      id: localUser.id,
      email: localUser.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_confirmed: true,
      last_sign_in_at: new Date().toISOString(),
      user_metadata: {},
      app_metadata: {},
    };
  }, []);

  // Convert session state to compatible format
  const convertSession = useCallback((sessionState: LocalSession): Session | null => {
    if (!sessionState.isAuthenticated || !sessionState.user || !sessionState.tokens) {
      return null;
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const expiresIn = 3600; // 1 hour

    return {
      user: convertUser(sessionState.user),
      access_token: sessionState.tokens.accessToken,
      refresh_token: sessionState.tokens.refreshToken,
      expires_at: expiresAt,
      expires_in: expiresIn,
      token_type: 'bearer',
    };
  }, [convertUser]);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        logger.debug('Loading authentication session...');
        
        const sessionState = await auth.getCurrentSession();
        
        if (sessionState.isAuthenticated && sessionState.user) {
          const compatibleUser = convertUser(sessionState.user);
          const compatibleSession = convertSession(sessionState);
          
          setUser(compatibleUser);
          setSession(compatibleSession);
          setProfile({
            id: sessionState.user.id,
            name: sessionState.user.name || 'Mock User',
            email: sessionState.user.email,
            role: sessionState.user.role || 'funcionario',
            is_active: true
          });
          setIsAdmin(sessionState.user.role === 'admin');
          
          logger.info(`User session loaded: ${sessionState.user.id}`);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsAdmin(false);
          
          logger.debug('No valid session found');
        }
      } catch (error) {
        logger.error('Failed to load session:', error);
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [convertUser, convertSession]);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      const result = await auth.signIn(email, password);
      
      if (!result.success) {
        return { error: result.error || 'Login failed' };
      }

      if (result.user && result.tokens) {
        const compatibleUser = convertUser(result.user);
        const sessionState: LocalSession = {
          isAuthenticated: true,
          user: result.user,
          tokens: result.tokens,
        };
        const compatibleSession = convertSession(sessionState);

        setUser(compatibleUser);
        setSession(compatibleSession);
        setProfile({
          id: result.user.id,
          name: result.user.name || 'User',
          email: result.user.email,
          role: result.user.role || 'funcionario',
          is_active: true
        });
        setIsAdmin(result.user.role === 'admin');

        toast({
          title: "Login realizado",
          description: "Você foi conectado com sucesso."
        });

        logger.info(`User signed in: ${result.user.id}`);
      }

      return {};
    } catch (error) {
      logger.error('Sign in failed:', error);
      return { error: 'Login failed due to network error' };
    } finally {
      setLoading(false);
    }
  }, [convertUser, convertSession, toast]);

  // Sign up function
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData?: { full_name?: string; job_position?: string; department?: string }
  ): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      const result = await auth.signUp({
        email,
        password,
        full_name: userData?.full_name,
        job_position: userData?.job_position,
        department: userData?.department,
      });
      
      if (!result.success) {
        return { error: result.error || 'Registration failed' };
      }

      if (result.user && result.tokens) {
        const compatibleUser = convertUser(result.user);
        const sessionState: LocalSession = {
          isAuthenticated: true,
          user: result.user,
          tokens: result.tokens,
        };
        const compatibleSession = convertSession(sessionState);

        setUser(compatibleUser);
        setSession(compatibleSession);
        setProfile({
          id: result.user.id,
          name: result.user.name || 'User',
          email: result.user.email,
          role: result.user.role || 'funcionario',
          is_active: true
        });
        setIsAdmin(result.user.role === 'admin');

        toast({
          title: "Conta criada",
          description: "Sua conta foi criada com sucesso."
        });

        logger.info(`User registered: ${result.user.id}`);
      }

      return {};
    } catch (error) {
      logger.error('Sign up failed:', error);
      return { error: 'Registration failed due to network error' };
    } finally {
      setLoading(false);
    }
  }, [convertUser, convertSession, toast]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      // Clear local session
      await auth.signOut();
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });

      logger.info('User signed out');
    } catch (error) {
      logger.error('Sign out failed:', error);
      
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      const sessionState = await auth.getCurrentSession();
      
      if (sessionState.isAuthenticated && sessionState.user) {
        const compatibleUser = convertUser(sessionState.user);
        const compatibleSession = convertSession(sessionState);
        
        setUser(compatibleUser);
        setSession(compatibleSession);
        setProfile({
          id: sessionState.user.id,
          name: sessionState.user.name || 'User',
          email: sessionState.user.email,
          role: sessionState.user.role || 'funcionario',
          is_active: true
        });
        setIsAdmin(sessionState.user.role === 'admin');
        
        logger.debug('Session refreshed successfully');
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        
        logger.debug('Session refresh resulted in no valid session');
      }
    } catch (error) {
      logger.error('Session refresh failed:', error);
    }
  }, [convertUser, convertSession]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signOut,
    signIn,
    signUp,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};