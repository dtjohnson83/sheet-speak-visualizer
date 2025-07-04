import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { DatasetManager } from '@/components/data/DatasetManager';
import { DataSourceSelector } from '@/components/data-sources/DataSourceSelector';
import { DataSourceConnectionDialog } from '@/components/data-sources/DataSourceConnectionDialog';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SavedDataset } from '@/hooks/useDatasets';

interface DataManagementSectionProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  worksheetName: string;
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  onDataLoaded: (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => void;
  onLoadDataset: (dataset: SavedDataset) => void;
  onDataSourceSelect: (type: string) => void;
  onDataSourceDialogChange: (open: boolean) => void;
}

export const DataManagementSection = ({
  data,
  columns,
  fileName,
  worksheetName,
  selectedDataSource,
  showDataSourceDialog,
  onDataLoaded,
  onLoadDataset,
  onDataSourceSelect,
  onDataSourceDialogChange,
}: DataManagementSectionProps) => {
  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Data Management</h3>
          <DatasetManager
            currentData={data}
            currentColumns={columns}
            currentFileName={fileName}
            currentWorksheetName={worksheetName}
            onLoadDataset={onLoadDataset}
          />
        </div>
        
        <div className="space-y-4">
          <FileUpload onDataLoaded={onDataLoaded} />
          
          <div className="border-t pt-4">
            <h4 className="text-md font-medium mb-3">Connect to Data Sources</h4>
            <DataSourceSelector 
              onSelect={(type) => {
                onDataSourceSelect(type);
                onDataSourceDialogChange(true);
              }}
              selectedType={selectedDataSource}
            />
          </div>
        </div>
      </Card>
      
      <DataSourceConnectionDialog
        open={showDataSourceDialog}
        onOpenChange={onDataSourceDialogChange}
        sourceType={selectedDataSource}
        onSuccess={onDataLoaded}
      />
    </>
  );
};