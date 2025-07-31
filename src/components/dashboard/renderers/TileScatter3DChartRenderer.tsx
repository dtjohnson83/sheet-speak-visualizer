import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { Chart3DContainer } from '@/components/chart/Chart3DContainer';
import { Scatter3DChartRenderer } from '@/components/chart/renderers/Scatter3DChartRenderer';

interface TileScatter3DChartRendererProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileScatter3DChartRenderer: React.FC<TileScatter3DChartRendererProps> = ({
  data,
  xColumn,
  yColumn,
  zColumn,
  effectiveSeries,
  chartColors,
  showDataLabels
}) => {
  return (
    <Chart3DContainer height={200} enableControls={false} tileMode={true}>
      <Scatter3DChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn || yColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        tileMode={true}
      />
    </Chart3DContainer>
  );
};