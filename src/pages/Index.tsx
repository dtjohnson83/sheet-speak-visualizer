
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/hooks/useDashboard';

export interface DataRow {
  [key: string]: any;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'date' | 'categorical' | 'text';
  values: any[];
}

const Index = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const { tiles, addTile, removeTile, moveTile } = useDashboard();

  const handleDataLoaded = (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string) => {
    console.log('Data loaded:', { loadedData, detectedColumns, name });
    setData(loadedData);
    setColumns(detectedColumns);
    setFileName(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vizly
          </h1>
          <p className="text-lg text-gray-600">
            Upload Excel files, visualize data, and build dashboards
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </Card>

          {data.length > 0 && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Data Preview</TabsTrigger>
                <TabsTrigger value="charts">Visualizations</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <Card className="p-6">
                  <DataPreview 
                    data={data} 
                    columns={columns} 
                    fileName={fileName}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="charts" className="space-y-4">
                <Card className="p-6">
                  <ChartVisualization 
                    data={data} 
                    columns={columns}
                    onSaveTile={addTile}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="dashboard" className="space-y-4">
                <DashboardCanvas
                  tiles={tiles}
                  data={data}
                  columns={columns}
                  onRemoveTile={removeTile}
                  onMoveTile={moveTile}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
