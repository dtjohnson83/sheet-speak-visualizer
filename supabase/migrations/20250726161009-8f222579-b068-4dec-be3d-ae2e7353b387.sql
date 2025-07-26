-- Create audit log table for role changes
CREATE TABLE public.user_role_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  promoted_by uuid,
  action text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.user_role_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for audit log (only admins can view)
CREATE POLICY "Admins can view all audit logs" 
ON public.user_role_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs" 
ON public.user_role_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Configure enhanced auth security settings
UPDATE auth.config SET 
  password_min_length = 8,
  password_alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
WHERE true;

-- Add indexes for better performance
CREATE INDEX idx_user_role_audit_log_user_id ON public.user_role_audit_log(user_id);
CREATE INDEX idx_user_role_audit_log_timestamp ON public.user_role_audit_log(timestamp DESC);