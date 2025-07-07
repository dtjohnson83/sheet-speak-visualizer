import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OAuthManager } from '@/lib/oauth/OAuthManager';
import { secureOAuthManager } from '@/lib/secureOAuth';
import { useAuditLogger } from '@/hooks/useAuditLogger';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { logAuthEvent, logSecurityEvent } = useAuditLogger();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const provider = searchParams.get('provider') || 'unknown';

      if (error) {
        logAuthEvent('oauth_callback_error', { 
          provider, 
          error: error.substring(0, 200) 
        });
        
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
        return;
      }

      if (!code || !state) {
        logSecurityEvent('oauth_callback_missing_params', 'medium', {
          hasCode: !!code,
          hasState: !!state,
          provider
        });
        
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: 'Missing authorization code or state'
        }, window.location.origin);
        window.close();
        return;
      }

      try {
        // Validate OAuth state to prevent CSRF attacks
        if (!secureOAuthManager.validateState(state, provider)) {
          logSecurityEvent('oauth_state_validation_failed', 'high', {
            provider,
            stateProvided: !!state
          });
          
          window.opener?.postMessage({
            type: 'OAUTH_ERROR',
            error: 'Invalid OAuth state - possible security attack'
          }, window.location.origin);
          window.close();
          return;
        }

        const oauthManager = OAuthManager.getInstance();
        const token = await oauthManager.handleOAuthCallback(code, state);
        
        logAuthEvent('oauth_callback_success', { 
          provider,
          hasToken: !!token
        });
        
        // Send success message to parent window
        window.opener?.postMessage({
          type: 'OAUTH_SUCCESS',
          token: token
        }, window.location.origin);
        
        window.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'OAuth callback failed';
        
        logAuthEvent('oauth_callback_failed', { 
          provider,
          error: errorMessage.substring(0, 200)
        });
        
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: errorMessage
        }, window.location.origin);
        window.close();
      }
    };

    handleOAuthCallback();
  }, [searchParams, logAuthEvent, logSecurityEvent]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing OAuth callback...</p>
      </div>
    </div>
  );
};