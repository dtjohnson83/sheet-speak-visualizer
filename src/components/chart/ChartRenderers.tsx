
import React from 'react';
import { ChartRenderersProps } from '@/types';
import { KPIRenderer } from './KPIRenderer';
import { AggregationMethod } from './AggregationConfiguration';
import { BarChartRenderer } from './renderers/BarChartRenderer';
import { LineChartRenderer } from './renderers/LineChartRenderer';
import { AreaChartRenderer } from './renderers/AreaChartRenderer';
import { PieChartRenderer } from './renderers/PieChartRenderer';
import { ScatterChartRenderer } from './renderers/ScatterChartRenderer';
import { HistogramChartRenderer } from './renderers/HistogramChartRenderer';
import { TopXChartRenderer } from './renderers/TopXChartRenderer';
import { PlaceholderChartRenderer } from './renderers/PlaceholderChartRenderer';

interface ExtendedChartRenderersProps extends ChartRenderersProps {
  aggregationMethod?: AggregationMethod;
}

export const ChartRenderers = ({ 
  chartType, 
  data, 
  columns, 
  xColumn, 
  yColumn, 
  stackColumn, 
  sankeyTargetColumn, 
  valueColumn, 
  sortColumn, 
  sortDirection, 
  series, 
  showDataLabels, 
  chartColors,
  aggregationMethod = 'sum'
}: ExtendedChartRenderersProps) => {
  if (chartType === 'bar') {
    return (
      <BarChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        stackColumn={stackColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'line') {
    return (
      <LineChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'area') {
    return (
      <AreaChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        stackColumn={stackColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'pie') {
    return (
      <PieChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        showDataLabels={showDataLabels}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'scatter') {
    return (
      <ScatterChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'histogram') {
    return (
      <HistogramChartRenderer
        data={data}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'topX') {
    return (
      <TopXChartRenderer
        data={data}
        xColumn={xColumn}
        yColumn={yColumn}
        chartColors={chartColors}
      />
    );
  }
  
  if (chartType === 'kpi') {
    return (
      <KPIRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        valueColumn={valueColumn}
        series={series}
        chartColors={chartColors}
        aggregationMethod={aggregationMethod}
      />
    );
  }

  // Placeholder components for advanced chart types that need more complex implementation
  if (chartType === 'heatmap') {
    return <PlaceholderChartRenderer message="Heatmap Chart Renderer - Coming Soon" />;
  }

  if (chartType === 'sankey') {
    return <PlaceholderChartRenderer message="Sankey Chart Renderer - Coming Soon" />;
  }

  if (chartType === 'treemap') {
    return <PlaceholderChartRenderer message="Treemap Chart Renderer - Coming Soon" />;
  }

  return <PlaceholderChartRenderer message="Select a chart type to visualize your data." />;
};
