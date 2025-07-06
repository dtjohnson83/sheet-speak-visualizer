import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DataPreview } from '@/components/DataPreview';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
}

export const TabContentPreview: React.FC<TabContentPreviewProps> = ({
  data,
  columns,
  fileName,
  onColumnTypeChange
}) => {
  return (
    <TabsContent value="preview" className="space-y-4">
      <Card className="p-6">
        <DataPreview 
          data={data} 
          columns={columns} 
          fileName={fileName}
          onColumnTypeChange={onColumnTypeChange}
        />
      </Card>
    </TabsContent>
  );
};