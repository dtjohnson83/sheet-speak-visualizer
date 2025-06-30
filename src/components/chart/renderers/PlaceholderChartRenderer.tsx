
import React from 'react';

interface PlaceholderChartRendererProps {
  message: string;
}

export const PlaceholderChartRenderer = ({ message }: PlaceholderChartRendererProps) => {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};
