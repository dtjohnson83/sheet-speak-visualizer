import { useCallback } from 'react';
import { useAppState, DatasetInfo } from '@/contexts/AppStateContext';
import { DataRow, ColumnInfo } from '@/pages/Index';

export const useMultiDatasetActions = () => {
  const { state, dispatch } = useAppState();

  const addDataset = useCallback((
    data: DataRow[],
    columns: ColumnInfo[],
    fileName: string,
    worksheetName?: string,
    datasetName?: string
  ) => {
    const datasetId = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const datasetInfo: DatasetInfo = {
      id: datasetId,
      name: datasetName || fileName,
      fileName,
      worksheetName: worksheetName || '',
      data,
      columns,
      isSaved: false,
      lastModified: new Date(),
      rowCount: data.length,
      columnCount: columns.length
    };

    dispatch({
      type: 'ADD_DATASET',
      payload: datasetInfo
    });

    return datasetId;
  }, [dispatch]);

  const removeDataset = useCallback((datasetId: string) => {
    dispatch({
      type: 'REMOVE_DATASET',
      payload: datasetId
    });
  }, [dispatch]);

  const selectDataset = useCallback((datasetId: string) => {
    dispatch({
      type: 'SET_ACTIVE_DATASET',
      payload: datasetId
    });
  }, [dispatch]);

  const updateDataset = useCallback((datasetId: string, updates: Partial<DatasetInfo>) => {
    dispatch({
      type: 'UPDATE_DATASET',
      payload: { id: datasetId, updates }
    });
  }, [dispatch]);

  const markDatasetAsSaved = useCallback((datasetId: string, datasetName: string) => {
    dispatch({
      type: 'UPDATE_DATASET',
      payload: { 
        id: datasetId, 
        updates: { 
          isSaved: true, 
          name: datasetName,
          lastModified: new Date() 
        } 
      }
    });
  }, [dispatch]);

  const updateColumnType = useCallback((
    datasetId: string,
    columnName: string,
    newType: 'numeric' | 'date' | 'categorical' | 'text'
  ) => {
    const dataset = state.datasets.get(datasetId);
    if (!dataset) return;

    const updatedColumns = dataset.columns.map(col =>
      col.name === columnName ? { ...col, type: newType } : col
    );

    dispatch({
      type: 'UPDATE_DATASET',
      payload: {
        id: datasetId,
        updates: {
          columns: updatedColumns,
          lastModified: new Date()
        }
      }
    });
  }, [state.datasets, dispatch]);

  const getAllDatasets = useCallback(() => {
    return Array.from(state.datasets.values());
  }, [state.datasets]);

  const getActiveDataset = useCallback(() => {
    return state.activeDatasetId ? state.datasets.get(state.activeDatasetId) : null;
  }, [state.activeDatasetId, state.datasets]);

  const getDatasetById = useCallback((datasetId: string) => {
    return state.datasets.get(datasetId) || null;
  }, [state.datasets]);

  return {
    addDataset,
    removeDataset,
    selectDataset,
    updateDataset,
    markDatasetAsSaved,
    updateColumnType,
    getAllDatasets,
    getActiveDataset,
    getDatasetById,
    datasetsCount: state.datasets.size,
    activeDatasetId: state.activeDatasetId
  };
};