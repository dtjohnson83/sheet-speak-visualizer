-- Create OAuth tokens table for secure token storage
CREATE TABLE public.oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OAuth provider configurations table
CREATE TABLE public.oauth_provider_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  auth_url TEXT NOT NULL,
  token_url TEXT NOT NULL,
  scope TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_provider_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for oauth_tokens
CREATE POLICY "Users can view their own OAuth tokens" 
ON public.oauth_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own OAuth tokens" 
ON public.oauth_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth tokens" 
ON public.oauth_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth tokens" 
ON public.oauth_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for oauth_provider_configs (admin only)
CREATE POLICY "Only admins can manage OAuth provider configs" 
ON public.oauth_provider_configs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_oauth_tokens_updated_at
BEFORE UPDATE ON public.oauth_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_oauth_provider_configs_updated_at
BEFORE UPDATE ON public.oauth_provider_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default OAuth provider configurations
INSERT INTO public.oauth_provider_configs (provider, client_id, client_secret, auth_url, token_url, scope, redirect_uri) VALUES
('google', 'placeholder', 'placeholder', 'https://accounts.google.com/o/oauth2/v2/auth', 'https://oauth2.googleapis.com/token', 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.email', 'http://localhost:3000/auth/callback'),
('microsoft', 'placeholder', 'placeholder', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', 'https://login.microsoftonline.com/common/oauth2/v2.0/token', 'https://graph.microsoft.com/Files.Read offline_access', 'http://localhost:3000/auth/callback'),
('salesforce', 'placeholder', 'placeholder', 'https://login.salesforce.com/services/oauth2/authorize', 'https://login.salesforce.com/services/oauth2/token', 'api refresh_token', 'http://localhost:3000/auth/callback');