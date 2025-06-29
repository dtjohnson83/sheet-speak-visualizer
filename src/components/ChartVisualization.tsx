
import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetData } from '@/types/worksheet';
import { ChartContainer } from './chart/ChartContainer';
import { DashboardTileData } from './dashboard/DashboardTile';
import { useState } from 'react';
import { ChartDataManager } from './chart/ChartDataManager';
import { ChartConfigurationManager } from './chart/ChartConfigurationManager';
import { useChartState } from '@/hooks/useChartState';

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
  const [activeData, setActiveData] = useState<DataRow[]>(data);
  const [activeColumns, setActiveColumns] = useState<ColumnInfo[]>(columns);

  const {
    chartType,
    xColumn,
    yColumn,
    stackColumn,
    sankeyTargetColumn,
    sortColumn,
    sortDirection,
    series,
    aggregationMethod,
    showDataLabels,
    supportsMultipleSeries,
    chartColors
  } = useChartState();

  const handleDataSourceChange = (newData: DataRow[], newColumns: ColumnInfo[]) => {
    setActiveData(newData);
    setActiveColumns(newColumns);
  };

  const handleColumnSelectionReset = () => {
    setValueColumn('');
  };

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
      worksheetId: 'joined'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
        <ChartDataManager
          worksheets={worksheets}
          selectedWorksheet={selectedWorksheet}
          onDataSourceChange={handleDataSourceChange}
          onColumnSelectionReset={handleColumnSelectionReset}
        />
        
        <ChartConfigurationManager
          columns={activeColumns}
          customTitle={customTitle}
          setCustomTitle={setCustomTitle}
          valueColumn={valueColumn}
          setValueColumn={setValueColumn}
        />
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
