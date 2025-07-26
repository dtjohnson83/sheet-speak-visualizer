import { useState, useCallback, useMemo } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { useDatasets } from '@/hooks/useDatasets';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface SelectedDatasetInfo {
  id: string;
  name: string;
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  worksheetName?: string;
  isUnsaved: boolean;
  rowCount: number;
  columnCount: number;
}

export interface DatasetSelectionHook {
  selectedDatasetId: string | null;
  selectedDataset: SelectedDatasetInfo | null;
  availableDatasets: SelectedDatasetInfo[];
  selectDataset: (datasetId: string) => void;
  hasDatasets: boolean;
  isCurrentDataset: boolean;
}

export const useDatasetSelection = (
  fallbackData?: DataRow[],
  fallbackColumns?: ColumnInfo[],
  fallbackFileName?: string,
  fallbackWorksheetName?: string
): DatasetSelectionHook => {
  const { state } = useAppState();
  const { datasets } = useDatasets();
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  // Create available datasets list including current unsaved data
  const availableDatasets = useMemo((): SelectedDatasetInfo[] => {
    const datasetList: SelectedDatasetInfo[] = [];

    // Add current unsaved data if exists
    const currentData = fallbackData || state.data;
    const currentColumns = fallbackColumns || state.columns;
    const currentFileName = fallbackFileName || state.fileName;
    
    if (currentData.length > 0) {
      datasetList.push({
        id: 'current-unsaved',
        name: state.isSaved ? (state.currentDatasetName || 'Current Dataset') : 'Current Dataset (Unsaved)',
        data: currentData,
        columns: currentColumns,
        fileName: currentFileName || 'Untitled',
        worksheetName: fallbackWorksheetName || state.worksheetName,
        isUnsaved: !state.isSaved,
        rowCount: currentData.length,
        columnCount: currentColumns.length
      });
    }

    // Add saved datasets
    datasets.forEach(dataset => {
      datasetList.push({
        id: dataset.id,
        name: dataset.name,
        data: dataset.data || [],
        columns: dataset.columns || [],
        fileName: dataset.file_name || dataset.name,
        worksheetName: dataset.worksheet_name,
        isUnsaved: false,
        rowCount: dataset.row_count || 0,
        columnCount: dataset.columns?.length || 0
      });
    });

    return datasetList;
  }, [datasets, state, fallbackData, fallbackColumns, fallbackFileName, fallbackWorksheetName]);

  // Get selected dataset info
  const selectedDataset = useMemo((): SelectedDatasetInfo | null => {
    if (!selectedDatasetId) {
      // Auto-select first available dataset if none selected
      return availableDatasets[0] || null;
    }
    return availableDatasets.find(d => d.id === selectedDatasetId) || null;
  }, [selectedDatasetId, availableDatasets]);

  // Check if current dataset is selected
  const isCurrentDataset = useMemo(() => {
    return selectedDataset?.id === 'current-unsaved';
  }, [selectedDataset]);

  const selectDataset = useCallback((datasetId: string) => {
    setSelectedDatasetId(datasetId);
  }, []);

  const hasDatasets = availableDatasets.length > 0;

  return {
    selectedDatasetId: selectedDataset?.id || null,
    selectedDataset,
    availableDatasets,
    selectDataset,
    hasDatasets,
    isCurrentDataset
  };
};