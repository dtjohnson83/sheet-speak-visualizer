import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DashboardTileData } from '@/components/dashboard/DashboardTile';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';

export interface AppState {
  // Data management state
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  worksheetName: string;
  currentDatasetId: string;
  isSaved: boolean;
  currentDatasetName: string;
  
  // Dashboard state
  tiles: DashboardTileData[];
  filters: FilterCondition[];
  realtimeEnabled: boolean;
  
  // Context setup state
  showContextSetup: boolean;
}

type AppAction = 
  | { type: 'SET_DATA'; payload: { data: DataRow[]; columns: ColumnInfo[]; fileName: string; worksheetName?: string } }
  | { type: 'SET_COLUMN_TYPE'; payload: { columnName: string; newType: 'numeric' | 'date' | 'categorical' | 'text' } }
  | { type: 'SET_CURRENT_DATASET_ID'; payload: string }
  | { type: 'SET_DATASET_SAVED'; payload: { datasetId: string; datasetName: string } }
  | { type: 'SET_SHOW_CONTEXT_SETUP'; payload: boolean }
  | { type: 'ADD_TILE'; payload: Omit<DashboardTileData, 'id' | 'position' | 'size'> }
  | { type: 'REMOVE_TILE'; payload: string }
  | { type: 'UPDATE_TILE'; payload: { id: string; updates: Partial<DashboardTileData> } }
  | { type: 'SET_FILTERS'; payload: FilterCondition[] }
  | { type: 'SET_REALTIME_ENABLED'; payload: boolean }
  | { type: 'CLEAR_DATA' }
  | { type: 'LOAD_DATASET'; payload: { data: DataRow[]; columns: ColumnInfo[]; fileName: string; worksheetName?: string; datasetId: string; datasetName: string } }
  | { type: 'LOAD_DASHBOARD'; payload: { tiles: DashboardTileData[]; filters: FilterCondition[]; data?: DataRow[]; columns?: ColumnInfo[] } };

const initialState: AppState = {
  data: [],
  columns: [],
  fileName: '',
  worksheetName: '',
  currentDatasetId: '',
  isSaved: false,
  currentDatasetName: '',
  tiles: [],
  filters: [],
  realtimeEnabled: false,
  showContextSetup: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload.data,
        columns: action.payload.columns,
        fileName: action.payload.fileName,
        worksheetName: action.payload.worksheetName || '',
        isSaved: false,
        currentDatasetId: '',
        currentDatasetName: '',
        showContextSetup: true,
      };
    
    case 'SET_COLUMN_TYPE':
      return {
        ...state,
        columns: state.columns.map(col =>
          col.name === action.payload.columnName
            ? { ...col, type: action.payload.newType }
            : col
        ),
      };
    
    case 'SET_CURRENT_DATASET_ID':
      return { ...state, currentDatasetId: action.payload };
    
    case 'SET_DATASET_SAVED':
      return { 
        ...state, 
        currentDatasetId: action.payload.datasetId,
        currentDatasetName: action.payload.datasetName,
        isSaved: true 
      };
    
    case 'LOAD_DATASET':
      return {
        ...state,
        data: action.payload.data,
        columns: action.payload.columns,
        fileName: action.payload.fileName,
        worksheetName: action.payload.worksheetName || '',
        currentDatasetId: action.payload.datasetId,
        currentDatasetName: action.payload.datasetName,
        isSaved: true,
        showContextSetup: true,
      };
    
    case 'SET_SHOW_CONTEXT_SETUP':
      return { ...state, showContextSetup: action.payload };
    
    case 'ADD_TILE': {
      const tileWidth = 400;
      const tileHeight = 300;
      const tilesPerRow = 2;
      const horizontalGap = 20;
      const verticalGap = 20;
      
      const tileIndex = state.tiles.length;
      const row = Math.floor(tileIndex / tilesPerRow);
      const col = tileIndex % tilesPerRow;
      
      const x = col * (tileWidth + horizontalGap);
      const y = row * (tileHeight + verticalGap);
      
      const newTile: DashboardTileData = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        position: { x, y },
        size: { width: tileWidth, height: tileHeight }
      };
      
      return { ...state, tiles: [...state.tiles, newTile] };
    }
    
    case 'REMOVE_TILE':
      return { ...state, tiles: state.tiles.filter(tile => tile.id !== action.payload) };
    
    case 'UPDATE_TILE':
      return {
        ...state,
        tiles: state.tiles.map(tile =>
          tile.id === action.payload.id ? { ...tile, ...action.payload.updates } : tile
        ),
      };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_REALTIME_ENABLED':
      return { ...state, realtimeEnabled: action.payload };
    
    case 'CLEAR_DATA':
      return {
        ...state,
        data: [],
        columns: [],
        fileName: '',
        worksheetName: '',
        currentDatasetId: '',
        currentDatasetName: '',
        isSaved: false,
        showContextSetup: false,
      };
    
    case 'LOAD_DASHBOARD':
      return {
        ...state,
        tiles: action.payload.tiles,
        filters: action.payload.filters,
        ...(action.payload.data && { data: action.payload.data }),
        ...(action.payload.columns && { columns: action.payload.columns }),
      };
    
    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};