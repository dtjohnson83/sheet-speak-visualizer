import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataSourceSelector } from './DataSourceSelector';
import { DataSourceConnectionDialog } from './DataSourceConnectionDialog';
import { RealtimeDataConfig } from '@/components/realtime/RealtimeDataConfig';
import { Database, Wifi, Globe, Settings } from 'lucide-react';
import { useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useRealtimeData } from '@/contexts/RealtimeDataContext';
import { detectColumnTypes } from '@/lib/columnTypeDetection';

interface DataSourcesTabProps {
  selectedDataSource: string;
  showDataSourceDialog: boolean;
  onDataSourceSelect: (type: string) => void;
  onDataSourceDialogChange: (open: boolean) => void;
  onDataLoaded: (loadedData: DataRow[], detectedColumns: ColumnInfo[], name: string, worksheet?: string) => void;
}

export const DataSourcesTab = ({
  selectedDataSource,
  showDataSourceDialog,
  onDataSourceSelect,
  onDataSourceDialogChange,
  onDataLoaded,
}: DataSourcesTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState("static");
  const { latestUpdates, getLatestData } = useRealtimeData();

  const handleUseRealtimeDataForVisualization = (sourceId: string) => {
    console.log('🚀 Use for Charts button clicked for source:', sourceId);
    
    const realtimeUpdate = getLatestData(sourceId);
    console.log('📊 Retrieved realtime data:', {
      hasUpdate: !!realtimeUpdate,
      dataLength: realtimeUpdate?.data?.length || 0,
      hasColumns: !!realtimeUpdate?.columns,
      timestamp: realtimeUpdate?.timestamp
    });
    
    if (!realtimeUpdate) {
      console.error('❌ No realtime data found for source:', sourceId);
      return;
    }
    
    if (!realtimeUpdate.data || realtimeUpdate.data.length === 0) {
      console.error('❌ Realtime data is empty for source:', sourceId);
      return;
    }
    
    try {
      // Transform realtime data to match our format
      const transformedData = realtimeUpdate.data;
      console.log('🔄 Transforming data:', {
        originalLength: transformedData.length,
        sampleRow: transformedData[0]
      });
      
      // Detect column types automatically or use provided columns
      let detectedColumns: ColumnInfo[];
      if (realtimeUpdate.columns && realtimeUpdate.columns.length > 0) {
        detectedColumns = realtimeUpdate.columns;
        console.log('✅ Using provided columns:', detectedColumns.length);
      } else {
        detectedColumns = detectColumnTypes(transformedData);
        console.log('🔍 Auto-detected columns:', detectedColumns.length);
      }
      
      console.log('📈 Loading data into visualization system...', {
        dataRows: transformedData.length,
        columns: detectedColumns.length,
        columnNames: detectedColumns.map(c => c.name)
      });
      
      // Load the data into the main visualization system
      onDataLoaded(
        transformedData, 
        detectedColumns, 
        `Live API Data (${sourceId})`,
        'realtime'
      );
      
      console.log('✅ Successfully loaded realtime data for visualization');
    } catch (error) {
      console.error('❌ Error loading realtime data for visualization:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Data Sources</h2>
        <p className="text-sm text-muted-foreground ml-2">
          Connect to databases, APIs, and real-time data streams
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="static" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Static Sources
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Real-time Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="static" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                External Data Sources
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect to databases, APIs, and cloud services for one-time data import
              </p>
            </CardHeader>
            <CardContent>
              <DataSourceSelector 
                onSelect={(type) => {
                  onDataSourceSelect(type);
                  onDataSourceDialogChange(true);
                }}
                selectedType={selectedDataSource}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Real-time Data Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set up continuous data streams for live dashboard updates
              </p>
            </CardHeader>
            <CardContent>
              <RealtimeDataConfig onUseForVisualization={handleUseRealtimeDataForVisualization} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DataSourceConnectionDialog
        open={showDataSourceDialog}
        onOpenChange={onDataSourceDialogChange}
        sourceType={selectedDataSource}
        onSuccess={onDataLoaded}
      />
    </div>
  );
};