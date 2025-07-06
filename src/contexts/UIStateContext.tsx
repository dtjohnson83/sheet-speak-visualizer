import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface UIState {
  // Data source dialog state
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  
  // Tab navigation state
  activeTab: string;
  
  // Expansion states
  expandedTiers: Record<string, boolean>;
  
  // Modal states
  showTutorial: boolean;
  showChecklist: boolean;
}

type UIAction = 
  | { type: 'SET_SELECTED_DATA_SOURCE'; payload: string }
  | { type: 'SET_SHOW_DATA_SOURCE_DIALOG'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'TOGGLE_TIER_EXPANSION'; payload: string }
  | { type: 'SET_TIER_EXPANSION'; payload: { tier: string; expanded: boolean } }
  | { type: 'SET_SHOW_TUTORIAL'; payload: boolean }
  | { type: 'SET_SHOW_CHECKLIST'; payload: boolean };

const initialState: UIState = {
  selectedDataSource: '',
  showDataSourceDialog: false,
  activeTab: 'data-sources',
  expandedTiers: {},
  showTutorial: false,
  showChecklist: true,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_SELECTED_DATA_SOURCE':
      return { ...state, selectedDataSource: action.payload };
    
    case 'SET_SHOW_DATA_SOURCE_DIALOG':
      return { ...state, showDataSourceDialog: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'TOGGLE_TIER_EXPANSION':
      return {
        ...state,
        expandedTiers: {
          ...state.expandedTiers,
          [action.payload]: !state.expandedTiers[action.payload],
        },
      };
    
    case 'SET_TIER_EXPANSION':
      return {
        ...state,
        expandedTiers: {
          ...state.expandedTiers,
          [action.payload.tier]: action.payload.expanded,
        },
      };
    
    case 'SET_SHOW_TUTORIAL':
      return { ...state, showTutorial: action.payload };
    
    case 'SET_SHOW_CHECKLIST':
      return { ...state, showChecklist: action.payload };
    
    default:
      return state;
  }
}

const UIStateContext = createContext<{
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
} | null>(null);

export const UIStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);
  
  return (
    <UIStateContext.Provider value={{ state, dispatch }}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};