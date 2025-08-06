
import React from 'react';
import { ChartRenderersProps } from '@/types';
import { DataRow } from '@/pages/Index';
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
import { ChartErrorBoundary } from './renderers/ChartErrorBoundary';

interface ExtendedChartRenderersProps extends ChartRenderersProps {
  aggregationMethod?: AggregationMethod;
  zColumn?: string;
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
  mapboxApiKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const ChartRenderers = ({
  data,
  chartType,
  columns,
  xColumn,
  yColumn,
  series,
  chartColors,
  showDataLabels,
  stackColumn,
  sankeyTargetColumn,
  valueColumn,
  aggregationMethod,
  zColumn,
  isTemporalAnimated = false,
  animationSpeed = 1000,
  mapboxApiKey,
  xAxisLabel,
  yAxisLabel
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
        isTemporalAnimated={isTemporalAnimated}
        animationSpeed={animationSpeed}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
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
        isTemporalAnimated={isTemporalAnimated}
        animationSpeed={animationSpeed}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
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
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
      />
    );
  }

  if (chartType === 'pie') {
    return (
      <PieChartRenderer
        data={data}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        isTemporalAnimated={isTemporalAnimated}
        animationSpeed={animationSpeed}
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
        isTemporalAnimated={isTemporalAnimated}
        animationSpeed={animationSpeed}
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
      <Chart3DContainer isTemporalAnimated={isTemporalAnimated}>
        <Bar3DChartRenderer
          data={data}
          xColumn={xColumn}
          yColumn={yColumn}
          zColumn={zColumn}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
          isTemporalAnimated={isTemporalAnimated}
          animationSpeed={animationSpeed}
        />
      </Chart3DContainer>
    );
  }

  if (chartType === 'scatter3d') {
    // Get numeric columns from the available columns
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const validZColumn = zColumn || (numericColumns.length > 2 ? numericColumns[2].name : stackColumn) || yColumn;
    
    return (
      <Chart3DContainer isTemporalAnimated={isTemporalAnimated}>
        <Scatter3DChartRenderer
          data={data}
          xColumn={xColumn}
          yColumn={yColumn}
          zColumn={validZColumn}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
          isTemporalAnimated={isTemporalAnimated}
          animationSpeed={animationSpeed}
        />
      </Chart3DContainer>
    );
  }

  if (chartType === 'surface3d') {
    // Get numeric columns from the available columns
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const validZColumn = zColumn || (numericColumns.length > 2 ? numericColumns[2].name : stackColumn) || yColumn;
    
    return (
      <Chart3DContainer isTemporalAnimated={isTemporalAnimated}>
        <Surface3DChartRenderer
          data={data}
          xColumn={xColumn}
          yColumn={yColumn}
          zColumn={validZColumn}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
          isTemporalAnimated={isTemporalAnimated}
          animationSpeed={animationSpeed}
        />
      </Chart3DContainer>
    );
  }

  // Graph Visualizations
  if (chartType === 'network') {
    return (
      <ChartErrorBoundary>
        <NetworkGraphRenderer
          data={data}
          columns={columns}
          xColumn={xColumn}
          yColumn={yColumn}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
        />
      </ChartErrorBoundary>
    );
  }

  if (chartType === 'network3d') {
    return (
      <ChartErrorBoundary>
        <Chart3DContainer height={400} isTemporalAnimated={isTemporalAnimated}>
          <Network3DGraphRenderer
            data={data}
            columns={columns}
            xColumn={xColumn}
            yColumn={yColumn}
            chartColors={chartColors}
            showDataLabels={showDataLabels}
            isTemporalAnimated={isTemporalAnimated}
            animationSpeed={animationSpeed}
          />
        </Chart3DContainer>
      </ChartErrorBoundary>
    );
  }

  if (chartType === 'entity-relationship') {
    return (
      <ChartErrorBoundary>
        <EntityRelationshipRenderer
          data={data}
          columns={columns}
          xColumn={xColumn}
          yColumn={yColumn}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
        />
      </ChartErrorBoundary>
    );
  }

  if (chartType === 'map2d') {
    return (
      <ChartErrorBoundary>
        <React.Suspense fallback={<div className="text-center p-4">Loading map...</div>}>
          {(() => {
            const Map2DChartRenderer = React.lazy(() => import('./renderers/Map2DChartRenderer').then(m => ({ default: m.Map2DChartRenderer })));
            return (
              <Map2DChartRenderer
                data={data}
                xColumn={xColumn}
                yColumn={yColumn}
                seriesColumn={series[0]?.column}
                colors={chartColors}
                showDataLabels={showDataLabels}
                mapboxApiKey={mapboxApiKey}
              />
            );
          })()}
        </React.Suspense>
      </ChartErrorBoundary>
    );
  }

  if (chartType === 'map3d') {
    return (
      <ChartErrorBoundary>
        <React.Suspense fallback={<div className="text-center p-4">Loading 3D map...</div>}>
          {(() => {
            const Map3DChartRenderer = React.lazy(() => import('./renderers/Map3DChartRenderer').then(m => ({ default: m.Map3DChartRenderer })));
            return (
              <Map3DChartRenderer
                data={data}
                xColumn={xColumn}
                yColumn={yColumn}
                zColumn={zColumn}
                seriesColumn={series[0]?.column}
                colors={chartColors}
                showDataLabels={showDataLabels}
                mapboxApiKey={mapboxApiKey}
              />
            );
          })()}
        </React.Suspense>
      </ChartErrorBoundary>
    );
  }

  if (chartType === 'stacked-bar') {
    return (
      <BarChartRenderer
        data={data as DataRow[]}
        xColumn={xColumn}
        yColumn={yColumn}
        series={series}
        stackColumn={stackColumn || 'stack'}
        chartColors={chartColors}
        showDataLabels={showDataLabels}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
      />
    );
  }

  if (chartType === 'sankey') {
    const SankeyChartRenderer = React.lazy(() => 
      import('./renderers/SankeyChartRenderer').then(module => ({ default: module.SankeyChartRenderer }))
    );

    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-64">Loading Sankey chart...</div>}>
        <SankeyChartRenderer
          data={data as any}
          chartColors={chartColors}
          showDataLabels={showDataLabels}
        />
      </React.Suspense>
    );
  }

  return <PlaceholderChartRenderer message="Select a chart type to visualize your data." />;
};
