
import { DataRow, ColumnInfo } from '@/pages/Index';
import { WorksheetData } from '@/types/worksheet';
import { ChartContainer } from './chart/ChartContainer';
import { DashboardTileData } from './dashboard/DashboardTile';
import { useState } from 'react';
import { ChartDataManager } from './chart/ChartDataManager';
import { ChartConfigurationManager } from './chart/ChartConfigurationManager';

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

  const handleDataSourceChange = (newData: DataRow[], newColumns: ColumnInfo[]) => {
    setActiveData(newData);
    setActiveColumns(newColumns);
  };

  const handleColumnSelectionReset = () => {
    setValueColumn('');
  };

  const configManager = ChartConfigurationManager({
    columns: activeColumns,
    customTitle,
    setCustomTitle,
    valueColumn,
    setValueColumn
  });

  const handleSaveTile = () => {
    if (!configManager.xColumn || !configManager.yColumn || !onSaveTile) return;
    
    const defaultTitle = `${configManager.chartType.charAt(0).toUpperCase() + configManager.chartType.slice(1).replace('-', ' ')} - ${configManager.xColumn} vs ${configManager.yColumn}`;
    const title = customTitle || defaultTitle;
    
    onSaveTile({
      title,
      chartType: configManager.chartType,
      xColumn: configManager.xColumn,
      yColumn: configManager.yColumn,
      stackColumn: configManager.stackColumn,
      sankeyTargetColumn: configManager.sankeyTargetColumn,
      valueColumn: configManager.valueColumn,
      sortColumn: configManager.sortColumn,
      sortDirection: configManager.sortDirection,
      series: configManager.series,
      showDataLabels: configManager.showDataLabels,
      worksheetId: 'joined' // This will need to be updated based on data source
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
        
        <configManager.ChartConfigurationComponent />

        <div className="mt-4">
          <configManager.AggregationConfigurationComponent />
        </div>

        {configManager.SeriesManagerComponent && (
          <configManager.SeriesManagerComponent />
        )}
      </div>

      <ChartContainer
        data={activeData}
        columns={activeColumns}
        chartType={configManager.chartType}
        xColumn={configManager.xColumn}
        yColumn={configManager.yColumn}
        stackColumn={configManager.stackColumn}
        sankeyTargetColumn={configManager.sankeyTargetColumn}
        valueColumn={configManager.valueColumn}
        sortColumn={configManager.sortColumn}
        sortDirection={configManager.sortDirection}
        series={configManager.series}
        aggregationMethod={configManager.aggregationMethod}
        showDataLabels={configManager.showDataLabels}
        supportsMultipleSeries={configManager.supportsMultipleSeries}
        chartColors={configManager.chartColors}
        onSaveTile={handleSaveTile}
        customTitle={customTitle}
        onTitleChange={setCustomTitle}
      />
    </div>
  );
};
