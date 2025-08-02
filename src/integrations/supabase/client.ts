// Temporary compatibility layer for Supabase client
// This file provides a compatibility layer while we migrate from Supabase to local PostgreSQL
// TODO: Remove this file once all Supabase references are replaced

import { database } from '@/lib/database';

// Temporary mock types to maintain compatibility
export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: any;
}

// Mock Supabase client for compatibility
export const supabase = {
  auth: {
    getUser: async (): Promise<{ data: { user: User | null }, error: any }> => {
      console.warn('⚠️ Using deprecated Supabase auth.getUser() - migrate to local auth');
      // Return mock user for now
      return {
        data: { user: null },
        error: null
      };
    },

    getSession: async (): Promise<{ data: { session: Session | null }, error: any }> => {
      console.warn('⚠️ Using deprecated Supabase auth.getSession() - migrate to local auth');
      return {
        data: { session: null },
        error: null
      };
    },

    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      console.warn('⚠️ Using deprecated Supabase auth.onAuthStateChange() - migrate to local auth');
      // Return mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('Mock auth subscription unsubscribed');
            }
          }
        }
      };
    },

    signOut: async () => {
      console.warn('⚠️ Using deprecated Supabase auth.signOut() - migrate to local auth');
      return { error: null };
    }
  },

  from: (table: string) => {
    console.warn(`⚠️ Using deprecated Supabase client for table "${table}" - migrate to database client`);
    
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
          limit: (count: number) => ({ data: [], error: null }),
          order: (column: string, options?: any) => ({ data: [], error: null }),
          then: async (resolve: any) => resolve({ data: [], error: null })
        }),
        limit: (count: number) => ({ data: [], error: null }),
        order: (column: string, options?: any) => ({ data: [], error: null }),
        then: async (resolve: any) => resolve({ data: [], error: null })
      }),
      
      insert: (data: any) => ({
        select: (columns?: string) => ({ data: [], error: null }),
        then: async (resolve: any) => resolve({ data: [], error: null })
      }),
      
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns?: string) => ({ data: [], error: null }),
          then: async (resolve: any) => resolve({ data: [], error: null })
        })
      }),
      
      delete: () => ({
        eq: (column: string, value: any) => ({ data: [], error: null })
      })
    };
  },

  rpc: async (functionName: string, params?: any) => {
    console.warn(`⚠️ Using deprecated Supabase RPC "${functionName}" - migrate to database client`);
    
    // Try to use the new database client for RPC calls
    try {
      const result = await database.rpc(functionName, params);
      return result;
    } catch (error) {
      return { data: null, error };
    }
  },

  channel: (name: string) => {
    console.warn(`⚠️ Using deprecated Supabase realtime channel "${name}" - migrate to alternative solution`);
    
    return {
      on: (event: string, callback: any) => ({
        subscribe: () => {
          console.log(`Mock subscription to ${event} on channel ${name}`);
          return { status: 'SUBSCRIBED' };
        }
      })
    };
  }
};

// Export for backward compatibility
export default supabase;