
-- Create table for saved datasets
CREATE TABLE public.saved_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  worksheet_name TEXT,
  data JSONB NOT NULL,
  columns JSONB NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for saved dashboards
CREATE TABLE public.saved_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.saved_datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for dashboard tiles
CREATE TABLE public.dashboard_tiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.saved_dashboards(id) ON DELETE CASCADE,
  tile_data JSONB NOT NULL,
  position JSONB NOT NULL,
  size JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for dashboard filters
CREATE TABLE public.dashboard_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.saved_dashboards(id) ON DELETE CASCADE,
  filters JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_datasets
CREATE POLICY "Users can view their own datasets" 
  ON public.saved_datasets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own datasets" 
  ON public.saved_datasets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets" 
  ON public.saved_datasets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" 
  ON public.saved_datasets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for saved_dashboards
CREATE POLICY "Users can view their own dashboards" 
  ON public.saved_dashboards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboards" 
  ON public.saved_dashboards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards" 
  ON public.saved_dashboards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" 
  ON public.saved_dashboards 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for dashboard_tiles
CREATE POLICY "Users can view tiles from their own dashboards" 
  ON public.dashboard_tiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_tiles.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tiles in their own dashboards" 
  ON public.dashboard_tiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_tiles.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tiles in their own dashboards" 
  ON public.dashboard_tiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_tiles.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tiles from their own dashboards" 
  ON public.dashboard_tiles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_tiles.dashboard_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for dashboard_filters
CREATE POLICY "Users can view filters from their own dashboards" 
  ON public.dashboard_filters 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_filters.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create filters in their own dashboards" 
  ON public.dashboard_filters 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_filters.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update filters in their own dashboards" 
  ON public.dashboard_filters 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_filters.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete filters from their own dashboards" 
  ON public.dashboard_filters 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_dashboards 
      WHERE id = dashboard_filters.dashboard_id 
      AND user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_saved_datasets_user_id ON public.saved_datasets(user_id);
CREATE INDEX idx_saved_dashboards_user_id ON public.saved_dashboards(user_id);
CREATE INDEX idx_saved_dashboards_dataset_id ON public.saved_dashboards(dataset_id);
CREATE INDEX idx_dashboard_tiles_dashboard_id ON public.dashboard_tiles(dashboard_id);
CREATE INDEX idx_dashboard_filters_dashboard_id ON public.dashboard_filters(dashboard_id);
