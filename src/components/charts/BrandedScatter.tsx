import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  ResponsiveContainer, 
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { 
  BrandedPrimitives,
  BrandedTooltip, 
  BrandedLegend 
} from './BrandedPrimitives';
import { getChartColors } from '@/lib/chartTheme';

export interface BrandedScatterProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  nameKey?: string;
  sizeKey?: string;
  height?: number;
  colors?: string[];
  series?: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  animated?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  formatTooltip?: (value: any) => string;
  domain?: {
    x?: [number | 'dataMin', number | 'dataMax'];
    y?: [number | 'dataMin', number | 'dataMax'];
  };
  sizeRange?: [number, number];
}

export const BrandedScatter = ({
  data,
  dataKey,
  xAxisKey,
  nameKey,
  sizeKey,
  height = 400,
  colors,
  series = [],
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  animated = true,
  xAxisLabel,
  yAxisLabel,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  domain,
  sizeRange = [64, 144]
}: BrandedScatterProps) => {
  const chartColors = getChartColors();
  const effectiveColors = colors || chartColors;
  const chartId = React.useId();

  // If no series provided, create a default one
  const effectiveSeries = series.length > 0 ? series : [{
    dataKey,
    name: nameKey || dataKey,
    color: effectiveColors[0]
  }];

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          data={data}
          className="chart-surface"
        >
          <BrandedPrimitives colors={effectiveColors} id={chartId} />
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="hsl(var(--chart-grid))"
              strokeOpacity={0.3}
              className="chart-grid-line"
            />
          )}
          
          <XAxis
            dataKey={xAxisKey}
            type="number"
            domain={domain?.x || ['dataMin', 'dataMax']}
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'hsl(var(--chart-tick))', 
              fontSize: 12,
              fontWeight: 400
            }}
            tickFormatter={formatXAxis}
            label={xAxisLabel ? { 
              value: xAxisLabel, 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fill: 'hsl(var(--chart-text-muted))' }
            } : undefined}
          />
          
          <YAxis
            dataKey={dataKey}
            type="number"
            domain={domain?.y || ['dataMin', 'dataMax']}
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'hsl(var(--chart-tick))', 
              fontSize: 12,
              fontWeight: 400
            }}
            tickFormatter={formatYAxis}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'hsl(var(--chart-text-muted))' }
            } : undefined}
          />
          
          {sizeKey && (
            <ZAxis 
              dataKey={sizeKey} 
              range={sizeRange}
            />
          )}
          
          {showTooltip && (
            <Tooltip 
              content={<BrandedTooltip valueFormatter={formatTooltip} labelFormatter={formatXAxis} />}
              cursor={{
                fill: 'hsl(var(--chart-primary) / 0.1)',
                radius: 4
              }}
            />
          )}
          
          {showLegend && (
            <Legend 
              content={<BrandedLegend />}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
          
          {effectiveSeries.map((s, index) => (
            <Scatter
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              fill={`url(#scatter-gradient-${chartId}-${index})`}
              stroke={s.color || effectiveColors[index % effectiveColors.length]}
              strokeWidth={2}
              className="chart-scatter-point"
              isAnimationActive={animated}
              animationBegin={index * 100}
              animationDuration={1200}
            >
              {data.map((entry, entryIndex) => (
                <Cell 
                  key={`cell-${entryIndex}`}
                  className="chart-scatter-cell"
                />
              ))}
            </Scatter>
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};