import React, { createContext, useContext, ReactNode } from 'react';
import { useRealtimeData as useRealtimeDataHook } from '@/hooks/useRealtimeData';

type RealtimeDataContextType = ReturnType<typeof useRealtimeDataHook>;

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined);

interface RealtimeDataProviderProps {
  children: ReactNode;
}

export const RealtimeDataProvider = ({ children }: RealtimeDataProviderProps) => {
  const realtimeData = useRealtimeDataHook();

  return (
    <RealtimeDataContext.Provider value={realtimeData}>
      {children}
    </RealtimeDataContext.Provider>
  );
};

export const useRealtimeData = () => {
  const context = useContext(RealtimeDataContext);
  if (context === undefined) {
    throw new Error('useRealtimeData must be used within a RealtimeDataProvider');
  }
  return context;
};