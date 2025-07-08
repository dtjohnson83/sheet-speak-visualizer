import { useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SavedDataset } from '@/hooks/useDatasets';
import { useEnhancedAIContext } from '@/hooks/useEnhancedAIContext';
import { useEnhancedDatasetManager } from '@/hooks/useEnhancedDatasetManager';

export const useDataManagement = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [worksheetName, setWorksheetName] = useState<string>('');
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('');
  const [showContextSetup, setShowContextSetup] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  
  const { setContext, clearContext } = useEnhancedAIContext();
  const enhancedManager = useEnhancedDatasetManager();

  const handleDataLoaded = async (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => {
    console.log('Data loaded:', { loadedData, detectedColumns, name, worksheet });
    
    // Load with enhanced data modeling
    const result = await enhancedManager.loadEnhancedDataset(
      loadedData, 
      detectedColumns, 
      name, 
      worksheet
    );
    
    if (result.success && result.dataset) {
      // Update local state for backward compatibility
      setData(loadedData);
      setColumns(detectedColumns);
      setFileName(name);
      setWorksheetName(worksheet || '');
      setCurrentDatasetId(result.dataset.id);
      setShowContextSetup(true);
      clearContext();
    } else {
      console.error('Failed to load enhanced dataset:', result.error);
      // Fallback to basic loading
      setData(loadedData);
      setColumns(detectedColumns);
      setFileName(name);
      setWorksheetName(worksheet || '');
      setShowContextSetup(true);
      clearContext();
    }
  };

  const handleColumnTypeChange = async (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => {
    // Update enhanced dataset if available
    if (currentDatasetId && enhancedManager.currentDataset) {
      const result = await enhancedManager.updateColumnType(currentDatasetId, columnName, newType);
      if (result.success) {
        // Update local state for UI consistency
        setColumns(prevColumns => {
          return prevColumns.map(col => {
            if (col.name === columnName) {
              return { ...col, type: newType };
            }
            return col;
          });
        });
        return;
      }
    }
    
    // Fallback to basic column type change
    setColumns(prevColumns => {
      return prevColumns.map(col => {
        if (col.name === columnName) {
          return { ...col, type: newType };
        }
        return col;
      });
    });
  };

  const handleLoadDataset = async (dataset: SavedDataset) => {
    console.log('Loading dataset:', dataset);
    
    // Load with enhanced data modeling
    const result = await enhancedManager.loadEnhancedDataset(
      dataset.data,
      dataset.columns,
      dataset.file_name,
      dataset.worksheet_name || undefined,
      dataset.id,
      dataset.name
    );
    
    if (result.success) {
      // Update local state for backward compatibility
      setData(dataset.data);
      setColumns(dataset.columns);
      setFileName(dataset.file_name);
      setWorksheetName(dataset.worksheet_name || '');
      setCurrentDatasetId(dataset.id);
    } else {
      console.error('Failed to load enhanced dataset:', result.error);
      // Fallback to basic loading
      setData(dataset.data);
      setColumns(dataset.columns);
      setFileName(dataset.file_name);
      setWorksheetName(dataset.worksheet_name || '');
      setCurrentDatasetId(dataset.id);
    }
  };

  const handleContextReady = (context: any) => {
    setContext(context);
    setShowContextSetup(false);
  };

  const handleSkipContext = () => {
    setShowContextSetup(false);
  };

  const displayFileName = worksheetName ? `${fileName} - ${worksheetName}` : fileName;

  return {
    // Basic data (backward compatibility)
    data,
    columns,
    fileName,
    worksheetName,
    currentDatasetId,
    showContextSetup,
    selectedDataSource,
    showDataSourceDialog,
    displayFileName,
    setData,
    setColumns,
    handleDataLoaded,
    handleColumnTypeChange,
    handleLoadDataset,
    handleContextReady,
    handleSkipContext,
    setSelectedDataSource,
    setShowDataSourceDialog,
    
    // Enhanced data modeling features
    enhancedDataset: enhancedManager.currentDataset,
    allDatasets: enhancedManager.allDatasets,
    qualityProfile: currentDatasetId ? enhancedManager.getQualityProfile(currentDatasetId) : null,
    discoveredRelationships: enhancedManager.discoveredRelationships,
    isAnalyzing: enhancedManager.isAnalyzing,
    analysisProgress: enhancedManager.analysisProgress,
    discoverRelationships: enhancedManager.discoverRelationships,
  };
};