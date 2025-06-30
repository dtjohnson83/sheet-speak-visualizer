
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { ColumnTypeOverride } from '@/components/data-preview/ColumnTypeOverride';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/hooks/useDashboard';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';

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
  const [worksheetName, setWorksheetName] = useState<string>('');
  const { tiles, addTile, removeTile, updateTile, filters, setFilters } = useDashboard();
  
  // Initialize session monitoring
  useSessionMonitor();

  const handleDataLoaded = (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => {
    console.log('Data loaded:', { loadedData, detectedColumns, name, worksheet });
    setData(loadedData);
    setColumns(detectedColumns);
    setFileName(name);
    setWorksheetName(worksheet || '');
  };

  const handleColumnTypeChange = (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => {
    setColumns(prevColumns => {
      return prevColumns.map(col => {
        if (col.name === columnName) {
          return { ...col, type: newType };
        }
        return col;
      });
    });
  };

  const displayFileName = worksheetName ? `${fileName} - ${worksheetName}` : fileName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <UserMenu />
            <ThemeToggle />
          </div>
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/46fcdf07-02cb-478d-a210-bb35917ae271.png" 
              alt="Charta Logo" 
              className="h-12 w-auto"
            />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload Excel files, visualize data, and build dashboards
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </Card>

          {data.length > 0 && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview">Data Preview</TabsTrigger>
                <TabsTrigger value="types">Column Types</TabsTrigger>
                <TabsTrigger value="charts">Visualizations</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <Card className="p-6">
                  <DataPreview 
                    data={data} 
                    columns={columns} 
                    fileName={displayFileName}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="types" className="space-y-4">
                <Card className="p-6">
                  <ColumnTypeOverride 
                    columns={columns}
                    onColumnTypeChange={handleColumnTypeChange}
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
                  onUpdateTile={updateTile}
                  filters={filters}
                  onFiltersChange={setFilters}
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
