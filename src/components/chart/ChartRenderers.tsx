import React from 'react';
import { BarChartRenderer } from './BarChartRenderer';
import { LineChartRenderer } from './LineChartRenderer';
import { AreaChartRenderer } from './AreaChartRenderer';
import { PieChartRenderer } from './PieChartRenderer';
import { ScatterPlotRenderer } from './ScatterPlotRenderer';
import { HeatmapChartRenderer } from './HeatmapChartRenderer';
import { HistogramChartRenderer } from './HistogramChartRenderer';
import { SankeyChartRenderer } from './SankeyChartRenderer';
import { TreemapChartRenderer } from './TreemapChartRenderer';
import { TopXChartRenderer } from './TopXChartRenderer';
import { ChartRenderersProps } from '@/types';
import { KPIRenderer } from './KPIRenderer';

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
  chartColors 
}: ChartRenderersProps) => {
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
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Select a chart type to visualize your data.</p>
    </div>
  );
};
