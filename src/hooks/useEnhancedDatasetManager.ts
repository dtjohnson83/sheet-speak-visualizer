// Enhanced Dataset Manager Hook - Main interface for enhanced data modeling
import { useState, useCallback, useEffect } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { 
  EnhancedDataset, 
  CompatibleDataset, 
  DataQualityProfile,
  DatasetSchema,
  DatasetRelationship,
  CacheStrategy
} from '@/types/dataModel';
import { EnhancedColumnDetector } from '@/lib/dataModel/enhancedColumnDetection';
import { DataQualityEngine } from '@/lib/dataModel/dataQualityEngine';
import { RelationshipDiscoveryEngine } from '@/lib/dataModel/relationshipDiscovery';
import { useSecureDatasetManager } from './useSecureDatasetManager';
import { logger } from '@/lib/logger';

interface EnhancedDatasetState {
  datasets: Map<string, CompatibleDataset>;
  currentDataset: CompatibleDataset | null;
  qualityProfiles: Map<string, DataQualityProfile>;
  discoveredRelationships: DatasetRelationship[];
  cacheStrategy: CacheStrategy;
  isAnalyzing: boolean;
  analysisProgress: number;
}

export const useEnhancedDatasetManager = () => {
  const secureManager = useSecureDatasetManager();
  
  const [enhancedState, setEnhancedState] = useState<EnhancedDatasetState>({
    datasets: new Map(),
    currentDataset: null,
    qualityProfiles: new Map(),
    discoveredRelationships: [],
    cacheStrategy: {
      hotDataMemoryLimit: 50, // MB
      warmDataLocalLimit: 200, // MB
      coldDataRemoteOnly: true,
      ttl: {
        hot: 30, // minutes
        warm: 6, // hours
        cold: 24 // hours
      }
    },
    isAnalyzing: false,
    analysisProgress: 0
  });

  // Enhanced dataset loading with full analysis
  const loadEnhancedDataset = useCallback(async (
    data: DataRow[],
    columns: ColumnInfo[],
    fileName: string,
    worksheetName?: string,
    datasetId?: string,
    datasetName?: string
  ) => {
    setEnhancedState(prev => ({ ...prev, isAnalyzing: true, analysisProgress: 0 }));
    
    try {
      // Step 1: Basic loading using secure manager
      setEnhancedState(prev => ({ ...prev, analysisProgress: 10 }));
      
      const basicResult = await secureManager.loadDataset(
        data, columns, fileName, worksheetName, datasetId, datasetName
      );
      
      if (!basicResult.success) {
        throw new Error(basicResult.error || 'Failed to load basic dataset');
      }
      
      // Step 2: Enhanced column analysis
      setEnhancedState(prev => ({ ...prev, analysisProgress: 30 }));
      
      const columnAnalysis = EnhancedColumnDetector.analyzeDataset(data);
      const enhancedColumns = columnAnalysis.map(analysis => analysis.column);
      
      // Step 3: Data quality assessment
      setEnhancedState(prev => ({ ...prev, analysisProgress: 50 }));
      
      const qualityProfile = DataQualityEngine.assessDatasetQuality(data, enhancedColumns);
      
      // Step 4: Create enhanced dataset schema
      setEnhancedState(prev => ({ ...prev, analysisProgress: 70 }));
      
      const schema: DatasetSchema = {
        version: 1,
        columns: enhancedColumns,
        relationships: [],
        qualityProfile,
        created: new Date(),
        modified: new Date(),
        checksum: generateDatasetChecksum(data, enhancedColumns)
      };
      
      // Step 5: Create compatible dataset
      setEnhancedState(prev => ({ ...prev, analysisProgress: 80 }));
      
      const compatibleDataset: CompatibleDataset = {
        id: datasetId || generateDatasetId(),
        name: datasetName || fileName,
        description: `Enhanced dataset with ${data.length} rows and ${enhancedColumns.length} columns`,
        data,
        columns,
        enhanced: {
          schema,
          qualityProfile,
          relationships: [],
          storageOptimization: {
            type: data.length > 10000 ? 'hybrid' : 'jsonb',
            compression: data.length > 50000 ? 2 : 0
          },
          caching: {
            pattern: determineAccessPattern(data.length, qualityProfile.overallScore),
            lastAccessed: new Date()
          }
        }
      };
      
      // Step 6: Update state
      setEnhancedState(prev => ({
        ...prev,
        currentDataset: compatibleDataset,
        analysisProgress: 90
      }));
      
      // Step 7: Store in datasets map
      setEnhancedState(prev => {
        const newDatasets = new Map(prev.datasets);
        const newQualityProfiles = new Map(prev.qualityProfiles);
        
        newDatasets.set(compatibleDataset.id, compatibleDataset);
        newQualityProfiles.set(compatibleDataset.id, qualityProfile);
        
        return {
          ...prev,
          datasets: newDatasets,
          qualityProfiles: newQualityProfiles,
          analysisProgress: 100,
          isAnalyzing: false
        };
      });
      
      logger.info('Enhanced dataset loaded successfully', {
        datasetId: compatibleDataset.id,
        rowCount: data.length,
        columnCount: enhancedColumns.length,
        qualityScore: qualityProfile.overallScore,
        storageType: compatibleDataset.enhanced?.storageOptimization?.type
      });
      
      return { success: true, dataset: compatibleDataset };
      
    } catch (error) {
      setEnhancedState(prev => ({ ...prev, isAnalyzing: false, analysisProgress: 0 }));
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to load enhanced dataset', { error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  }, [secureManager]);

  // Discover relationships between loaded datasets
  const discoverRelationships = useCallback(async () => {
    const datasets = Array.from(enhancedState.datasets.values())
      .filter(dataset => dataset.enhanced?.schema)
      .map(dataset => ({
        id: dataset.id,
        name: dataset.name,
        data: dataset.data,
        columns: dataset.enhanced!.schema!.columns
      }));
    
    if (datasets.length < 2) {
      logger.warn('Need at least 2 datasets to discover relationships');
      return { success: false, error: 'Need at least 2 datasets' };
    }
    
    try {
      const relationshipCandidates = RelationshipDiscoveryEngine.discoverRelationships(datasets);
      
      // Convert candidates to confirmed relationships (with confidence threshold)
      const confirmedRelationships = relationshipCandidates
        .filter(candidate => candidate.confidence >= 70)
        .map(candidate => ({
          sourceColumn: candidate.sourceColumn,
          targetDatasetId: candidate.targetDatasetId,
          targetColumn: candidate.targetColumn,
          type: candidate.suggestedType,
          confidence: candidate.confidence,
          discovered: true,
          validated: false
        }));
      
      setEnhancedState(prev => ({
        ...prev,
        discoveredRelationships: confirmedRelationships
      }));
      
      logger.info('Relationships discovered', {
        candidatesFound: relationshipCandidates.length,
        relationshipsConfirmed: confirmedRelationships.length
      });
      
      return { 
        success: true, 
        candidates: relationshipCandidates,
        confirmed: confirmedRelationships
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to discover relationships', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [enhancedState.datasets]);

  // Update column type with enhanced validation
  const updateColumnType = useCallback(async (
    datasetId: string,
    columnName: string,
    newType: 'numeric' | 'date' | 'categorical' | 'text'
  ) => {
    const dataset = enhancedState.datasets.get(datasetId);
    if (!dataset || !dataset.enhanced?.schema) {
      return { success: false, error: 'Dataset not found or not enhanced' };
    }
    
    try {
      // Update basic column type using secure manager
      const basicResult = secureManager.updateColumnType(columnName, newType);
      if (!basicResult.success) {
        return basicResult;
      }
      
      // Re-analyze the column with new type
      const columnAnalysis = EnhancedColumnDetector.analyzeColumn(columnName, dataset.data);
      const updatedColumn = { ...columnAnalysis.column, type: newType };
      
      // Update enhanced schema
      const updatedSchema = {
        ...dataset.enhanced.schema,
        columns: dataset.enhanced.schema.columns.map(col =>
          col.name === columnName ? updatedColumn : col
        ),
        modified: new Date(),
        version: dataset.enhanced.schema.version + 1
      };
      
      // Re-assess quality with updated schema
      const qualityProfile = DataQualityEngine.assessDatasetQuality(
        dataset.data, 
        updatedSchema.columns
      );
      
      // Update dataset
      const updatedDataset: CompatibleDataset = {
        ...dataset,
        enhanced: {
          ...dataset.enhanced,
          schema: updatedSchema,
          qualityProfile
        }
      };
      
      setEnhancedState(prev => {
        const newDatasets = new Map(prev.datasets);
        const newQualityProfiles = new Map(prev.qualityProfiles);
        
        newDatasets.set(datasetId, updatedDataset);
        newQualityProfiles.set(datasetId, qualityProfile);
        
        return {
          ...prev,
          datasets: newDatasets,
          qualityProfiles: newQualityProfiles,
          currentDataset: prev.currentDataset?.id === datasetId ? updatedDataset : prev.currentDataset
        };
      });
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [enhancedState.datasets, secureManager]);

  // Get dataset by ID
  const getDataset = useCallback((datasetId: string): CompatibleDataset | null => {
    return enhancedState.datasets.get(datasetId) || null;
  }, [enhancedState.datasets]);

  // Get quality profile for dataset
  const getQualityProfile = useCallback((datasetId: string): DataQualityProfile | null => {
    return enhancedState.qualityProfiles.get(datasetId) || null;
  }, [enhancedState.qualityProfiles]);

  // Clear all enhanced data
  const clearEnhancedData = useCallback(() => {
    setEnhancedState({
      datasets: new Map(),
      currentDataset: null,
      qualityProfiles: new Map(),
      discoveredRelationships: [],
      cacheStrategy: enhancedState.cacheStrategy,
      isAnalyzing: false,
      analysisProgress: 0
    });
    secureManager.clearDataset();
  }, [secureManager, enhancedState.cacheStrategy]);

  return {
    // Enhanced state
    currentDataset: enhancedState.currentDataset,
    allDatasets: Array.from(enhancedState.datasets.values()),
    discoveredRelationships: enhancedState.discoveredRelationships,
    isAnalyzing: enhancedState.isAnalyzing,
    analysisProgress: enhancedState.analysisProgress,
    
    // Enhanced actions
    loadEnhancedDataset,
    discoverRelationships,
    updateColumnType,
    clearEnhancedData,
    
    // Utility functions
    getDataset,
    getQualityProfile,
    
    // Compatibility with existing code
    datasetState: secureManager.datasetState,
    hasDataChanged: secureManager.hasDataChanged,
    validateDataIntegrity: secureManager.validateDataIntegrity
  };
};

// Helper functions
function generateDatasetId(): string {
  return `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateDatasetChecksum(data: DataRow[], columns: any[]): string {
  const dataString = JSON.stringify({ 
    rowCount: data.length, 
    columnCount: columns.length,
    sample: data.slice(0, 10)
  });
  
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function determineAccessPattern(
  rowCount: number, 
  qualityScore: number
): 'hot' | 'warm' | 'cold' {
  // High quality, recent data is "hot"
  if (qualityScore > 0.8 && rowCount < 10000) return 'hot';
  
  // Medium size or quality is "warm"
  if (rowCount < 100000 && qualityScore > 0.6) return 'warm';
  
  // Large or poor quality data is "cold"
  return 'cold';
}