
import React from 'react';
import { BrandedPie } from '@/components/charts/BrandedPie';
import { formatTooltipValue } from '@/lib/numberUtils';
import { DataRow } from '@/pages/Index';

interface PieChartRendererProps {
  data: DataRow[];
  chartColors: string[];
  showDataLabels?: boolean;
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
}

export const PieChartRenderer = ({ 
  data, 
  chartColors,
  showDataLabels = false,
  isTemporalAnimated = false,
  animationSpeed = 1000
}: PieChartRendererProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        No data available for pie chart
      </div>
    );
  }

  // Prepare data for the branded pie chart
  const valueKey = Object.keys(data[0] || {}).find(key => typeof data[0]?.[key] === 'number') || 'value';
  const nameKey = Object.keys(data[0] || {}).find(key => typeof data[0]?.[key] !== 'number') || 'name';

  return (
    <BrandedPie
      data={data}
      dataKey={valueKey}
      nameKey={nameKey}
      height={384}
      colors={chartColors}
      showLabels={showDataLabels}
      animated={isTemporalAnimated}
      formatTooltip={formatTooltipValue}
    />
  );
};
