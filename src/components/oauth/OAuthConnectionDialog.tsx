import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { OAuthManager } from '@/lib/oauth/OAuthManager';
import { OAuthProviderType } from '@/types/oauth';
import { Chrome, Building, Zap } from 'lucide-react';

interface OAuthConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (provider: OAuthProviderType) => void;
  title?: string;
  description?: string;
  providers?: OAuthProviderType[];
}

const providerInfo = {
  google: {
    name: 'Google',
    description: 'Connect to Google Sheets, Drive, and other Google services',
    icon: <Chrome className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  microsoft: {
    name: 'Microsoft',
    description: 'Connect to Excel Online, OneDrive, and Microsoft Graph',
    icon: <Building className="h-5 w-5" />,
    color: 'bg-blue-600'
  },
  salesforce: {
    name: 'Salesforce',
    description: 'Connect to Salesforce CRM data and APIs',
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-blue-400'
  }
};

export const OAuthConnectionDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess,
  title = "Connect to OAuth Provider",
  description = "Choose a provider to connect your account and access external data sources.",
  providers = ['google', 'microsoft', 'salesforce']
}: OAuthConnectionDialogProps) => {
  const [connecting, setConnecting] = useState<OAuthProviderType | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const oauthManager = OAuthManager.getInstance();

  const handleConnect = async (provider: OAuthProviderType) => {
    setConnecting(provider);
    
    try {
      // Check if already connected
      const status = await oauthManager.getConnectionStatus(provider);
      if (status.connected) {
        toast({
          title: "Already connected",
          description: `You're already connected to ${providerInfo[provider].name}`,
        });
        onSuccess?.(provider);
        onOpenChange(false);
        return;
      }

      // Initiate OAuth flow
      const authUrl = await oauthManager.initiateOAuthFlow({
        provider,
        redirectUri: `${window.location.origin}/auth/oauth/callback`
      });

      // Open OAuth URL in new window
      const popup = window.open(
        authUrl,
        'oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          
          setConnectionStatus(prev => ({ ...prev, [provider]: true }));
          toast({
            title: "Connection successful",
            description: `Successfully connected to ${providerInfo[provider].name}`,
          });
          
          onSuccess?.(provider);
          onOpenChange(false);
        } else if (event.data.type === 'OAUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          
          toast({
            title: "Connection failed",
            description: event.data.error || `Failed to connect to ${providerInfo[provider].name}`,
            variant: "destructive",
          });
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setConnecting(null);
        }
      }, 1000);

    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : `Failed to connect to ${provider}`,
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {providers.map((provider) => {
            const info = providerInfo[provider];
            const isConnecting = connecting === provider;
            const isConnected = connectionStatus[provider];
            
            return (
              <Card 
                key={provider}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  isConnected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => !isConnecting && handleConnect(provider)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${info.color} text-white`}>
                        {info.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{info.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {info.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConnected && (
                        <Badge variant="default" className="text-xs">
                          Connected
                        </Badge>
                      )}
                      {isConnecting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};