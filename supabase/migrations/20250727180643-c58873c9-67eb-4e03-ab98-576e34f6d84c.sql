-- Create business_rules table for configurable business rule monitoring
CREATE TABLE public.business_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  metric_column TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=')),
  threshold_value NUMERIC NOT NULL,
  comparison_type TEXT NOT NULL DEFAULT 'percentage' CHECK (comparison_type IN ('percentage', 'absolute', 'trend')),
  time_window TEXT NOT NULL DEFAULT 'monthly' CHECK (time_window IN ('daily', 'weekly', 'monthly', 'quarterly')),
  baseline_calculation TEXT NOT NULL DEFAULT 'previous_period' CHECK (baseline_calculation IN ('previous_period', 'moving_average', 'fixed_value')),
  alert_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (alert_frequency IN ('immediate', 'daily', 'weekly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_evaluation TIMESTAMP WITH TIME ZONE,
  last_triggered TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for business rules
CREATE POLICY "Users can manage business rules for their agents"
ON public.business_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ai_agents 
    WHERE ai_agents.id = business_rules.agent_id 
    AND ai_agents.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_agents 
    WHERE ai_agents.id = business_rules.agent_id 
    AND ai_agents.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_business_rules_updated_at
BEFORE UPDATE ON public.business_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create business_rule_violations table for tracking rule violations
CREATE TABLE public.business_rule_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES business_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  percentage_change NUMERIC,
  baseline_value NUMERIC,
  violation_severity TEXT NOT NULL DEFAULT 'medium' CHECK (violation_severity IN ('low', 'medium', 'high', 'critical')),
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for violations
ALTER TABLE public.business_rule_violations ENABLE ROW LEVEL SECURITY;

-- Create policy for violations
CREATE POLICY "Users can view their own rule violations"
ON public.business_rule_violations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);