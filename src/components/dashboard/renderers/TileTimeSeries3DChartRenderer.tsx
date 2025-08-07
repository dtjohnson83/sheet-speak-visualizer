import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { Chart3DContainer } from '@/components/chart/Chart3DContainer';
import { TimeSeries3DChartRenderer } from '@/components/chart/renderers/TimeSeries3DChartRenderer';

interface TileTimeSeries3DChartRendererProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
  isMaximized?: boolean;
}

export const TileTimeSeries3DChartRenderer: React.FC<TileTimeSeries3DChartRendererProps> = ({
  data,
  xColumn,
  yColumn,
  zColumn,
  effectiveSeries,
  chartColors,
  showDataLabels,
  isMaximized
}) => {
  return (
    <Chart3DContainer 
      enableControls={true} 
      tileMode={true}
      isMaximized={isMaximized}
    >
      <TimeSeries3DChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        zColumn={zColumn || xColumn}
        seriesColumn={xColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        tileMode={true}
      />
    </Chart3DContainer>
  );
};