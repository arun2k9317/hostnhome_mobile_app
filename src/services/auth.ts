import { supabase } from './supabase';
import { User } from '../types';

export interface SignInResponse {
  user: User | null;
  session: any;
  error?: any;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string): Promise<SignInResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      // Fetch user role from user_profiles table
      const user = await authService.getCurrentUser();
      
      return {
        user,
        session: data.session,
        error: null,
      };
    } catch (error: any) {
      return { user: null, session: null, error };
    }
  },

  /**
   * Sign up new user
   */
  signUp: async (data: SignUpData): Promise<SignInResponse> => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      // Fetch user role from user_profiles table
      const user = await authService.getCurrentUser();
      
      return {
        user,
        session: authData.session,
        error: null,
      };
    } catch (error: any) {
      return { user: null, session: null, error };
    }
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Get current authenticated user with role info
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.log('🔍 No authenticated user found');
        return null;
      }

      console.log('🔍 Fetching user profile for auth_user_id:', authUser.id);
      console.log('🔍 Auth user email:', authUser.email);

      // Fetch user data from user_profiles table to get role
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error || !userData) {
        console.error('❌ Error fetching user profile:', error);
        console.warn('⚠️ User profile not found, using default vendor role');
        return {
          id: authUser.id,
          email: authUser.email || '',
          role: 'vendor' as const,
        };
      }

      console.log('✅ User profile found:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        vendor_id: userData.vendor_id,
        staff_id: userData.staff_id,
      });
      console.log('✅ Returning user with role:', userData.role);

      return {
        id: authUser.id,
        email: userData.email || authUser.email || '',
        role: userData.role as User['role'],
        vendorId: userData.vendor_id,
        staffId: userData.staff_id,
      } as User;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const user = await authService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string): Promise<{ error: any }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'hostnhome://reset-password',
    });
    return { error };
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword: string): Promise<{ error: any }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },
};

