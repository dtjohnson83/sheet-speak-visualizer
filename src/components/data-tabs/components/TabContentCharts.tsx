import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
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
    <TabsContent value="charts" className="space-y-4">
      <Card className="p-6">
        <ChartVisualization 
          data={data} 
          columns={columns}
          onSaveTile={onAddTile}
          dataSourceName={fileName}
        />
      </Card>
    </TabsContent>
  );
};