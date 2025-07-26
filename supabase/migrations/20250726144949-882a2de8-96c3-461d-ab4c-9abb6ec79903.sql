-- Fix critical security issues

-- 1. Add RLS policies for quality_trends table
CREATE POLICY "Users can view quality trends for their agents" 
ON public.quality_trends 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM ai_agents 
    WHERE ai_agents.id = quality_trends.agent_id 
    AND ai_agents.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert quality trends" 
ON public.quality_trends 
FOR INSERT 
WITH CHECK (true);

-- 2. Fix function search path vulnerabilities
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE 
      WHEN role = 'admin' THEN 1
      WHEN role = 'user' THEN 2
      ELSE 3
    END
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;