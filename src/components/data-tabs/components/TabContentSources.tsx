
import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DataSourcesTab } from '@/components/data-sources/DataSourcesTab';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface TabContentSourcesProps {
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  onDataSourceSelect: (type: string) => void;
  onDataSourceDialogChange: (open: boolean) => void;
  onDataLoaded: (data: DataRow[], columns: ColumnInfo[], name: string, worksheet?: string) => void;
}

export const TabContentSources: React.FC<TabContentSourcesProps> = ({
  selectedDataSource,
  showDataSourceDialog,
  onDataSourceSelect,
  onDataSourceDialogChange,
  onDataLoaded
}) => {
  return (
    <Card className="p-6">
      <DataSourcesTab 
        selectedDataSource={selectedDataSource}
        showDataSourceDialog={showDataSourceDialog}
        onDataSourceSelect={onDataSourceSelect}
        onDataSourceDialogChange={onDataSourceDialogChange}
        onDataLoaded={onDataLoaded}
      />
    </Card>
  );
};
