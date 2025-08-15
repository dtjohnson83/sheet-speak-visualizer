import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  ResponsiveContainer, 
  ZAxis,
  Cell
} from 'recharts';
import { 
  BrandedXAxis, 
  BrandedYAxis, 
  BrandedGrid, 
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
          <defs>
            {effectiveColors.map((color, index) => (
              <linearGradient
                key={`scatter-gradient-${chartId}-${index}`}
                id={`scatter-gradient-${chartId}-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          
          {showGrid && <BrandedGrid />}
          
          <BrandedXAxis
            dataKey={xAxisKey}
            type="number"
            domain={domain?.x || ['dataMin', 'dataMax']}
            label={xAxisLabel}
            tickFormatter={formatXAxis}
          />
          
          <BrandedYAxis
            dataKey={dataKey}
            type="number"
            domain={domain?.y || ['dataMin', 'dataMax']}
            label={yAxisLabel}
            tickFormatter={formatYAxis}
          />
          
          {sizeKey && (
            <ZAxis 
              dataKey={sizeKey} 
              range={sizeRange} 
              className="chart-z-axis"
            />
          )}
          
          {showTooltip && (
            <BrandedTooltip
              formatter={formatTooltip}
              labelFormatter={formatXAxis}
            />
          )}
          
          {showLegend && <BrandedLegend />}
          
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