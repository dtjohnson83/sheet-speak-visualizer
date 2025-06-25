
import { useState } from 'react';

export interface SeriesConfig {
  id: string;
  column: string;
  color: string;
}

export const useChartState = () => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'stacked-bar' | 'treemap' | 'sankey'>('bar');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');
  const [stackColumn, setStackColumn] = useState<string>('');
  const [sankeyTargetColumn, setSankeyTargetColumn] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [series, setSeries] = useState<SeriesConfig[]>([]);

  const chartColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
    '#ff0000', '#00ffff', '#ff00ff', '#ffff00', '#0000ff'
  ];

  const multiSeriesChartTypes = ['bar', 'line', 'scatter'];
  const supportsMultipleSeries = multiSeriesChartTypes.includes(chartType);

  const handleChartTypeChange = (newType: any) => {
    setChartType(newType);
    if (!multiSeriesChartTypes.includes(newType)) {
      setSeries([]);
    }
  };

  return {
    chartType,
    setChartType: handleChartTypeChange,
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
    chartColors,
    supportsMultipleSeries
  };
};
