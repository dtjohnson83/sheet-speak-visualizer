import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { BrandedPrimitives, BrandedTooltip, BrandedLegend } from './BrandedPrimitives';
import { getChartColors } from '@/lib/chartTheme';
import { formatTooltipValue } from '@/lib/numberUtils';

interface BrandedPieProps {
  data: any[];
  dataKey: string;
  nameKey?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  startAngle?: number;
  endAngle?: number;
  formatTooltip?: (value: any) => string;
  formatLabel?: (value: any) => string;
}

/**
 * Modern pie chart with gradients, hover effects, and branded styling
 */
export const BrandedPie: React.FC<BrandedPieProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  height = 400,
  colors,
  showLegend = true,
  showLabels = false,
  animated = true,
  innerRadius = 0,
  outerRadius = 120,
  paddingAngle = 2,
  startAngle = 90,
  endAngle = 450,
  formatTooltip = formatTooltipValue,
  formatLabel,
}) => {
  const chartColors = colors || getChartColors('modern');
  const chartId = `pie-${Math.random().toString(36).substr(2, 9)}`;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Custom label renderer
  const renderLabel = (entry: any) => {
    if (!showLabels) return null;
    const value = formatLabel ? formatLabel(entry.value) : formatTooltip(entry.value);
    return `${entry[nameKey]}: ${value}`;
  };

  // Handle hover
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Calculate total for percentage
  const total = data.reduce((sum, entry) => sum + (entry[dataKey] || 0), 0);

  // Enhanced data with percentages
  const enhancedData = data.map((entry, index) => ({
    ...entry,
    percentage: total > 0 ? ((entry[dataKey] || 0) / total) * 100 : 0,
    color: chartColors[index % chartColors.length]
  }));

  // Custom active shape
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text 
          x={cx} 
          y={cy} 
          dy={8} 
          textAnchor="middle" 
          fill="hsl(var(--chart-text))"
          fontSize="14"
          fontWeight="600"
        >
          {payload[nameKey]}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: `drop-shadow(0 4px 16px ${fill}40)`
          }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 12}
          fill={fill}
          opacity={0.3}
        />
        <path 
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
          stroke={fill} 
          fill="none"
          strokeWidth={2}
        />
        <circle 
          cx={ex} 
          cy={ey} 
          r={2} 
          fill={fill} 
          stroke="none"
        />
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
          y={ey} 
          textAnchor={textAnchor} 
          fill="hsl(var(--chart-text))"
          fontSize="12"
          fontWeight="500"
        >
          {formatTooltip(value)}
        </text>
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
          y={ey} 
          dy={18} 
          textAnchor={textAnchor} 
          fill="hsl(var(--chart-text-muted))"
          fontSize="10"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  return (
    <div className="chart-container chart-animate-in">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <BrandedPrimitives colors={chartColors} id={chartId} />
          
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderLabel : false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={paddingAngle}
            startAngle={startAngle}
            endAngle={endAngle}
            dataKey={dataKey}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            isAnimationActive={animated}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                style={{
                  filter: activeIndex === index 
                    ? `drop-shadow(0 6px 20px ${entry.color}50)` 
                    : `drop-shadow(0 2px 8px ${entry.color}20)`,
                  transform: activeIndex === index ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.2s ease-out'
                }}
              />
            ))}
          </Pie>
          
          <Tooltip 
            content={<BrandedTooltip valueFormatter={formatTooltip} />}
          />
          
          {showLegend && (
            <Legend 
              content={<BrandedLegend />}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sector component for active shape (imported from recharts)
const Sector = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, ...props }: any) => {
  const RADIAN = Math.PI / 180;
  const startAngleRad = startAngle * RADIAN;
  const endAngleRad = endAngle * RADIAN;
  
  const largeArcFlag = endAngleRad - startAngleRad <= Math.PI ? "0" : "1";
  
  const x1 = cx + innerRadius * Math.cos(startAngleRad);
  const y1 = cy + innerRadius * Math.sin(startAngleRad);
  const x2 = cx + outerRadius * Math.cos(startAngleRad);
  const y2 = cy + outerRadius * Math.sin(startAngleRad);
  
  const x3 = cx + outerRadius * Math.cos(endAngleRad);
  const y3 = cy + outerRadius * Math.sin(endAngleRad);
  const x4 = cx + innerRadius * Math.cos(endAngleRad);
  const y4 = cy + innerRadius * Math.sin(endAngleRad);
  
  const d = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`;
  
  return <path d={d} fill={fill} {...props} />;
};

export default BrandedPie;