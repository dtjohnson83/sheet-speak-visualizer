
-- Enable Row Level Security on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS policies for analysis_sessions
CREATE POLICY "Users can view their own analysis sessions" 
  ON public.analysis_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis sessions" 
  ON public.analysis_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis sessions" 
  ON public.analysis_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis sessions" 
  ON public.analysis_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for session_files
CREATE POLICY "Users can view files from their own sessions" 
  ON public.session_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_files.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create files in their own sessions" 
  ON public.session_files 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_files.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in their own sessions" 
  ON public.session_files 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_files.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their own sessions" 
  ON public.session_files 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_files.session_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for session_sheets
CREATE POLICY "Users can view sheets from their own sessions" 
  ON public.session_sheets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_sheets.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sheets in their own sessions" 
  ON public.session_sheets 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_sheets.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sheets in their own sessions" 
  ON public.session_sheets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_sheets.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sheets from their own sessions" 
  ON public.session_sheets 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_sheets.session_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for session_relationships
CREATE POLICY "Users can view relationships from their own sessions" 
  ON public.session_relationships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_relationships.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create relationships in their own sessions" 
  ON public.session_relationships 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_relationships.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update relationships in their own sessions" 
  ON public.session_relationships 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_relationships.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete relationships from their own sessions" 
  ON public.session_relationships 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_sessions 
      WHERE id = session_relationships.session_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for export_history
CREATE POLICY "Users can view their own export history" 
  ON public.export_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export history" 
  ON public.export_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for survey_responses
CREATE POLICY "Users can view their own survey responses" 
  ON public.survey_responses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own survey responses" 
  ON public.survey_responses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own survey responses" 
  ON public.survey_responses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_usage_tracking
CREATE POLICY "Users can view their own usage tracking" 
  ON public.user_usage_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage tracking" 
  ON public.user_usage_tracking 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- System can insert usage tracking for new users (for the trigger)
CREATE POLICY "System can create usage tracking" 
  ON public.user_usage_tracking 
  FOR INSERT 
  WITH CHECK (true);
