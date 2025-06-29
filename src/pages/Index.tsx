import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { WorksheetManager } from '@/components/WorksheetManager';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/hooks/useDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WorksheetData } from '@/types/worksheet';

export interface DataRow {
  [key: string]: any;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'date' | 'categorical' | 'text';
  values: any[];
  worksheet?: string;
  originalName?: string;
}

const Index = () => {
  const [worksheets, setWorksheets] = useState<WorksheetData[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<WorksheetData | null>(null);
  const { tiles, addTile, removeTile, updateTile, filters, setFilters } = useDashboard();

  const handleWorksheetLoaded = (loadedData: DataRow[], detectedColumns: ColumnInfo[], fileName: string, worksheetName?: string) => {
    console.log('Worksheet loaded:', { loadedData, detectedColumns, fileName, worksheetName });
    
    const newWorksheet: WorksheetData = {
      id: Math.random().toString(36).substr(2, 9),
      name: worksheetName || 'Sheet1',
      fileName,
      data: loadedData,
      columns: detectedColumns
    };
    
    setWorksheets(prev => [...prev, newWorksheet]);
    
    // Auto-select the first worksheet if none selected
    if (!selectedWorksheet) {
      setSelectedWorksheet(newWorksheet);
    }
  };

  const handleRemoveWorksheet = (worksheetId: string) => {
    setWorksheets(prev => prev.filter(ws => ws.id !== worksheetId));
    if (selectedWorksheet?.id === worksheetId) {
      const remaining = worksheets.filter(ws => ws.id !== worksheetId);
      setSelectedWorksheet(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleSelectWorksheet = (worksheet: WorksheetData) => {
    setSelectedWorksheet(worksheet);
  };

  // Legacy data for backward compatibility
  const data = selectedWorksheet?.data || [];
  const columns = selectedWorksheet?.columns || [];
  const displayFileName = selectedWorksheet ? `${selectedWorksheet.fileName} - ${selectedWorksheet.name}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Charta
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload Excel files, visualize data, and build dashboards
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <FileUpload onDataLoaded={handleWorksheetLoaded} />
          </Card>

          {worksheets.length > 0 && (
            <>
              <Card className="p-6">
                <WorksheetManager
                  worksheets={worksheets}
                  selectedWorksheet={selectedWorksheet}
                  onSelectWorksheet={handleSelectWorksheet}
                  onRemoveWorksheet={handleRemoveWorksheet}
                />
              </Card>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Data Preview</TabsTrigger>
                  <TabsTrigger value="charts">Visualizations</TabsTrigger>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  {selectedWorksheet && (
                    <Card className="p-6">
                      <DataPreview 
                        data={data} 
                        columns={columns} 
                        fileName={displayFileName}
                      />
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="charts" className="space-y-4">
                  {selectedWorksheet && (
                    <Card className="p-6">
                      <ChartVisualization 
                        data={data} 
                        columns={columns}
                        worksheets={worksheets}
                        selectedWorksheet={selectedWorksheet}
                        onSaveTile={addTile}
                      />
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="dashboard" className="space-y-4">
                  <DashboardCanvas
                    tiles={tiles}
                    data={data}
                    columns={columns}
                    worksheets={worksheets}
                    onRemoveTile={removeTile}
                    onUpdateTile={updateTile}
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
