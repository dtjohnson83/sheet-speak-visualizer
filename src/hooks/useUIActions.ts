import { useCallback } from 'react';
import { useUIState } from '@/contexts/UIStateContext';

export const useUIActions = () => {
  const { dispatch } = useUIState();

  const setSelectedDataSource = useCallback((dataSource: string) => {
    dispatch({ type: 'SET_SELECTED_DATA_SOURCE', payload: dataSource });
  }, [dispatch]);

  const setShowDataSourceDialog = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_DATA_SOURCE_DIALOG', payload: show });
  }, [dispatch]);

  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, [dispatch]);

  const toggleTierExpansion = useCallback((tier: string) => {
    dispatch({ type: 'TOGGLE_TIER_EXPANSION', payload: tier });
  }, [dispatch]);

  const setTierExpansion = useCallback((tier: string, expanded: boolean) => {
    dispatch({ type: 'SET_TIER_EXPANSION', payload: { tier, expanded } });
  }, [dispatch]);

  const setShowTutorial = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_TUTORIAL', payload: show });
  }, [dispatch]);

  const setShowChecklist = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_CHECKLIST', payload: show });
  }, [dispatch]);

  return {
    setSelectedDataSource,
    setShowDataSourceDialog,
    setActiveTab,
    toggleTierExpansion,
    setTierExpansion,
    setShowTutorial,
    setShowChecklist,
  };
};