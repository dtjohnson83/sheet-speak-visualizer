
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChartVisualization } from '@/components/ChartVisualization';
import { DashboardCanvas } from '@/components/dashboard/DashboardCanvas';
import { ColumnTypeOverride } from '@/components/data-preview/ColumnTypeOverride';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { FeedbackButton } from '@/components/FeedbackButton';
import { DatasetManager } from '@/components/data/DatasetManager';
import { DashboardManager } from '@/components/dashboard/DashboardManager';
import { SavedDataset } from '@/hooks/useDatasets';
import { NaturalLanguageQuery } from '@/components/NaturalLanguageQuery';
import { AIDataChat } from '@/components/AIDataChat';
import { Bot, Database, BarChart3, Layout, Settings } from 'lucide-react';

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
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('');
  const { tiles, addTile, removeTile, updateTile, filters, setFilters } = useDashboard();
  const isMobile = useIsMobile();
  
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

  const handleLoadDataset = (dataset: SavedDataset) => {
    console.log('Loading dataset:', dataset);
    setData(dataset.data);
    setColumns(dataset.columns);
    setFileName(dataset.file_name);
    setWorksheetName(dataset.worksheet_name || '');
    setCurrentDatasetId(dataset.id);
  };

  const handleLoadDashboard = (
    loadedTiles: any[], 
    loadedFilters: any[], 
    loadedData?: DataRow[], 
    loadedColumns?: ColumnInfo[]
  ) => {
    console.log('Loading dashboard with tiles:', loadedTiles);
    
    // Clear existing tiles and load new ones
    tiles.forEach(tile => removeTile(tile.id));
    
    // Add loaded tiles
    loadedTiles.forEach(tile => {
      addTile({
        title: tile.title,
        chartType: tile.chartType,
        xColumn: tile.xColumn,
        yColumn: tile.yColumn,
        stackColumn: tile.stackColumn,
        sankeyTargetColumn: tile.sankeyTargetColumn,
        valueColumn: tile.valueColumn,
        sortColumn: tile.sortColumn,
        sortDirection: tile.sortDirection,
        series: tile.series,
        showDataLabels: tile.showDataLabels
      });
    });
    
    // Load filters
    setFilters(loadedFilters);
    
    // Load associated dataset if available
    if (loadedData && loadedColumns) {
      setData(loadedData);
      setColumns(loadedColumns);
    }
  };

  const displayFileName = worksheetName ? `${fileName} - ${worksheetName}` : fileName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <FeedbackButton />
            <UserMenu />
            <ThemeToggle />
          </div>
          <div className="flex justify-center mb-4">
            <Link to="/">
              <img 
                src="/lovable-uploads/a7a4a136-9773-4c6c-b3e7-97e3c66f0c08.png" 
                alt="Charta Logo" 
                className="h-24 w-auto md:h-32 hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload Excel files, visualize data, and build dashboards
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Data Management</h3>
              <DatasetManager
                currentData={data}
                currentColumns={columns}
                currentFileName={fileName}
                currentWorksheetName={worksheetName}
                onLoadDataset={handleLoadDataset}
              />
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} />
          </Card>

          {data.length > 0 && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className={`w-full ${
                isMobile 
                  ? 'flex overflow-x-auto justify-start gap-1 p-1' 
                  : 'grid grid-cols-5'
              }`}>
                <TabsTrigger 
                  value="preview" 
                  className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
                >
                  <Database className="h-4 w-4" />
                  <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Data' : 'Data Preview'}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="types" 
                  className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
                >
                  <Settings className="h-4 w-4" />
                  <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Types' : 'Column Types'}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ai-chat" 
                  disabled
                  className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2 opacity-50 cursor-not-allowed`}
                >
                  <Bot className="h-4 w-4" />
                  <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'AI' : 'AI Chat'}</span>
                  <Badge variant="secondary" className="text-xs ml-1">Soon</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="charts" 
                  className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className={isMobile ? 'text-xs' : ''}>{isMobile ? 'Charts' : 'Visualizations'}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className={`${isMobile ? 'flex-shrink-0' : ''} flex items-center gap-2`}
                >
                  <Layout className="h-4 w-4" />
                  <span className={isMobile ? 'text-xs' : ''}>Dashboard</span>
                </TabsTrigger>
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
              
              <TabsContent value="ai-chat" className="space-y-4">
                <Card className="p-6">
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">AI Data Chat</h3>
                    <p className="text-gray-600 mb-4">
                      Intelligent data analysis and visualization suggestions are coming soon!
                    </p>
                    <Badge variant="outline" className="text-sm">
                      Feature in Development
                    </Badge>
                  </div>
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
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Dashboard</h3>
                      <p className="text-sm text-gray-600">
                        {tiles.length === 0 
                          ? "Save visualizations as tiles to build your dashboard" 
                          : `${tiles.length} tile${tiles.length !== 1 ? 's' : ''} in dashboard`
                        }
                      </p>
                    </div>
                    <DashboardManager
                      tiles={tiles}
                      filters={filters}
                      currentDatasetId={currentDatasetId}
                      onLoadDashboard={handleLoadDashboard}
                    />
                  </div>
                </Card>
                
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
