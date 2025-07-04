import { OAuthProvider, OAuthTokenResponse, OAuthUserInfo, OAuthProviderConfig } from '@/types/oauth';

export class SalesforceOAuthProvider implements OAuthProvider {
  getAuthUrl(state: string, redirectUri: string, config: OAuthProviderConfig): string {
    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope,
      state,
    });

    return `${config.auth_url}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string, config: OAuthProviderConfig): Promise<OAuthTokenResponse> {
    const response = await fetch(config.token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.client_id,
        client_secret: config.client_secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in,
      scope: data.scope
    };
  }

  async refreshToken(refreshToken: string, config: OAuthProviderConfig): Promise<OAuthTokenResponse> {
    const response = await fetch(config.token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.client_id,
        client_secret: config.client_secret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in,
      scope: data.scope
    };
  }

  async getUserInfo(accessToken: string, config?: OAuthProviderConfig): Promise<OAuthUserInfo> {
    // For Salesforce, we need to get the identity URL from the token response
    // This is a simplified version - in practice, you'd get this from the token response
    const response = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    const data = await response.json();
    return {
      id: data.user_id,
      email: data.email,
      name: data.name,
      picture: data.picture
    };
  }

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}