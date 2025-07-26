-- Create reports storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', false);

-- Create storage policies for reports bucket
CREATE POLICY "Users can view their own reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own reports" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own reports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);