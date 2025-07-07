import { useEffect, useState, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeError } from '@/lib/security';
import { logger } from '@/lib/logger';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;

      try {
        // Reset error and retry count on successful auth change
        retryCount.current = 0;
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null,
        }));

        // Log auth events securely (without sensitive data)
        logger.info(`Auth state changed: ${event}`, {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id ? '[USER_ID_PRESENT]' : null,
        });

      } catch (error) {
        logger.error('Error handling auth state change', { 
          message: sanitizeError(error),
          event 
        });
        
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: sanitizeError(error),
          }));
        }
      }
    };

    const initializeAuth = async () => {
      try {
        // Set up auth listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        // Then get current session with retry logic
        const getSessionWithRetry = async (): Promise<void> => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              throw error;
            }

            if (mounted) {
              setAuthState(prev => ({
                ...prev,
                session,
                user: session?.user ?? null,
                loading: false,
                error: null,
              }));
            }
          } catch (error) {
            retryCount.current++;
            
            if (retryCount.current < maxRetries) {
              logger.warn(`Auth session fetch failed, retrying (${retryCount.current}/${maxRetries})`, {
                message: sanitizeError(error),
              });
              
              // Exponential backoff
              setTimeout(() => {
                if (mounted) {
                  getSessionWithRetry();
                }
              }, 1000 * Math.pow(2, retryCount.current - 1));
            } else {
              logger.error('Auth session fetch failed after max retries', {
                message: sanitizeError(error),
                retries: retryCount.current,
              });
              
              if (mounted) {
                setAuthState(prev => ({
                  ...prev,
                  loading: false,
                  error: sanitizeError(error),
                }));
              }
            }
          }
        };

        await getSessionWithRetry();

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        logger.error('Error initializing auth', { message: sanitizeError(error) });
        
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: sanitizeError(error),
          }));
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      mounted = false;
      cleanup.then(unsub => unsub?.());
    };
  }, []);

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign out error', { message: sanitizeError(error) });
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: sanitizeError(error),
        }));
        return { error };
      }

      // Auth state will be updated by the listener
      logger.info('User signed out successfully');
      return { error: null };

    } catch (error) {
      const sanitized = sanitizeError(error);
      logger.error('Unexpected sign out error', { message: sanitized });
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: sanitized,
      }));
      
      return { error: error as AuthError };
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    signOut,
    clearError,
  };
};