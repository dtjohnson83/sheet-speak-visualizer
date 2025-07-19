
import React from 'react';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentChartsProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onAddTile: (tileData: any) => void;
}

export const TabContentCharts: React.FC<TabContentChartsProps> = ({
  data,
  columns,
  fileName,
  onAddTile
}) => {
  return (
    <ChartVisualization 
      data={data} 
      columns={columns}
      onSaveTile={onAddTile}
      dataSourceName={fileName}
    />
  );
};
