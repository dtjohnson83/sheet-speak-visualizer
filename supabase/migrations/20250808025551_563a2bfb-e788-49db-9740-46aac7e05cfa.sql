-- Expand feedback system for multiple feature types
-- Create unified feedback types table
CREATE TABLE public.feedback_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial feedback types
INSERT INTO public.feedback_types (type_name, description) VALUES
('column_classification', 'Feedback on data column type classification'),
('chart_recommendation', 'Feedback on AI chart suggestions and recommendations'),
('ai_insight', 'Feedback on AI-generated insights and analysis quality'),
('domain_context', 'Feedback on domain-specific business intelligence'),
('chart_configuration', 'Feedback on smart chart configuration defaults'),
('user_experience', 'General user experience and interface feedback');

-- Create unified user feedback table
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feedback_type_id UUID NOT NULL REFERENCES public.feedback_types(id),
  feature_context JSONB NOT NULL, -- Context specific to the feature
  feedback_data JSONB NOT NULL, -- The actual feedback content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  session_id TEXT, -- For grouping related feedback
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for feedback_types
CREATE POLICY "Feedback types are viewable by everyone" 
ON public.feedback_types 
FOR SELECT 
USING (true);

-- Policies for user_feedback
CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" 
ON public.user_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.user_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create chart recommendation feedback table
CREATE TABLE public.chart_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chart_suggestion JSONB NOT NULL, -- Original chart suggestion
  user_correction JSONB, -- User's corrected chart configuration
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  chart_type TEXT NOT NULL,
  data_context JSONB, -- Dataset context when suggestion was made
  is_processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chart_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for chart_feedback
CREATE POLICY "Users can view their own chart feedback" 
ON public.chart_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chart feedback" 
ON public.chart_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chart feedback" 
ON public.chart_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create AI insight feedback table
CREATE TABLE public.insight_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'kpi', 'prediction', 'recommendation', etc.
  original_insight JSONB NOT NULL,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
  feedback_text TEXT,
  suggested_improvement TEXT,
  data_context JSONB,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.insight_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for insight_feedback
CREATE POLICY "Users can view their own insight feedback" 
ON public.insight_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insight feedback" 
ON public.insight_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insight feedback" 
ON public.insight_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create learning rules table for chart recommendations
CREATE TABLE public.chart_learning_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'chart_type', 'axis_mapping', 'visualization_style'
  pattern JSONB NOT NULL, -- The pattern to match
  recommendation JSONB NOT NULL, -- The recommended chart configuration
  confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chart_learning_rules ENABLE ROW LEVEL SECURITY;

-- Policies for chart_learning_rules
CREATE POLICY "Chart learning rules are viewable by everyone" 
ON public.chart_learning_rules 
FOR SELECT 
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_user_feedback_updated_at
BEFORE UPDATE ON public.user_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chart_feedback_updated_at
BEFORE UPDATE ON public.chart_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insight_feedback_updated_at
BEFORE UPDATE ON public.insight_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chart_learning_rules_updated_at
BEFORE UPDATE ON public.chart_learning_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_feedback_type ON public.user_feedback(feedback_type_id);
CREATE INDEX idx_user_feedback_user ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_processed ON public.user_feedback(is_processed);
CREATE INDEX idx_chart_feedback_user ON public.chart_feedback(user_id);
CREATE INDEX idx_chart_feedback_type ON public.chart_feedback(chart_type);
CREATE INDEX idx_insight_feedback_user ON public.insight_feedback(user_id);
CREATE INDEX idx_insight_feedback_type ON public.insight_feedback(insight_type);
CREATE INDEX idx_chart_rules_active ON public.chart_learning_rules(is_active);
CREATE INDEX idx_chart_rules_type ON public.chart_learning_rules(rule_type);