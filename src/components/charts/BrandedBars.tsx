import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { BrandedPrimitives, BrandedTooltip, BrandedLegend } from './BrandedPrimitives';
import { getChartColors } from '@/lib/chartTheme';
import { formatTooltipValue } from '@/lib/numberUtils';

interface BrandedBarsProps {
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showDataLabels?: boolean;
  stacked?: boolean;
  animated?: boolean;
  series?: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  formatTooltip?: (value: any) => string;
  barRadius?: number;
  maxBarSize?: number;
}

/**
 * Modern bar chart with rounded corners, gradients, and branded styling
 */
export const BrandedBars: React.FC<BrandedBarsProps> = ({
  data,
  dataKey,
  xAxisKey = 'name',
  height = 400,
  colors,
  showGrid = true,
  showLegend = false,
  showDataLabels = false,
  stacked = false,
  animated = true,
  series = [],
  xAxisLabel,
  yAxisLabel,
  formatXAxis,
  formatYAxis = formatTooltipValue,
  formatTooltip = formatTooltipValue,
  barRadius = 6,
  maxBarSize = 60,
}) => {
  console.log('🔵 BrandedBars - Rendering with:', { 
    dataLength: data?.length, 
    dataKey, 
    xAxisKey, 
    sampleData: data?.slice(0, 2),
    series: series.length
  });
  
  const chartColors = colors || getChartColors('modern');
  const chartId = `bar-${Math.random().toString(36).substr(2, 9)}`;
  
  // Prepare series data
  const allSeries = [
    { dataKey, name: dataKey, color: chartColors[0] },
    ...series.map((s, index) => ({
      ...s,
      color: s.color || chartColors[(index + 1) % chartColors.length]
    }))
  ];

  // Custom bar shape with rounded top corners
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height } = props;
    const radius = Math.min(barRadius, width / 2);
    
    return (
      <g>
        <defs>
          <clipPath id={`bar-clip-${x}-${y}`}>
            <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius} />
          </clipPath>
        </defs>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={radius}
          ry={radius}
          className="chart-bar"
          style={{
            filter: `drop-shadow(0 4px 12px ${fill}30)`
          }}
        />
      </g>
    );
  };

  // Data label renderer
  const renderDataLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill="var(--chart-text)" 
        textAnchor="middle" 
        fontSize="12"
        fontWeight="500"
        opacity={0.8}
      >
        {formatTooltip(value)}
      </text>
    );
  };

  return (
    <div className="chart-container chart-animate-in">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          margin={{ top: showDataLabels ? 40 : 20, right: 30, left: 20, bottom: 20 }}
          barCategoryGap="20%"
        >
          <BrandedPrimitives colors={chartColors} id={chartId} />
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="var(--chart-grid)"
              strokeOpacity={0.3}
              className="chart-grid-line"
              vertical={false}
            />
          )}
          
          <XAxis 
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'var(--chart-tick)', 
              fontSize: 12,
              fontWeight: 400
            }}
            tickFormatter={formatXAxis}
            label={xAxisLabel ? { 
              value: xAxisLabel, 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fill: 'var(--chart-text-muted)' }
            } : undefined}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'var(--chart-tick)', 
              fontSize: 12,
              fontWeight: 400
            }}
            tickFormatter={formatYAxis}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'var(--chart-text-muted)' }
            } : undefined}
          />
          
          <Tooltip 
            content={<BrandedTooltip valueFormatter={formatTooltip} />}
            cursor={{
              fill: 'hsl(var(--chart-primary) / 0.1)',
              radius: 4
            }}
          />
          
          {showLegend && (
            <Legend 
              content={<BrandedLegend />}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}

          {allSeries.map((seriesItem, index) => (
            <Bar
              key={seriesItem.dataKey}
              dataKey={seriesItem.dataKey}
              fill={`url(#${chartId}-bar-gradient-${index === 0 ? 'primary' : 'secondary'})`}
              radius={[barRadius, barRadius, 2, 2]}
              maxBarSize={maxBarSize}
              label={showDataLabels ? renderDataLabel : false}
              stackId={stacked ? 'stack' : undefined}
              isAnimationActive={animated}
              animationDuration={1000}
              animationEasing="ease-out"
              className="chart-bar"
            >
              {!stacked && data.map((entry, cellIndex) => (
                <Cell 
                  key={`cell-${cellIndex}`}
                  fill={`url(#${chartId}-bar-gradient-${index === 0 ? 'primary' : 'secondary'})`}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrandedBars;