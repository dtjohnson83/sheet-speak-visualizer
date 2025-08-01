import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { Chart3DContainer } from '@/components/chart/Chart3DContainer';
import { Surface3DChartRenderer } from '@/components/chart/renderers/Surface3DChartRenderer';

interface TileSurface3DChartRendererProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

export const TileSurface3DChartRenderer: React.FC<TileSurface3DChartRendererProps> = ({
  data,
  xColumn,
  yColumn,
  zColumn,
  effectiveSeries,
  chartColors,
  showDataLabels
}) => {
  return (
    <Chart3DContainer enableControls={true} tileMode={true}>
      <Surface3DChartRenderer
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