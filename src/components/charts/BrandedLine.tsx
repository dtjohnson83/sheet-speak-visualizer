import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { BrandedPrimitives, BrandedTooltip, BrandedLegend } from './BrandedPrimitives';
import { getChartColors } from '@/lib/chartTheme';
import { formatTooltipValue } from '@/lib/numberUtils';

interface BrandedLineProps {
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  colors?: string[];
  showDots?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  curved?: boolean;
  animated?: boolean;
  strokeWidth?: number;
  series?: Array<{
    dataKey: string;
    name?: string;
    color?: string;
    type?: 'monotone' | 'linear' | 'step';
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  formatTooltip?: (value: any) => string;
}

/**
 * Modern line chart with smooth curves, glowing points, and branded styling
 */
export const BrandedLine: React.FC<BrandedLineProps> = ({
  data,
  dataKey,
  xAxisKey = 'name',
  height = 400,
  colors,
  showDots = true,
  showGrid = true,
  showLegend = false,
  curved = true,
  animated = true,
  strokeWidth = 2.5,
  series = [],
  xAxisLabel,
  yAxisLabel,
  formatXAxis,
  formatYAxis = formatTooltipValue,
  formatTooltip = formatTooltipValue,
}) => {
  const chartColors = colors || getChartColors('modern');
  const chartId = `line-${Math.random().toString(36).substr(2, 9)}`;
  
  // Prepare series data
  const allSeries = [
    { dataKey, name: dataKey, color: chartColors[0], type: curved ? 'monotone' : 'linear' },
    ...series.map((s, index) => ({
      ...s,
      color: s.color || chartColors[(index + 1) % chartColors.length],
      type: s.type || (curved ? 'monotone' : 'linear')
    }))
  ];

  const CustomDot = (props: any) => {
    const { cx, cy, fill } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={fill}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        className="chart-point"
        style={{
          filter: `drop-shadow(0 0 8px ${fill}50)`,
          transition: 'all 0.2s ease-out'
        }}
      />
    );
  };

  const ActiveDot = (props: any) => {
    const { cx, cy, fill } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={fill}
        stroke="hsl(var(--background))"
        strokeWidth={3}
        className="chart-point-active"
        style={{
          filter: `drop-shadow(0 0 12px ${fill}70)`
        }}
      />
    );
  };

  return (
    <div className="chart-container chart-animate-in">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <BrandedPrimitives colors={chartColors} id={chartId} />
          
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
          
          <Tooltip 
            content={<BrandedTooltip valueFormatter={formatTooltip} />}
            cursor={{
              stroke: 'hsl(var(--chart-primary))',
              strokeWidth: 1,
              strokeOpacity: 0.5,
              strokeDasharray: '4 4'
            }}
          />
          
          {showLegend && (
            <Legend 
              content={<BrandedLegend />}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}

          {allSeries.map((seriesItem, index) => (
            <Line
              key={seriesItem.dataKey}
              type={seriesItem.type as any}
              dataKey={seriesItem.dataKey}
              stroke={seriesItem.color}
              strokeWidth={strokeWidth}
              dot={showDots ? <CustomDot /> : false}
              activeDot={<ActiveDot />}
              className="chart-line"
              isAnimationActive={animated}
              animationDuration={1000}
              animationEasing="ease-out"
              style={{
                filter: `drop-shadow(0 2px 4px ${seriesItem.color}30)`
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrandedLine;