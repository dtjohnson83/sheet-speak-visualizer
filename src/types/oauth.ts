export interface OAuthToken {
  id?: string;
  user_id: string;
  provider: string;
  provider_user_id?: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at?: Date;
  scope?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface OAuthProviderConfig {
  id?: string;
  provider: string;
  client_id: string;
  client_secret: string;
  auth_url: string;
  token_url: string;
  scope: string;
  redirect_uri: string;
  is_enabled: boolean;
}

export interface OAuthProvider {
  getAuthUrl(state: string, redirectUri: string, config: OAuthProviderConfig): string;
  exchangeCodeForToken(code: string, redirectUri: string, config: OAuthProviderConfig): Promise<OAuthTokenResponse>;
  refreshToken(refreshToken: string, config: OAuthProviderConfig): Promise<OAuthTokenResponse>;
  getUserInfo(accessToken: string, config?: OAuthProviderConfig): Promise<OAuthUserInfo>;
  validateToken(accessToken: string): Promise<boolean>;
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface OAuthState {
  provider: string;
  redirectUrl: string;
  timestamp: number;
  nonce: string;
}

export interface OAuthConnectionStatus {
  provider: string;
  connected: boolean;
  expiresAt?: Date;
  lastRefresh?: Date;
  error?: string;
}

export type OAuthProviderType = 'google' | 'microsoft' | 'salesforce' | 'github';

export interface OAuthFlowConfig {
  provider: OAuthProviderType;
  scopes?: string[];
  redirectUri?: string;
  state?: string;
}