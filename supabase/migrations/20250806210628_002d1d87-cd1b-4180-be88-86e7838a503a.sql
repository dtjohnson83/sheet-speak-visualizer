-- Create table for storing user feedback on column type corrections
CREATE TABLE public.column_type_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  column_name TEXT NOT NULL,
  original_type TEXT NOT NULL,
  corrected_type TEXT NOT NULL,
  column_context JSONB NOT NULL DEFAULT '{}', -- stores column name patterns, sample values, etc.
  dataset_name TEXT,
  confidence_score NUMERIC DEFAULT 0.0,
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.column_type_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for user feedback
CREATE POLICY "Users can create their own feedback" 
ON public.column_type_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.column_type_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.column_type_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_column_type_feedback_user_id ON public.column_type_feedback(user_id);
CREATE INDEX idx_column_type_feedback_column_patterns ON public.column_type_feedback USING GIN(column_context);
CREATE INDEX idx_column_type_feedback_corrections ON public.column_type_feedback(original_type, corrected_type);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_column_type_feedback_updated_at
BEFORE UPDATE ON public.column_type_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for storing learned classification rules
CREATE TABLE public.classification_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'column_name_pattern', 'value_pattern', 'context_based'
  pattern TEXT NOT NULL,
  target_type TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 1.0,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  created_from_feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for classification rules
ALTER TABLE public.classification_rules ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read rules
CREATE POLICY "Authenticated users can read classification rules" 
ON public.classification_rules 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create trigger for classification rules timestamps
CREATE TRIGGER update_classification_rules_updated_at
BEFORE UPDATE ON public.classification_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();