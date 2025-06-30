import React from 'react';
import { ChartRenderersProps } from '@/types';
import { KPIRenderer } from './KPIRenderer';
import { AggregationMethod } from './AggregationConfiguration';

// Placeholder components for chart renderers that don't exist yet
const BarChartRenderer = ({ data, xColumn, yColumn, series, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Bar Chart Renderer - Coming Soon</p>
  </div>
);

const LineChartRenderer = ({ data, xColumn, yColumn, series, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Line Chart Renderer - Coming Soon</p>
  </div>
);

const AreaChartRenderer = ({ data, xColumn, yColumn, series, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Area Chart Renderer - Coming Soon</p>
  </div>
);

const PieChartRenderer = ({ data, xColumn, yColumn, series, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Pie Chart Renderer - Coming Soon</p>
  </div>
);

const ScatterPlotRenderer = ({ data, xColumn, yColumn, series, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Scatter Plot Renderer - Coming Soon</p>
  </div>
);

const HeatmapChartRenderer = ({ data, xColumn, yColumn, valueColumn, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Heatmap Chart Renderer - Coming Soon</p>
  </div>
);

const HistogramChartRenderer = ({ data, xColumn, yColumn, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Histogram Chart Renderer - Coming Soon</p>
  </div>
);

const SankeyChartRenderer = ({ data, xColumn, sankeyTargetColumn, valueColumn, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Sankey Chart Renderer - Coming Soon</p>
  </div>
);

const TreemapChartRenderer = ({ data, xColumn, yColumn, valueColumn, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Treemap Chart Renderer - Coming Soon</p>
  </div>
);

const TopXChartRenderer = ({ data, xColumn, yColumn, sortColumn, sortDirection, chartColors }: any) => (
  <div className="flex items-center justify-center h-64">
    <p className="text-muted-foreground">Top X Chart Renderer - Coming Soon</p>
  </div>
);

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
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        stackColumn={stackColumn}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        series={series}
        showDataLabels={showDataLabels}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'line') {
    return (
      <LineChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        showDataLabels={showDataLabels}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'area') {
    return (
      <AreaChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        stackColumn={stackColumn}
        series={series}
        showDataLabels={showDataLabels}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'pie') {
    return (
      <PieChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        showDataLabels={showDataLabels}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'scatter') {
    return (
      <ScatterPlotRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        showDataLabels={showDataLabels}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'heatmap') {
    return (
      <HeatmapChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        valueColumn={valueColumn}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'histogram') {
    return (
      <HistogramChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'sankey') {
    return (
      <SankeyChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        sankeyTargetColumn={sankeyTargetColumn}
        valueColumn={valueColumn}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'treemap') {
    return (
      <TreemapChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        valueColumn={valueColumn}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'topX') {
    return (
      <TopXChartRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
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

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Select a chart type to visualize your data.</p>
    </div>
  );
};
