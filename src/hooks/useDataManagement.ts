import { useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SavedDataset } from '@/hooks/useDatasets';
import { useEnhancedAIContext } from '@/hooks/useEnhancedAIContext';

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

  const handleDataLoaded = (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => {
    console.log('Data loaded:', { loadedData, detectedColumns, name, worksheet });
    setData(loadedData);
    setColumns(detectedColumns);
    setFileName(name);
    setWorksheetName(worksheet || '');
    setShowContextSetup(true);
    clearContext();
  };

  const handleColumnTypeChange = (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => {
    setColumns(prevColumns => {
      return prevColumns.map(col => {
        if (col.name === columnName) {
          return { ...col, type: newType };
        }
        return col;
      });
    });
  };

  const handleLoadDataset = (dataset: SavedDataset) => {
    console.log('Loading dataset:', dataset);
    setData(dataset.data);
    setColumns(dataset.columns);
    setFileName(dataset.file_name);
    setWorksheetName(dataset.worksheet_name || '');
    setCurrentDatasetId(dataset.id);
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
  };
};