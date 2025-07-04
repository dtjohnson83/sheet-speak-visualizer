import { supabase } from '@/integrations/supabase/client';
import { OAuthToken, OAuthProviderConfig, OAuthState, OAuthFlowConfig, OAuthProviderType } from '@/types/oauth';
import { GoogleOAuthProvider } from './providers/GoogleOAuthProvider';
import { MicrosoftOAuthProvider } from './providers/MicrosoftOAuthProvider';
import { SalesforceOAuthProvider } from './providers/SalesforceOAuthProvider';

export class OAuthManager {
  private static instance: OAuthManager;
  private providers = new Map();
  private stateStorage = new Map<string, OAuthState>();

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): OAuthManager {
    if (!OAuthManager.instance) {
      OAuthManager.instance = new OAuthManager();
    }
    return OAuthManager.instance;
  }

  private initializeProviders() {
    this.providers.set('google', new GoogleOAuthProvider());
    this.providers.set('microsoft', new MicrosoftOAuthProvider());
    this.providers.set('salesforce', new SalesforceOAuthProvider());
  }

  async getProviderConfig(provider: OAuthProviderType): Promise<OAuthProviderConfig | null> {
    const { data, error } = await supabase
      .from('oauth_provider_configs')
      .select('*')
      .eq('provider', provider)
      .eq('is_enabled', true)
      .single();

    if (error || !data) {
      console.error(`Failed to get provider config for ${provider}:`, error);
      return null;
    }

    return data;
  }

  generateState(provider: OAuthProviderType, redirectUrl: string = ''): string {
    const state = {
      provider,
      redirectUrl,
      timestamp: Date.now(),
      nonce: crypto.randomUUID()
    };

    const stateString = btoa(JSON.stringify(state));
    this.stateStorage.set(stateString, state);
    
    // Clean up expired states (older than 10 minutes)
    setTimeout(() => {
      this.stateStorage.delete(stateString);
    }, 10 * 60 * 1000);

    return stateString;
  }

  validateState(stateString: string): OAuthState | null {
    const state = this.stateStorage.get(stateString);
    if (!state) return null;

    // Check if state is not expired (10 minutes)
    if (Date.now() - state.timestamp > 10 * 60 * 1000) {
      this.stateStorage.delete(stateString);
      return null;
    }

    return state;
  }

  async initiateOAuthFlow(config: OAuthFlowConfig): Promise<string> {
    const providerConfig = await this.getProviderConfig(config.provider);
    if (!providerConfig) {
      throw new Error(`Provider ${config.provider} is not configured`);
    }

    const provider = this.providers.get(config.provider);
    if (!provider) {
      throw new Error(`Provider ${config.provider} is not supported`);
    }

    const state = this.generateState(config.provider, config.redirectUri || '');
    const redirectUri = config.redirectUri || providerConfig.redirect_uri;

    return provider.getAuthUrl(state, redirectUri, providerConfig);
  }

  async handleOAuthCallback(code: string, state: string): Promise<OAuthToken> {
    const stateData = this.validateState(state);
    if (!stateData) {
      throw new Error('Invalid or expired OAuth state');
    }

    const providerConfig = await this.getProviderConfig(stateData.provider as OAuthProviderType);
    if (!providerConfig) {
      throw new Error(`Provider ${stateData.provider} is not configured`);
    }

    const provider = this.providers.get(stateData.provider);
    if (!provider) {
      throw new Error(`Provider ${stateData.provider} is not supported`);
    }

    // Exchange code for token
    const tokenResponse = await provider.exchangeCodeForToken(code, providerConfig.redirect_uri, providerConfig);
    
    // Get user info
    const userInfo = await provider.getUserInfo(tokenResponse.access_token, providerConfig);

    // Calculate expiration
    const expiresAt = tokenResponse.expires_in 
      ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
      : null;

    // Save token to database
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }

    const tokenData: Omit<OAuthToken, 'id' | 'created_at' | 'updated_at'> = {
      user_id: currentUser.user.id,
      provider: stateData.provider,
      provider_user_id: userInfo.id,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_type: tokenResponse.token_type,
      expires_at: expiresAt ? new Date(expiresAt) : undefined,
      scope: tokenResponse.scope
    };

    const { data, error } = await supabase
      .from('oauth_tokens')
      .upsert(
        {
          ...tokenData,
          expires_at: expiresAt
        },
        { 
          onConflict: 'user_id,provider',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save OAuth token: ${error.message}`);
    }

    // Clean up state
    this.stateStorage.delete(state);

    // Convert string dates back to Date objects for return
    return {
      ...data,
      expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }

  async getStoredToken(provider: OAuthProviderType): Promise<OAuthToken | null> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return null;

    const { data, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', currentUser.user.id)
      .eq('provider', provider)
      .single();

    if (error || !data) return null;

    // Convert string dates back to Date objects
    const token = {
      ...data,
      expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };

    // Check if token is expired and needs refresh
    if (token.expires_at && token.expires_at <= new Date()) {
      return this.refreshStoredToken(token);
    }

    return token;
  }

  async refreshStoredToken(token: OAuthToken): Promise<OAuthToken | null> {
    if (!token.refresh_token) {
      // Token expired and no refresh token available
      await this.revokeToken(token.provider as OAuthProviderType);
      return null;
    }

    const providerConfig = await this.getProviderConfig(token.provider as OAuthProviderType);
    if (!providerConfig) return null;

    const provider = this.providers.get(token.provider);
    if (!provider) return null;

    try {
      const tokenResponse = await provider.refreshToken(token.refresh_token, providerConfig);
      
      const expiresAt = tokenResponse.expires_in 
        ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
        : null;

      const updatedTokenData = {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token || token.refresh_token,
        expires_at: expiresAt,
        scope: tokenResponse.scope || token.scope
      };

      const { data, error } = await supabase
        .from('oauth_tokens')
        .update(updatedTokenData)
        .eq('id', token.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update refreshed token:', error);
        return null;
      }

      // Convert string dates back to Date objects for return
      return {
        ...data,
        expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.revokeToken(token.provider as OAuthProviderType);
      return null;
    }
  }

  async revokeToken(provider: OAuthProviderType): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return;

    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', currentUser.user.id)
      .eq('provider', provider);

    if (error) {
      console.error('Failed to revoke token:', error);
    }
  }

  async getConnectionStatus(provider: OAuthProviderType): Promise<{ connected: boolean; expiresAt?: Date; error?: string }> {
    const token = await this.getStoredToken(provider);
    
    if (!token) {
      return { connected: false };
    }

    if (token.expires_at && new Date(token.expires_at) <= new Date()) {
      return { connected: false, error: 'Token expired' };
    }

    return { 
      connected: true, 
      expiresAt: token.expires_at ? new Date(token.expires_at) : undefined 
    };
  }
}