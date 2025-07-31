import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { Chart3DContainer } from '@/components/chart/Chart3DContainer';
import { Bar3DChartRenderer } from '@/components/chart/renderers/Bar3DChartRenderer';

interface TileBar3DChartRendererProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileBar3DChartRenderer: React.FC<TileBar3DChartRendererProps> = ({
  data,
  xColumn,
  yColumn,
  zColumn,
  effectiveSeries,
  chartColors,
  showDataLabels
}) => {
  return (
    <Chart3DContainer height={200} enableControls={false}>
      <Bar3DChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn || yColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    </Chart3DContainer>
  );
};