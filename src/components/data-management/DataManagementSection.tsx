// src/components/data/DataManagementSection.tsx
import { Card } from '@/components/ui/card';
import { SimpleFileUpload } from '@/components/SimpleFileUpload';
import { DatasetManager } from '@/components/data/DatasetManager';
import CleanAndScorePanel from '@/components/data/CleanAndScorePanel';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SavedDataset } from '@/hooks/useDatasets';

interface DataManagementSectionProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  worksheetName: string;
  onDataLoaded: (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => void;
  onLoadDataset: (dataset: SavedDataset) => void;
}

export const DataManagementSection = ({
  data,
  columns,
  fileName,
  worksheetName,
  onDataLoaded,
  onLoadDataset,
}: DataManagementSectionProps) => {
  return (
    <>
      <Card className="p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* File Upload + Clean & Score */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Upload Data</h3>
            </div>
            <SimpleFileUpload onDataLoaded={onDataLoaded} />

            {/* NEW: Clean & Score Panel */}
            <CleanAndScorePanel />
          </div>

          {/* Dataset Management Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Saved Datasets</h3>
            <DatasetManager
              currentData={data}
              currentColumns={columns}
              currentFileName={fileName}
              currentWorksheetName={worksheetName}
              onLoadDataset={onLoadDataset}
            />
          </div>
        </div>
      </Card>
    </>
  );
};
