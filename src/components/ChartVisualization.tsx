
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useChartState } from '@/hooks/useChartState';
import { SeriesManager } from './chart/SeriesManager';
import { ChartConfiguration } from './chart/ChartConfiguration';
import { AggregationConfiguration } from './chart/AggregationConfiguration';
import { ChartContainer } from './chart/ChartContainer';
import { DashboardTileData } from './dashboard/DashboardTile';
import { useState } from 'react';

interface ChartVisualizationProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onSaveTile?: (tileData: Omit<DashboardTileData, 'id' | 'position' | 'size'>) => void;
}

export const ChartVisualization = ({ data, columns, onSaveTile }: ChartVisualizationProps) => {
  const [customTitle, setCustomTitle] = useState<string>('');

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

  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => col.type === 'categorical' || col.type === 'text');
  const dateColumns = columns.filter(col => col.type === 'date');

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
      sortColumn,
      sortDirection,
      series,
      showDataLabels
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        
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
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          showDataLabels={showDataLabels}
          setShowDataLabels={setShowDataLabels}
          supportsDataLabels={supportsDataLabels}
          selectedPalette={selectedPalette}
          setSelectedPalette={setSelectedPalette}
          columns={columns}
          numericColumns={numericColumns}
          categoricalColumns={categoricalColumns}
          dateColumns={dateColumns}
        />

        <div className="mt-4">
          <AggregationConfiguration
            aggregationMethod={aggregationMethod}
            setAggregationMethod={setAggregationMethod}
            yColumn={yColumn}
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
        data={data}
        columns={columns}
        chartType={chartType}
        xColumn={xColumn}
        yColumn={yColumn}
        stackColumn={stackColumn}
        sankeyTargetColumn={sankeyTargetColumn}
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
