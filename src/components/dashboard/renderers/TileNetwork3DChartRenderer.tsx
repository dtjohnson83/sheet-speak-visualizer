import React from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { Chart3DContainer } from '@/components/chart/Chart3DContainer';
import { Network3DGraphRenderer } from '@/components/chart/renderers/Network3DGraphRenderer';

interface TileNetwork3DChartRendererProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
  isMaximized?: boolean;
}

export const TileNetwork3DChartRenderer: React.FC<TileNetwork3DChartRendererProps> = ({
  data,
  xColumn,
  yColumn,
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
      <Network3DGraphRenderer
        data={data}
        columns={[]}
        xColumn={xColumn}
        yColumn={yColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        tileMode={true}
      />
    </Chart3DContainer>
  );
};