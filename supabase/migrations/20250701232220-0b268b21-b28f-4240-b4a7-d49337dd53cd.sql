-- Add policy to allow self-promotion when no admins exist
CREATE POLICY "Allow self-promotion when no admins exist" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'admin' 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
);