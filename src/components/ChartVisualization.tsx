import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetData } from '@/types/worksheet';
import { useChartState } from '@/hooks/useChartState';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { ChartContainer } from './chart/ChartContainer';
import { DataSourceSelector } from './chart/DataSourceSelector';
import { DashboardTileData } from './dashboard/DashboardTile';
import { useState, useMemo } from 'react';
import { MultiWorksheetSelector } from './chart/MultiWorksheetSelector';
import { detectCrossWorksheetRelations, CrossWorksheetRelation, JoinConfiguration } from '@/lib/crossWorksheetRelations';
import { joinWorksheetData, JoinedDataset } from '@/lib/dataJoiner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'lucide-react';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
  worksheets: WorksheetData[];
  selectedWorksheet: WorksheetData | null;
  onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void;
}

export const ChartVisualization = ({ 
  data, 
  columns, 
  worksheets, 
  selectedWorksheet, 
  onSaveTile 
}: ChartVisualizationProps) => {
  const [customTitle, setCustomTitle] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [chartDataSource, setChartDataSource] = useState<WorksheetData | null>(selectedWorksheet);
  const [selectedWorksheets, setSelectedWorksheets] = useState<string[]>([]);
  const [joinConfig, setJoinConfig] = useState<JoinConfiguration | null>(null);

  // Detect relationships between worksheets
  const crossWorksheetRelations = useMemo(() => {
    if (worksheets.length > 1) {
      return detectCrossWorksheetRelations(worksheets);
    }
    return [];
  }, [worksheets]);

  // Create joined dataset when multiple worksheets are selected
  const joinedDataset = useMemo<JoinedDataset | null>(() => {
    if (joinConfig && selectedWorksheets.length > 1) {
      try {
        return joinWorksheetData(worksheets, joinConfig);
      } catch (error) {
        console.error('Failed to join worksheets:', error);
        return null;
      }
    }
    return null;
  }, [worksheets, joinConfig, selectedWorksheets]);

  const {
    chartType,
    setChartType,
    xColumn,
    setXColumn,
    yColumn,
    setYColumn,
    stackColumn,
    setStackColumn,
    sankeyTargetColumn,
    setSankeyTargetColumn,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    series,
    setSeries,
    aggregationMethod,
    setAggregationMethod,
    showDataLabels,
    setShowDataLabels,
    selectedPalette,
    setSelectedPalette,
    chartColors,
    supportsMultipleSeries,
    supportsDataLabels
  } = useChartState();

  // Determine active data and columns with proper debug logging
  const activeData = joinedDataset?.data || chartDataSource?.data || data;
  const activeColumns = joinedDataset?.columns || chartDataSource?.columns || columns;
  
  console.log('ChartVisualization active columns:', activeColumns.map(col => ({ 
    name: col.name, 
    type: col.type, 
    worksheet: col.worksheet || 'default' 
  })));
  
  // Filter columns properly, ensuring they exist and have the right types
  const numericColumns = activeColumns.filter(col => 
    col && col.type === 'numeric' && col.name
  );
  const categoricalColumns = activeColumns.filter(col => 
    col && (col.type === 'categorical' || col.type === 'text') && col.name
  );
  const dateColumns = activeColumns.filter(col => 
    col && col.type === 'date' && col.name
  );

  console.log('Filtered columns:', {
    numeric: numericColumns.map(col => col.name),
    categorical: categoricalColumns.map(col => col.name),
    date: dateColumns.map(col => col.name)
  });

  const handleSaveTile = () => {
    if (!xColumn || !yColumn || !onSaveTile) return;
    
    const defaultTitle = `${chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('-', ' ')} - ${xColumn} vs ${yColumn}`;
    const title = customTitle || defaultTitle;
    
    onSaveTile({
      title,
      chartType,
      xColumn,
      yColumn,
      stackColumn,
      sankeyTargetColumn,
      valueColumn,
      sortColumn,
      sortDirection,
      series,
      showDataLabels,
      worksheetId: joinedDataset ? 'joined' : chartDataSource?.id
    });
  };

  const handleSingleWorksheetChange = (worksheet: WorksheetData | null) => {
    setChartDataSource(worksheet);
    // Reset column selections when changing data source
    setXColumn('');
    setYColumn('');
    setStackColumn('');
    setValueColumn('');
    setSortColumn('none');
  };

  const handleMultiWorksheetChange = (worksheetIds: string[]) => {
    setSelectedWorksheets(worksheetIds);
    if (worksheetIds.length === 0) {
      setJoinConfig(null);
    }
    // Reset column selections when changing worksheets
    setXColumn('');
    setYColumn('');
    setStackColumn('');
    setValueColumn('');
    setSortColumn('none');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
        {worksheets.length > 1 && (
          <MultiWorksheetSelector
            worksheets={worksheets}
            relations={crossWorksheetRelations}
            selectedWorksheets={selectedWorksheets}
            joinConfig={joinConfig}
            onWorksheetsChange={handleMultiWorksheetChange}
            onJoinConfigChange={setJoinConfig}
            onSingleWorksheetChange={handleSingleWorksheetChange}
          />
        )}
        
        {worksheets.length === 1 && (
          <DataSourceSelector
            worksheets={worksheets}
            selectedWorksheet={chartDataSource}
            onWorksheetChange={handleSingleWorksheetChange}
          />
        )}

        {joinedDataset && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Link className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Joined Dataset</span>
              <Badge variant="secondary">{joinedDataset.data.length} rows, {joinedDataset.columns.length} columns</Badge>
            </div>
            <p className="text-xs text-blue-700 whitespace-pre-line">
              {joinedDataset.joinSummary}
            </p>
          </Card>
        )}
        
        <ChartConfiguration
          chartType={chartType}
          setChartType={setChartType}
          xColumn={xColumn}
          setXColumn={setXColumn}
          yColumn={yColumn}
          setYColumn={setYColumn}
          stackColumn={stackColumn}
          setStackColumn={setStackColumn}
          sankeyTargetColumn={sankeyTargetColumn}
          setSankeyTargetColumn={setSankeyTargetColumn}
          valueColumn={valueColumn}
          setValueColumn={setValueColumn}
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          showDataLabels={showDataLabels}
          setShowDataLabels={setShowDataLabels}
          supportsDataLabels={supportsDataLabels}
          selectedPalette={selectedPalette}
          setSelectedPalette={setSelectedPalette}
          columns={activeColumns}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
        />

        <div className="mt-4">
          <AggregationConfiguration
            aggregationMethod={aggregationMethod}
            setAggregationMethod={setAggregationMethod}
            yColumn={yColumn}
            chartType={chartType}
            numericColumns={numericColumns}
          />
        </div>

        {supportsMultipleSeries && (
          <SeriesManager
            series={series}
            setSeries={setSeries}
            numericColumns={numericColumns}
            yColumn={yColumn}
            chartColors={chartColors}
          />
        )}
      </div>

      <ChartContainer
        data={activeData}
        columns={activeColumns}
        chartType={chartType}
        xColumn={xColumn}
        yColumn={yColumn}
        stackColumn={stackColumn}
        sankeyTargetColumn={sankeyTargetColumn}
        valueColumn={valueColumn}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        series={series}
        aggregationMethod={aggregationMethod}
        showDataLabels={showDataLabels}
        supportsMultipleSeries={supportsMultipleSeries}
        chartColors={chartColors}
        onSaveTile={handleSaveTile}
        customTitle={customTitle}
        onTitleChange={setCustomTitle}
      />
    </div>
  );
};
