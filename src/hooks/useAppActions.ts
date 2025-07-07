import { useCallback } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';
import { SavedDataset } from '@/hooks/useDatasets';
import { useEnhancedAIContext } from '@/hooks/useEnhancedAIContext';

export const useAppActions = () => {
  const { dispatch } = useAppState();
  const { setContext, clearContext } = useEnhancedAIContext();

  const handleDataLoaded = useCallback((
    loadedData: DataRow[], 
    detectedColumns: ColumnInfo[], 
    name: string, 
    worksheet?: string
  ) => {
    console.log('Data loaded:', { loadedData, detectedColumns, name, worksheet });
    dispatch({
      type: 'SET_DATA',
      payload: {
        data: loadedData,
        columns: detectedColumns,
        fileName: name,
        worksheetName: worksheet
      }
    });
    clearContext();
  }, [dispatch, clearContext]);

  const handleColumnTypeChange = useCallback((
    columnName: string, 
    newType: 'numeric' | 'date' | 'categorical' | 'text'
  ) => {
    dispatch({
      type: 'SET_COLUMN_TYPE',
      payload: { columnName, newType }
    });
  }, [dispatch]);

  const handleLoadDataset = useCallback((dataset: SavedDataset) => {
    console.log('Loading dataset:', dataset);
    dispatch({
      type: 'LOAD_DATASET',
      payload: {
        data: dataset.data,
        columns: dataset.columns,
        fileName: dataset.file_name,
        worksheetName: dataset.worksheet_name || '',
        datasetId: dataset.id,
        datasetName: dataset.name
      }
    });
  }, [dispatch]);

  const addTile = useCallback((tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => {
    console.log('Adding tile:', tileData);
    dispatch({ type: 'ADD_TILE', payload: tileData });
  }, [dispatch]);

  const removeTile = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TILE', payload: id });
  }, [dispatch]);

  const updateTile = useCallback((
    id: string, 
    updates: { position?: { x: number; y: number }; size?: { width: number; height: number }; title?: string }
  ) => {
    dispatch({ type: 'UPDATE_TILE', payload: { id, updates } });
  }, [dispatch]);

  const setFilters = useCallback((filters: FilterCondition[]) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, [dispatch]);

  const enableRealtime = useCallback(() => {
    dispatch({ type: 'SET_REALTIME_ENABLED', payload: true });
  }, [dispatch]);

  const disableRealtime = useCallback(() => {
    dispatch({ type: 'SET_REALTIME_ENABLED', payload: false });
  }, [dispatch]);

  const handleLoadDashboard = useCallback((
    loadedTiles: DashboardTileData[], 
    loadedFilters: FilterCondition[], 
    loadedData?: DataRow[], 
    loadedColumns?: ColumnInfo[]
  ) => {
    console.log('Loading dashboard with tiles:', loadedTiles);
    dispatch({
      type: 'LOAD_DASHBOARD',
      payload: {
        tiles: loadedTiles,
        filters: loadedFilters,
        data: loadedData,
        columns: loadedColumns
      }
    });
  }, [dispatch]);

  const handleContextReady = useCallback((context: any) => {
    setContext(context);
    dispatch({ type: 'SET_SHOW_CONTEXT_SETUP', payload: false });
  }, [setContext, dispatch]);

  const handleSkipContext = useCallback(() => {
    dispatch({ type: 'SET_SHOW_CONTEXT_SETUP', payload: false });
  }, [dispatch]);

  return {
    handleDataLoaded,
    handleColumnTypeChange,
    handleLoadDataset,
    addTile,
    removeTile,
    updateTile,
    setFilters,
    enableRealtime,
    disableRealtime,
    handleLoadDashboard,
    handleContextReady,
    handleSkipContext,
  };
};