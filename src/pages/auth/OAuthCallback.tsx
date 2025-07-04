import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OAuthManager } from '@/lib/oauth/OAuthManager';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        // Send error to parent window
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
        return;
      }

      if (!code || !state) {
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: 'Missing authorization code or state'
        }, window.location.origin);
        window.close();
        return;
      }

      try {
        const oauthManager = OAuthManager.getInstance();
        const token = await oauthManager.handleOAuthCallback(code, state);
        
        // Send success message to parent window
        window.opener?.postMessage({
          type: 'OAUTH_SUCCESS',
          token: token
        }, window.location.origin);
        
        window.close();
      } catch (error) {
        console.error('OAuth callback error:', error);
        window.opener?.postMessage({
          type: 'OAUTH_ERROR',
          error: error instanceof Error ? error.message : 'OAuth callback failed'
        }, window.location.origin);
        window.close();
      }
    };

    handleOAuthCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing OAuth callback...</p>
      </div>
    </div>
  );
};