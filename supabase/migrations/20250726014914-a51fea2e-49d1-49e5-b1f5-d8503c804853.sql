-- Create report templates table
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'custom',
  source_dataset_id UUID,
  config JSONB NOT NULL DEFAULT '{}',
  transformations JSONB NOT NULL DEFAULT '[]',
  visualizations JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report schedules table
CREATE TABLE public.report_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  frequency TEXT NOT NULL,
  schedule_time TIME,
  timezone TEXT DEFAULT 'UTC',
  recipients JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report executions table
CREATE TABLE public.report_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  schedule_id UUID,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  file_path TEXT,
  file_size BIGINT,
  generation_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create report metrics table
CREATE TABLE public.report_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  total_runs INTEGER NOT NULL DEFAULT 0,
  successful_runs INTEGER NOT NULL DEFAULT 0,
  failed_runs INTEGER NOT NULL DEFAULT 0,
  avg_generation_time_ms INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id)
);

-- Enable RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for report_templates
CREATE POLICY "Users can manage their own report templates"
ON public.report_templates
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for report_schedules
CREATE POLICY "Users can manage their own report schedules"
ON public.report_schedules
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for report_executions
CREATE POLICY "Users can view their own report executions"
ON public.report_executions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for report_metrics
CREATE POLICY "Users can view their own report metrics"
ON public.report_metrics
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create foreign key relationships
ALTER TABLE public.report_schedules
ADD CONSTRAINT fk_report_schedules_template
FOREIGN KEY (template_id) REFERENCES public.report_templates(id) ON DELETE CASCADE;

ALTER TABLE public.report_executions
ADD CONSTRAINT fk_report_executions_template
FOREIGN KEY (template_id) REFERENCES public.report_templates(id) ON DELETE CASCADE;

ALTER TABLE public.report_executions
ADD CONSTRAINT fk_report_executions_schedule
FOREIGN KEY (schedule_id) REFERENCES public.report_schedules(id) ON DELETE SET NULL;

ALTER TABLE public.report_metrics
ADD CONSTRAINT fk_report_metrics_template
FOREIGN KEY (template_id) REFERENCES public.report_templates(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_report_templates_user_id ON public.report_templates(user_id);
CREATE INDEX idx_report_schedules_template_id ON public.report_schedules(template_id);
CREATE INDEX idx_report_schedules_next_run ON public.report_schedules(next_run) WHERE is_active = true;
CREATE INDEX idx_report_executions_template_id ON public.report_executions(template_id);
CREATE INDEX idx_report_executions_status ON public.report_executions(status);

-- Create triggers for updated_at
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_metrics_updated_at
  BEFORE UPDATE ON public.report_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();