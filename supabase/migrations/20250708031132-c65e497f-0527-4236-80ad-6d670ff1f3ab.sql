-- Enhanced Data Modeling Database Schema Extensions
-- Add support for enhanced dataset metadata and quality tracking

-- Create enum for semantic types
CREATE TYPE semantic_type AS ENUM ('identifier', 'measure', 'dimension', 'temporal', 'geospatial');

-- Create enum for storage types
CREATE TYPE storage_type AS ENUM ('jsonb', 'columnar', 'hybrid');

-- Create enum for access patterns
CREATE TYPE access_pattern AS ENUM ('hot', 'warm', 'cold');

-- Create enhanced datasets table for extended metadata
CREATE TABLE public.enhanced_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    base_dataset_id UUID NOT NULL,
    
    -- Schema information
    schema_version INTEGER DEFAULT 1,
    schema_checksum TEXT NOT NULL,
    
    -- Quality metrics
    completeness_score NUMERIC(3,2) DEFAULT 0,
    validity_score NUMERIC(3,2) DEFAULT 0,
    consistency_score NUMERIC(3,2) DEFAULT 0,
    accuracy_score NUMERIC(3,2) DEFAULT 0,
    overall_quality_score NUMERIC(3,2) DEFAULT 0,
    quality_issues JSONB DEFAULT '[]'::jsonb,
    quality_recommendations JSONB DEFAULT '[]'::jsonb,
    last_quality_assessment TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Storage optimization
    storage_type storage_type DEFAULT 'jsonb',
    compression_level INTEGER DEFAULT 0,
    indexed_columns TEXT[] DEFAULT '{}',
    
    -- Access pattern and caching
    access_pattern access_pattern DEFAULT 'warm',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
    access_count INTEGER DEFAULT 0,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    FOREIGN KEY (base_dataset_id) REFERENCES saved_datasets(id) ON DELETE CASCADE
);

-- Create enhanced columns table for extended column metadata
CREATE TABLE public.enhanced_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enhanced_dataset_id UUID NOT NULL,
    column_name TEXT NOT NULL,
    
    -- Enhanced metadata
    semantic_type semantic_type,
    display_name TEXT,
    description TEXT,
    unit TEXT,
    format_pattern TEXT,
    
    -- Statistics
    min_value NUMERIC,
    max_value NUMERIC,
    mean_value NUMERIC,
    median_value NUMERIC,
    mode_value TEXT,
    null_count INTEGER DEFAULT 0,
    unique_count INTEGER DEFAULT 0,
    outlier_count INTEGER DEFAULT 0,
    value_distribution JSONB DEFAULT '{}'::jsonb,
    
    -- Quality information
    quality_score NUMERIC(3,2) DEFAULT 0,
    quality_issues TEXT[] DEFAULT '{}',
    
    -- Constraints
    constraints JSONB DEFAULT '[]'::jsonb,
    
    -- Version tracking
    column_version INTEGER DEFAULT 1,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    FOREIGN KEY (enhanced_dataset_id) REFERENCES enhanced_datasets(id) ON DELETE CASCADE,
    UNIQUE(enhanced_dataset_id, column_name)
);

-- Create dataset relationships table
CREATE TABLE public.dataset_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_dataset_id UUID NOT NULL,
    source_column TEXT NOT NULL,
    target_dataset_id UUID NOT NULL,
    target_column TEXT NOT NULL,
    
    -- Relationship metadata
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('one-to-one', 'one-to-many', 'many-to-one', 'many-to-many')),
    confidence_score NUMERIC(3,2) DEFAULT 0,
    evidence_type TEXT,
    evidence JSONB DEFAULT '[]'::jsonb,
    
    -- Discovery and validation
    discovered BOOLEAN DEFAULT false,
    validated BOOLEAN DEFAULT false,
    validated_by UUID,
    validated_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    FOREIGN KEY (source_dataset_id) REFERENCES enhanced_datasets(id) ON DELETE CASCADE,
    FOREIGN KEY (target_dataset_id) REFERENCES enhanced_datasets(id) ON DELETE CASCADE,
    UNIQUE(source_dataset_id, source_column, target_dataset_id, target_column)
);

-- Create dataset versions table for schema evolution tracking
CREATE TABLE public.dataset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enhanced_dataset_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    
    -- Version metadata
    changes TEXT[] DEFAULT '{}',
    schema_snapshot JSONB NOT NULL,
    row_count INTEGER DEFAULT 0,
    checksum TEXT NOT NULL,
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID NOT NULL,
    
    FOREIGN KEY (enhanced_dataset_id) REFERENCES enhanced_datasets(id) ON DELETE CASCADE,
    UNIQUE(enhanced_dataset_id, version_number)
);

-- Enable RLS on all new tables
ALTER TABLE public.enhanced_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced_datasets
CREATE POLICY "Users can create their own enhanced datasets"
ON public.enhanced_datasets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own enhanced datasets"
ON public.enhanced_datasets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced datasets"
ON public.enhanced_datasets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enhanced datasets"
ON public.enhanced_datasets
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for enhanced_columns
CREATE POLICY "Users can manage columns in their enhanced datasets"
ON public.enhanced_columns
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM enhanced_datasets 
        WHERE id = enhanced_columns.enhanced_dataset_id 
        AND user_id = auth.uid()
    )
);

-- RLS Policies for dataset_relationships
CREATE POLICY "Users can manage relationships for their datasets"
ON public.dataset_relationships
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM enhanced_datasets 
        WHERE id = dataset_relationships.source_dataset_id 
        AND user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM enhanced_datasets 
        WHERE id = dataset_relationships.target_dataset_id 
        AND user_id = auth.uid()
    )
);

-- RLS Policies for dataset_versions
CREATE POLICY "Users can manage versions of their enhanced datasets"
ON public.dataset_versions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM enhanced_datasets 
        WHERE id = dataset_versions.enhanced_dataset_id 
        AND user_id = auth.uid()
    )
);

-- Create indexes for better performance
CREATE INDEX idx_enhanced_datasets_user_id ON enhanced_datasets(user_id);
CREATE INDEX idx_enhanced_datasets_base_dataset_id ON enhanced_datasets(base_dataset_id);
CREATE INDEX idx_enhanced_datasets_quality_score ON enhanced_datasets(overall_quality_score);
CREATE INDEX idx_enhanced_datasets_access_pattern ON enhanced_datasets(access_pattern);
CREATE INDEX idx_enhanced_datasets_last_accessed ON enhanced_datasets(last_accessed);

CREATE INDEX idx_enhanced_columns_dataset_id ON enhanced_columns(enhanced_dataset_id);
CREATE INDEX idx_enhanced_columns_semantic_type ON enhanced_columns(semantic_type);
CREATE INDEX idx_enhanced_columns_quality_score ON enhanced_columns(quality_score);

CREATE INDEX idx_dataset_relationships_source ON dataset_relationships(source_dataset_id, source_column);
CREATE INDEX idx_dataset_relationships_target ON dataset_relationships(target_dataset_id, target_column);
CREATE INDEX idx_dataset_relationships_confidence ON dataset_relationships(confidence_score);
CREATE INDEX idx_dataset_relationships_discovered ON dataset_relationships(discovered, validated);

CREATE INDEX idx_dataset_versions_dataset_id ON dataset_versions(enhanced_dataset_id);
CREATE INDEX idx_dataset_versions_number ON dataset_versions(enhanced_dataset_id, version_number);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enhanced_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enhanced_datasets_updated_at
    BEFORE UPDATE ON enhanced_datasets
    FOR EACH ROW
    EXECUTE FUNCTION update_enhanced_updated_at_column();

CREATE TRIGGER update_enhanced_columns_updated_at
    BEFORE UPDATE ON enhanced_columns
    FOR EACH ROW
    EXECUTE FUNCTION update_enhanced_updated_at_column();

CREATE TRIGGER update_dataset_relationships_updated_at
    BEFORE UPDATE ON dataset_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_enhanced_updated_at_column();