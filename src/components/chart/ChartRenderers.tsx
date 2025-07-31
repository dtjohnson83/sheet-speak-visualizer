
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
import { HeatmapChartRenderer } from './renderers/HeatmapChartRenderer';
import { TreemapChartRenderer } from './renderers/TreemapChartRenderer';
import { PlaceholderChartRenderer } from './renderers/PlaceholderChartRenderer';
import { Chart3DContainer } from './Chart3DContainer';
import { Bar3DChartRenderer } from './renderers/Bar3DChartRenderer';
import { Scatter3DChartRenderer } from './renderers/Scatter3DChartRenderer';
import { Surface3DChartRenderer } from './renderers/Surface3DChartRenderer';
import { NetworkGraphRenderer } from './renderers/NetworkGraphRenderer';
import { Network3DGraphRenderer } from './renderers/Network3DGraphRenderer';
import { EntityRelationshipRenderer } from './renderers/EntityRelationshipRenderer';

interface ExtendedChartRenderersProps extends ChartRenderersProps {
  aggregationMethod?: AggregationMethod;
  zColumn?: string;
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
  aggregationMethod = 'sum',
  zColumn
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
        chartColors={chartColors}
        showDataLabels={showDataLabels}
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
        showDataLabels={showDataLabels}
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

  if (chartType === 'heatmap') {
    return (
      <HeatmapChartRenderer
        data={data}
        chartColors={chartColors}
      />
    );
  }

  if (chartType === 'treemap') {
    return (
      <TreemapChartRenderer
        data={data}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
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

  // 3D Charts
  if (chartType === 'bar3d') {
    return (
      <Chart3DContainer>
        <Bar3DChartRenderer
          data={data}
          xColumn={xColumn}
          yColumn={yColumn}
          zColumn={zColumn}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
        />
      </Chart3DContainer>
    );
  }

  if (chartType === 'scatter3d') {
    return (
      <Chart3DContainer>
        <Scatter3DChartRenderer
          data={data}
          xColumn={xColumn}
          yColumn={yColumn}
          zColumn={zColumn || stackColumn || 'z'}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
        />
      </Chart3DContainer>
    );
  }

  if (chartType === 'surface3d') {
    return (
      <Chart3DContainer>
        <Surface3DChartRenderer
          data={data}
          xColumn={xColumn}
          yColumn={yColumn}
          zColumn={zColumn || stackColumn || 'z'}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
        />
      </Chart3DContainer>
    );
  }

  // Graph Visualizations
  if (chartType === 'network') {
    return (
      <NetworkGraphRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'network3d') {
    return (
      <Network3DGraphRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  if (chartType === 'entity-relationship') {
    return (
      <EntityRelationshipRenderer
        data={data}
        columns={columns}
        xColumn={xColumn}
        yColumn={yColumn}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
      />
    );
  }

  return <PlaceholderChartRenderer message="Select a chart type to visualize your data." />;
};
