import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { User } from '../types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Authentication Hook
 * Provides user state and auth methods
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
    
    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      console.log('🔄 useAuth - Loading user...');
      const currentUser = await authService.getCurrentUser();
      console.log('🔄 useAuth - User loaded:', currentUser ? { id: currentUser.id, email: currentUser.email, role: currentUser.role } : 'null');
      setUser(currentUser);
    } catch (error) {
      console.error('❌ useAuth - Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔐 useAuth - Signing in:', email);
      const response = await authService.signIn(email, password);
      if (response.error) {
        throw response.error;
      }
      console.log('🔐 useAuth - Sign in successful, user:', response.user ? { id: response.user.id, email: response.user.email, role: response.user.role } : 'null');
      setUser(response.user);
    } catch (error) {
      console.error('❌ useAuth - Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return {
    user,
    loading,
    signIn,
    signOut,
    refreshUser,
  };
}

