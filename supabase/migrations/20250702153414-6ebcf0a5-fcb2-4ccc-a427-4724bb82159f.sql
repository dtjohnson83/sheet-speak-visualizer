-- Create AI agents and tasks tables for agent framework

-- AI Agents table to store agent configurations
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- monitoring, insight_generation, visualization, anomaly_detection, etc.
  description TEXT,
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  priority INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, error
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent tasks table for work queue and scheduling
CREATE TABLE public.agent_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.saved_datasets(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- analyze_data, generate_insights, create_visualization, detect_anomalies
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent insights table for proactively generated insights
CREATE TABLE public.agent_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.saved_datasets(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- trend, anomaly, correlation, recommendation
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.0, -- 0.00 to 1.00
  priority INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent activity log for monitoring and performance tracking
CREATE TABLE public.agent_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- started, completed, error, configuration_changed
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_agents
CREATE POLICY "Users can view their own agents" 
ON public.ai_agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
ON public.ai_agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
ON public.ai_agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
ON public.ai_agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for agent_tasks
CREATE POLICY "Users can view tasks for their agents" 
ON public.agent_tasks 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_tasks.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "Users can create tasks for their agents" 
ON public.agent_tasks 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_tasks.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "Users can update tasks for their agents" 
ON public.agent_tasks 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_tasks.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "Users can delete tasks for their agents" 
ON public.agent_tasks 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_tasks.agent_id 
  AND ai_agents.user_id = auth.uid()
));

-- RLS policies for agent_insights
CREATE POLICY "Users can view insights from their agents" 
ON public.agent_insights 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_insights.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "Users can create insights from their agents" 
ON public.agent_insights 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_insights.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "Users can update insights from their agents" 
ON public.agent_insights 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_insights.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "Users can delete insights from their agents" 
ON public.agent_insights 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_insights.agent_id 
  AND ai_agents.user_id = auth.uid()
));

-- RLS policies for agent_activity_log
CREATE POLICY "Users can view activity from their agents" 
ON public.agent_activity_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ai_agents 
  WHERE ai_agents.id = agent_activity_log.agent_id 
  AND ai_agents.user_id = auth.uid()
));

CREATE POLICY "System can create activity logs" 
ON public.agent_activity_log 
FOR INSERT 
WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at
BEFORE UPDATE ON public.agent_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_insights_updated_at
BEFORE UPDATE ON public.agent_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add subscription plan limits for agents
ALTER TABLE public.user_usage_tracking 
ADD COLUMN agents_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN max_agents INTEGER NOT NULL DEFAULT 0,
ADD COLUMN active_agents INTEGER NOT NULL DEFAULT 0;