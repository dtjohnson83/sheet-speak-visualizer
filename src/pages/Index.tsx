import { useState } from 'react';
import { DataRow, ColumnInfo } from '@/components/FileUpload';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { useDashboard } from '@/hooks/useDashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Eye, BarChart3, Layout, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [worksheetName, setWorksheetName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'chart' | 'dashboard'>('preview');

  const { tiles, addTile, removeTile, updateTile, filters, setFilters } = useDashboard();

  const handleDataLoaded = (
    newData: DataRow[], 
    newColumns: ColumnInfo[], 
    newFileName: string,
    newWorksheetName?: string
  ) => {
    setData(newData);
    setColumns(newColumns);
    setFileName(newFileName);
    setWorksheetName(newWorksheetName || '');
    setActiveTab('preview');
  };

  const handleDataUpdated = (newData: DataRow[], newColumns: ColumnInfo[]) => {
    setData(newData);
    setColumns(newColumns);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interactive Data Visualizer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your data and create beautiful visualizations
          </p>
        </div>

        {data.length === 0 ? (
          <FileUpload onDataLoaded={handleDataLoaded} />
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview" className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Data Preview
                </TabsTrigger>
                <TabsTrigger value="chart" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Chart Builder
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center">
                  <Layout className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <DataPreview 
                  data={data} 
                  columns={columns} 
                  fileName={worksheetName ? `${fileName} - ${worksheetName}` : fileName}
                  onDataUpdated={handleDataUpdated}
                />
              </TabsContent>

              <TabsContent value="chart">
                <ChartVisualization 
                  data={data} 
                  columns={columns}
                  onSaveTile={addTile}
                />
              </TabsContent>

              <TabsContent value="dashboard">
                <DashboardCanvas
                  tiles={tiles}
                  data={data}
                  columns={columns}
                  filters={filters}
                  onRemoveTile={removeTile}
                  onUpdateTile={updateTile}
                  onFiltersChange={setFilters}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setData([]);
                  setColumns([]);
                  setFileName('');
                  setWorksheetName('');
                  setActiveTab('preview');
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
