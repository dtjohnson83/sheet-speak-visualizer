import React from 'react';
import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DatasetManager } from '@/components/data/DatasetManager';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SavedDataset } from '@/hooks/useDatasets';

interface TabContentSavedDatasetsProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  worksheetName: string;
  onLoadDataset: (dataset: SavedDataset) => void;
}

export const TabContentSavedDatasets: React.FC<TabContentSavedDatasetsProps> = ({
  data,
  columns,
  fileName,
  worksheetName,
  onLoadDataset
}) => {
  return (
    <TabsContent value="saved-datasets" className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Saved Datasets</h3>
            <p className="text-sm text-muted-foreground">
              Load previously saved datasets or manage your current data.
            </p>
          </div>
          <DatasetManager
            currentData={data}
            currentColumns={columns}
            currentFileName={fileName}
            currentWorksheetName={worksheetName}
            onLoadDataset={onLoadDataset}
          />
        </div>
      </Card>
    </TabsContent>
  );
};