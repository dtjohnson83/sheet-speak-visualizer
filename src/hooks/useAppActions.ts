import { useCallback } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';
import { SavedDataset } from '@/hooks/useDatasets';
import { useEnhancedAIContext } from '@/hooks/useEnhancedAIContext';
import { logger } from '@/lib/logger';

interface DataLoadState {
  isLoading: boolean;
  error: string | null;
  lastLoadedId: string | null;
}

export const useAppActions = () => {
  const { dispatch } = useAppState();
  const { setContext, clearContext } = useEnhancedAIContext();

  const handleDataLoaded = useCallback((
    loadedData: DataRow[], 
    detectedColumns: ColumnInfo[], 
    name: string, 
    worksheet?: string
  ) => {
    try {
      // Validate data integrity
      if (!Array.isArray(loadedData) || !Array.isArray(detectedColumns)) {
        throw new Error('Invalid data format provided');
      }

      if (loadedData.length === 0) {
        logger.warn('Empty dataset loaded', { name, worksheet });
      }

      logger.info('Data loaded successfully', { 
        rowCount: loadedData.length, 
        columnCount: detectedColumns.length, 
        name, 
        worksheet 
      });

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
    } catch (error) {
      logger.error('Failed to load data', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        name,
        worksheet
      });
      throw error;
    }
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
    try {
      // Validate dataset integrity
      if (!dataset.id || !dataset.data || !dataset.columns) {
        throw new Error('Invalid dataset structure');
      }

      logger.info('Loading dataset', { 
        datasetId: dataset.id, 
        name: dataset.name,
        rowCount: dataset.data.length,
        columnCount: dataset.columns.length
      });

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
    } catch (error) {
      logger.error('Failed to load dataset', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        datasetId: dataset.id,
        datasetName: dataset.name
      });
      throw error;
    }
  }, [dispatch]);

  const addTile = useCallback((tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => {
    logger.info('Adding dashboard tile', { title: tileData.title, type: tileData.chartType });
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
    try {
      // Validate dashboard data
      if (!Array.isArray(loadedTiles) || !Array.isArray(loadedFilters)) {
        throw new Error('Invalid dashboard data format');
      }

      logger.info('Loading dashboard', { 
        tileCount: loadedTiles.length, 
        filterCount: loadedFilters.length,
        hasData: !!loadedData,
        hasColumns: !!loadedColumns
      });

      dispatch({
        type: 'LOAD_DASHBOARD',
        payload: {
          tiles: loadedTiles,
          filters: loadedFilters,
          data: loadedData,
          columns: loadedColumns
        }
      });
    } catch (error) {
      logger.error('Failed to load dashboard', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
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