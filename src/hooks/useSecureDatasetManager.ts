import { useCallback, useRef, useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SavedDataset } from '@/hooks/useDatasets';
import { logger } from '@/lib/logger';

interface DatasetState {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  worksheetName: string;
  datasetId: string;
  datasetName: string;
  isSaved: boolean;
  isLoading: boolean;
  error: string | null;
  lastModified: Date;
  checksum: string;
}

interface DataIntegrityCheck {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export const useSecureDatasetManager = () => {
  const [datasetState, setDatasetState] = useState<DatasetState>({
    data: [],
    columns: [],
    fileName: '',
    worksheetName: '',
    datasetId: '',
    datasetName: '',
    isSaved: false,
    isLoading: false,
    error: null,
    lastModified: new Date(),
    checksum: '',
  });

  const dataRef = useRef<DataRow[]>([]);
  const columnsRef = useRef<ColumnInfo[]>([]);

  // Generate a simple checksum for data integrity verification
  const generateChecksum = useCallback((data: DataRow[], columns: ColumnInfo[]): string => {
    const dataString = JSON.stringify({ data: data.slice(0, 100), columns }); // Sample for checksum
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }, []);

  // Validate data integrity
  const validateDataIntegrity = useCallback((data: DataRow[], columns: ColumnInfo[]): DataIntegrityCheck => {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic validation
      if (!Array.isArray(data)) {
        issues.push('Data is not an array');
      }

      if (!Array.isArray(columns)) {
        issues.push('Columns is not an array');
      }

      if (data.length === 0) {
        warnings.push('Dataset is empty');
      }

      if (columns.length === 0) {
        warnings.push('No columns defined');
      }

      // Check column consistency
      if (data.length > 0 && columns.length > 0) {
        const firstRow = data[0];
        const dataKeys = Object.keys(firstRow || {});
        const columnNames = columns.map(col => col.name);

        // Check for missing columns in data
        for (const colName of columnNames) {
          if (!dataKeys.includes(colName)) {
            issues.push(`Column '${colName}' defined but not found in data`);
          }
        }

        // Check for extra data keys not in columns
        for (const dataKey of dataKeys) {
          if (!columnNames.includes(dataKey)) {
            warnings.push(`Data key '${dataKey}' found but not defined in columns`);
          }
        }
      }

      // Check for null/undefined values in critical columns
      const criticalColumns = columns.filter(col => col.type === 'numeric' || col.type === 'date');
      criticalColumns.forEach(col => {
        const nullCount = data.filter(row => row[col.name] == null).length;
        if (nullCount > data.length * 0.5) {
          warnings.push(`Column '${col.name}' has ${nullCount} null values (${Math.round(nullCount / data.length * 100)}%)`);
        }
      });

      // Check for extremely large datasets
      if (data.length > 50000) {
        warnings.push(`Large dataset with ${data.length} rows may impact performance`);
      }

      if (columns.length > 100) {
        warnings.push(`Many columns (${columns.length}) may impact performance`);
      }

    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }, []);

  // Load dataset with validation and state management
  const loadDataset = useCallback(async (
    data: DataRow[], 
    columns: ColumnInfo[], 
    fileName: string, 
    worksheetName?: string,
    datasetId?: string,
    datasetName?: string
  ) => {
    setDatasetState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Validate data integrity
      const integrity = validateDataIntegrity(data, columns);
      
      if (!integrity.isValid) {
        throw new Error(`Data integrity issues: ${integrity.issues.join(', ')}`);
      }

      if (integrity.warnings.length > 0) {
        logger.warn('Dataset loaded with warnings', { 
          warnings: integrity.warnings,
          fileName,
          rowCount: data.length,
          columnCount: columns.length
        });
      }

      // Generate checksum for integrity tracking
      const checksum = generateChecksum(data, columns);

      // Update refs for comparison
      dataRef.current = [...data];
      columnsRef.current = [...columns];

      // Update state
      const newState: Partial<DatasetState> = {
        data: [...data], // Create new array to prevent mutations
        columns: [...columns], // Create new array to prevent mutations
        fileName,
        worksheetName: worksheetName || '',
        datasetId: datasetId || '',
        datasetName: datasetName || '',
        isSaved: !!datasetId,
        isLoading: false,
        error: null,
        lastModified: new Date(),
        checksum,
      };

      setDatasetState(prev => ({ ...prev, ...newState }));

      logger.info('Dataset loaded successfully', {
        fileName,
        worksheetName,
        datasetId,
        rowCount: data.length,
        columnCount: columns.length,
        checksum,
        warnings: integrity.warnings.length
      });

      return { success: true, warnings: integrity.warnings };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setDatasetState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));

      logger.error('Failed to load dataset', {
        error: errorMessage,
        fileName,
        worksheetName,
        datasetId
      });

      return { success: false, error: errorMessage };
    }
  }, [validateDataIntegrity, generateChecksum]);

  // Load saved dataset
  const loadSavedDataset = useCallback(async (dataset: SavedDataset) => {
    return loadDataset(
      dataset.data,
      dataset.columns,
      dataset.file_name,
      dataset.worksheet_name || undefined,
      dataset.id,
      dataset.name
    );
  }, [loadDataset]);

  // Check if current data has been modified
  const hasDataChanged = useCallback((): boolean => {
    if (datasetState.data.length !== dataRef.current.length || 
        datasetState.columns.length !== columnsRef.current.length) {
      return true;
    }

    const currentChecksum = generateChecksum(datasetState.data, datasetState.columns);
    return currentChecksum !== datasetState.checksum;
  }, [datasetState.data, datasetState.columns, datasetState.checksum, generateChecksum]);

  // Update column type with validation
  const updateColumnType = useCallback((
    columnName: string, 
    newType: 'numeric' | 'date' | 'categorical' | 'text'
  ) => {
    try {
      const updatedColumns = datasetState.columns.map(col =>
        col.name === columnName ? { ...col, type: newType } : col
      );

      // Validate the change
      const integrity = validateDataIntegrity(datasetState.data, updatedColumns);
      
      if (!integrity.isValid) {
        throw new Error(`Column type change would cause issues: ${integrity.issues.join(', ')}`);
      }

      const checksum = generateChecksum(datasetState.data, updatedColumns);

      setDatasetState(prev => ({
        ...prev,
        columns: updatedColumns,
        lastModified: new Date(),
        checksum,
        isSaved: false // Mark as unsaved after modification
      }));

      logger.info('Column type updated', {
        columnName,
        newType,
        datasetId: datasetState.datasetId
      });

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Failed to update column type', {
        error: errorMessage,
        columnName,
        newType
      });

      return { success: false, error: errorMessage };
    }
  }, [datasetState.data, datasetState.columns, datasetState.datasetId, validateDataIntegrity, generateChecksum]);

  // Clear dataset
  const clearDataset = useCallback(() => {
    setDatasetState({
      data: [],
      columns: [],
      fileName: '',
      worksheetName: '',
      datasetId: '',
      datasetName: '',
      isSaved: false,
      isLoading: false,
      error: null,
      lastModified: new Date(),
      checksum: '',
    });

    dataRef.current = [];
    columnsRef.current = [];

    logger.info('Dataset cleared');
  }, []);

  // Mark as saved
  const markAsSaved = useCallback((datasetId: string, datasetName: string) => {
    setDatasetState(prev => ({
      ...prev,
      datasetId,
      datasetName,
      isSaved: true,
      lastModified: new Date()
    }));

    logger.info('Dataset marked as saved', { datasetId, datasetName });
  }, []);

  return {
    // State
    datasetState,
    
    // Actions
    loadDataset,
    loadSavedDataset,
    updateColumnType,
    clearDataset,
    markAsSaved,
    
    // Utilities
    hasDataChanged,
    validateDataIntegrity: () => validateDataIntegrity(datasetState.data, datasetState.columns),
  };
};