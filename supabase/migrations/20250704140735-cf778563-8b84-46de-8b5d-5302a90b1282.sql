-- Create tables for automated alerts system

-- Alert configuration table
CREATE TABLE public.agent_alert_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'data_quality', 'anomaly', 'trend', 'system'
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  severity_threshold TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  cooldown_minutes INTEGER NOT NULL DEFAULT 60,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  webhook_enabled BOOLEAN NOT NULL DEFAULT false,
  webhook_url TEXT,
  thresholds JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alert history table
CREATE TABLE public.alert_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES public.agent_insights(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_channels JSONB NOT NULL DEFAULT '[]', -- ['email', 'webhook']
  delivery_status JSONB NOT NULL DEFAULT '{}', -- {email: 'sent', webhook: 'failed'}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- User alert preferences table
CREATE TABLE public.user_alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  email_frequency TEXT NOT NULL DEFAULT 'immediate', -- 'immediate', 'hourly', 'daily'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_alert_configs
CREATE POLICY "Users can manage alert configs for their agents"
ON public.agent_alert_configs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_alert_configs.agent_id 
  AND ai_agents.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_alert_configs.agent_id 
  AND ai_agents.user_id = auth.uid()
));

-- RLS policies for alert_notifications
CREATE POLICY "Users can view alert notifications for their agents"
ON public.alert_notifications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = alert_notifications.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "System can create alert notifications"
ON public.alert_notifications
FOR INSERT
WITH CHECK (true);

-- RLS policies for user_alert_preferences
CREATE POLICY "Users can manage their own alert preferences"
ON public.user_alert_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_agent_alert_configs_updated_at
BEFORE UPDATE ON public.agent_alert_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_alert_preferences_updated_at
BEFORE UPDATE ON public.user_alert_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default alert preferences for existing users
INSERT INTO public.user_alert_preferences (user_id)
SELECT DISTINCT user_id FROM public.ai_agents
ON CONFLICT (user_id) DO NOTHING;