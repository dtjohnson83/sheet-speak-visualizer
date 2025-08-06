import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { SankeyChartRenderer } from '@/components/chart/renderers/SankeyChartRenderer';
import { SankeyData } from '@/lib/chartDataUtils';

interface TileSankeyChartRendererProps {
  data: SankeyData;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileSankeyChartRenderer: React.FC<TileSankeyChartRendererProps> = ({
  data,
  chartColors,
  showDataLabels
}) => {
  return (
    <SankeyChartRenderer
      data={data}
      chartColors={chartColors}
      showDataLabels={showDataLabels}
    />
  );
};