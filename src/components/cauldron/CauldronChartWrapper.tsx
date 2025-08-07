import React from 'react';
import { ChartErrorBoundary } from '@/components/chart/renderers/ChartErrorBoundary';

interface CauldronChartWrapperProps {
  children: React.ReactNode;
}

export const CauldronChartWrapper: React.FC<CauldronChartWrapperProps> = ({ children }) => {
  return (
    <ChartErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-4">🔮</div>
            <p className="text-lg font-medium mb-2">Chart brewing in progress...</p>
            <p className="text-sm">The magical visualization is taking shape</p>
          </div>
        </div>
      }
    >
      <div className="w-full h-full min-h-[400px] max-h-[600px] overflow-hidden">
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </ChartErrorBoundary>
  );
};