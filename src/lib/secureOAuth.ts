import { logger } from './logger';
import { sanitizeText } from './security';

interface OAuthState {
  state: string;
  timestamp: number;
  provider: string;
  redirectUrl: string;
}

class SecureOAuthManager {
  private static instance: SecureOAuthManager;
  private readonly STORAGE_KEY = 'oauth_states';
  private readonly STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_STATES = 5; // Prevent state accumulation

  private constructor() {}

  static getInstance(): SecureOAuthManager {
    if (!SecureOAuthManager.instance) {
      SecureOAuthManager.instance = new SecureOAuthManager();
    }
    return SecureOAuthManager.instance;
  }

  // Generate cryptographically secure state parameter
  generateState(provider: string, redirectUrl: string): string {
    try {
      // Generate random bytes for state
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const state = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Store state securely with metadata
      this.storeState(state, provider, redirectUrl);
      
      logger.security('OAuth state generated', {
        provider: sanitizeText(provider),
        stateLength: state.length,
        timestamp: Date.now()
      });
      
      return state;
    } catch (error) {
      logger.error('Failed to generate OAuth state', {
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: sanitizeText(provider)
      });
      throw new Error('Failed to generate secure OAuth state');
    }
  }

  // Validate state parameter and prevent replay attacks
  validateState(state: string, provider: string): boolean {
    try {
      if (!state || typeof state !== 'string') {
        logger.security('OAuth state validation failed - invalid format', {
          hasState: !!state,
          stateType: typeof state,
          provider: sanitizeText(provider)
        });
        return false;
      }

      // Sanitize inputs
      const sanitizedState = sanitizeText(state);
      const sanitizedProvider = sanitizeText(provider);
      
      if (sanitizedState !== state) {
        logger.security('OAuth state contained suspicious content', {
          provider: sanitizedProvider
        });
        return false;
      }

      const storedStates = this.getStoredStates();
      const stateData = storedStates.find(s => s.state === state && s.provider === provider);
      
      if (!stateData) {
        logger.security('OAuth state not found or provider mismatch', {
          provider: sanitizedProvider,
          stateExists: false
        });
        return false;
      }

      // Check if state has expired
      const now = Date.now();
      if (now - stateData.timestamp > this.STATE_EXPIRY) {
        logger.security('OAuth state expired', {
          provider: sanitizedProvider,
          age: now - stateData.timestamp,
          maxAge: this.STATE_EXPIRY
        });
        this.removeState(state);
        return false;
      }

      // State is valid, remove it to prevent replay
      this.removeState(state);
      
      logger.security('OAuth state validated successfully', {
        provider: sanitizedProvider
      });
      
      return true;
    } catch (error) {
      logger.error('OAuth state validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: sanitizeText(provider)
      });
      return false;
    }
  }

  // Store state with secure session storage
  private storeState(state: string, provider: string, redirectUrl: string): void {
    try {
      const states = this.getStoredStates();
      
      // Clean up expired states and limit storage
      const now = Date.now();
      const validStates = states
        .filter(s => now - s.timestamp <= this.STATE_EXPIRY)
        .slice(-this.MAX_STATES + 1); // Keep only recent states
      
      const newState: OAuthState = {
        state,
        timestamp: now,
        provider: sanitizeText(provider),
        redirectUrl: sanitizeText(redirectUrl)
      };
      
      validStates.push(newState);
      
      // Use sessionStorage for better security (cleared on tab close)
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(validStates));
      
      logger.debug('OAuth state stored', {
        provider: sanitizeText(provider),
        stateCount: validStates.length
      });
    } catch (error) {
      logger.error('Failed to store OAuth state', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to store OAuth state');
    }
  }

  // Retrieve stored states with validation
  private getStoredStates(): OAuthState[] {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const states: OAuthState[] = JSON.parse(stored);
      
      // Validate structure
      if (!Array.isArray(states)) {
        logger.security('Invalid OAuth states structure detected', {
          type: typeof states
        });
        this.clearAllStates();
        return [];
      }
      
      // Validate each state object
      const validStates = states.filter(state => {
        return state && 
               typeof state.state === 'string' && 
               typeof state.timestamp === 'number' && 
               typeof state.provider === 'string' &&
               typeof state.redirectUrl === 'string';
      });
      
      if (validStates.length !== states.length) {
        logger.security('Some OAuth states had invalid structure', {
          original: states.length,
          valid: validStates.length
        });
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(validStates));
      }
      
      return validStates;
    } catch (error) {
      logger.error('Failed to retrieve OAuth states', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.clearAllStates();
      return [];
    }
  }

  // Remove specific state
  private removeState(state: string): void {
    try {
      const states = this.getStoredStates();
      const filteredStates = states.filter(s => s.state !== state);
      
      if (filteredStates.length === 0) {
        sessionStorage.removeItem(this.STORAGE_KEY);
      } else {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredStates));
      }
      
      logger.debug('OAuth state removed', {
        removedState: state.substring(0, 8) + '...',
        remainingStates: filteredStates.length
      });
    } catch (error) {
      logger.error('Failed to remove OAuth state', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Clear all stored states (for cleanup/logout)
  clearAllStates(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      logger.debug('All OAuth states cleared');
    } catch (error) {
      logger.error('Failed to clear OAuth states', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get redirect URL for validated state
  getRedirectUrl(state: string): string | null {
    try {
      const states = this.getStoredStates();
      const stateData = states.find(s => s.state === state);
      return stateData?.redirectUrl || null;
    } catch (error) {
      logger.error('Failed to get redirect URL', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Cleanup expired states (call periodically)
  cleanupExpiredStates(): void {
    try {
      const states = this.getStoredStates();
      const now = Date.now();
      const validStates = states.filter(s => now - s.timestamp <= this.STATE_EXPIRY);
      
      if (validStates.length !== states.length) {
        if (validStates.length === 0) {
          sessionStorage.removeItem(this.STORAGE_KEY);
        } else {
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(validStates));
        }
        
        logger.debug('OAuth states cleaned up', {
          removed: states.length - validStates.length,
          remaining: validStates.length
        });
      }
    } catch (error) {
      logger.error('Failed to cleanup OAuth states', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const secureOAuthManager = SecureOAuthManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    secureOAuthManager.clearAllStates();
  });
  
  // Periodic cleanup every 5 minutes
  setInterval(() => {
    secureOAuthManager.cleanupExpiredStates();
  }, 5 * 60 * 1000);
}