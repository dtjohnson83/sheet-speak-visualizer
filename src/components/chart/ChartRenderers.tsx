
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, Treemap, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ComposedChart, LabelList } from 'recharts';
import { DataRow } from '@/types/data';
import { SeriesConfig } from '@/hooks/useChartState';
import { SankeyData } from '@/lib/chartDataUtils';
import { formatNumber, formatTooltipValue } from '@/lib/numberUtils';

interface ChartProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string;
  series: SeriesConfig[];
  chartColors: string[];
  showDataLabels?: boolean;
}

interface SankeyProps {
  data: SankeyData;
  chartColors: string[];
}

interface StackedBarProps extends ChartProps {
  stackColumn: string;
  originalData: DataRow[];
}

interface HeatmapProps {
  data: Array<{ x: string; y: string; value: number }>;
  chartColors: string[];
}

const customTooltipFormatter = (value: any, name: string) => [
  formatTooltipValue(value),
  name
];

const customPieLabel = ({ name, value, percent }: any) => 
  `${name}: ${formatNumber(value)} (${(percent * 100).toFixed(0)}%)`;

const customTickFormatter = (value: any) => formatNumber(Number(value));

const customDataLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  return (
    <text 
      x={x + width / 2} 
      y={y - 5} 
      fill="#666" 
      textAnchor="middle" 
      fontSize="11"
      fontWeight="500"
    >
      {formatNumber(Number(value))}
    </text>
  );
};

export const BarChartRenderer = ({ data, xColumn, yColumn, series, chartColors, showDataLabels = false }: ChartProps) => {
  // Check if we have mixed chart types (bar + line)
  const hasMixedTypes = series.some(s => s.type === 'line');
  const primaryColor = chartColors[0] || '#8884d8';
  
  if (hasMixedTypes) {
    // Use ComposedChart for mixed types
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          width={800}
          height={400}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xColumn} 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis yAxisId="left" tickFormatter={customTickFormatter} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={customTickFormatter} />
          <Tooltip formatter={customTooltipFormatter} />
          <Legend />
          <Bar yAxisId="left" dataKey={yColumn} fill={primaryColor} name={yColumn}>
            {showDataLabels && <LabelList dataKey={yColumn} content={customDataLabel} />}
          </Bar>
          {series.map((seriesConfig) => {
            if (seriesConfig.type === 'line') {
              return (
                <Line 
                  key={seriesConfig.id}
                  yAxisId="right"
                  type="monotone" 
                  dataKey={seriesConfig.column} 
                  stroke={seriesConfig.color} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={seriesConfig.column}
                />
              );
            }
            return (
              <Bar 
                key={seriesConfig.id}
                yAxisId="left"
                dataKey={seriesConfig.column} 
                fill={seriesConfig.color}
                name={seriesConfig.column}
              >
                {showDataLabels && <LabelList dataKey={seriesConfig.column} content={customDataLabel} />}
              </Bar>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Use regular BarChart for bar-only charts
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        width={800}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xColumn} 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis yAxisId="left" tickFormatter={customTickFormatter} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={customTickFormatter} />
        <Tooltip formatter={customTooltipFormatter} />
        <Legend />
        <Bar yAxisId="left" dataKey={yColumn} fill={primaryColor} name={yColumn}>
          {showDataLabels && <LabelList dataKey={yColumn} content={customDataLabel} />}
        </Bar>
        {series.map((seriesConfig) => (
          <Bar 
            key={seriesConfig.id}
            yAxisId={series.length > 0 ? "right" : "left"}
            dataKey={seriesConfig.column} 
            fill={seriesConfig.color}
            name={seriesConfig.column}
          >
            {showDataLabels && <LabelList dataKey={seriesConfig.column} content={customDataLabel} />}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const LineChartRenderer = ({ data, xColumn, yColumn, series, chartColors, showDataLabels = false }: ChartProps) => {
  // Check if we have mixed chart types (line + bar)
  const hasMixedTypes = series.some(s => s.type === 'bar');
  const primaryColor = chartColors[0] || '#8884d8';
  
  if (hasMixedTypes) {
    // Use ComposedChart for mixed types
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          width={800}
          height={400}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xColumn}
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis yAxisId="left" tickFormatter={customTickFormatter} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={customTickFormatter} />
          <Tooltip formatter={customTooltipFormatter} />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey={yColumn} 
            stroke={primaryColor} 
            strokeWidth={2}
            dot={{ r: 4 }}
            name={yColumn}
          >
            {showDataLabels && <LabelList dataKey={yColumn} position="top" formatter={formatNumber} />}
          </Line>
          {series.map((seriesConfig) => {
            if (seriesConfig.type === 'bar') {
              return (
                <Bar 
                  key={seriesConfig.id}
                  yAxisId="right"
                  dataKey={seriesConfig.column} 
                  fill={seriesConfig.color}
                  name={seriesConfig.column}
                >
                  {showDataLabels && <LabelList dataKey={seriesConfig.column} content={customDataLabel} />}
                </Bar>
              );
            }
            return (
              <Line 
                key={seriesConfig.id}
                yAxisId="right"
                type="monotone" 
                dataKey={seriesConfig.column} 
                stroke={seriesConfig.color} 
                strokeWidth={2}
                dot={{ r: 4 }}
                name={seriesConfig.column}
              >
                {showDataLabels && <LabelList dataKey={seriesConfig.column} position="top" formatter={formatNumber} />}
              </Line>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Use regular LineChart for line-only charts
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        width={800}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xColumn}
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis yAxisId="left" tickFormatter={customTickFormatter} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={customTickFormatter} />
        <Tooltip formatter={customTooltipFormatter} />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey={yColumn} 
          stroke={primaryColor} 
          strokeWidth={2}
          dot={{ r: 4 }}
          name={yColumn}
        >
          {showDataLabels && <LabelList dataKey={yColumn} position="top" formatter={formatNumber} />}
        </Line>
        {series.map((seriesConfig) => (
          <Line 
            key={seriesConfig.id}
            yAxisId={series.length > 0 ? "right" : "left"}
            type="monotone" 
            dataKey={seriesConfig.column} 
            stroke={seriesConfig.color} 
            strokeWidth={2}
            dot={{ r: 4 }}
            name={seriesConfig.column}
          >
            {showDataLabels && <LabelList dataKey={seriesConfig.column} position="top" formatter={formatNumber} />}
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export const PieChartRenderer = ({ data, chartColors }: { data: DataRow[]; chartColors: string[] }) => (
  <ResponsiveContainer width="100%" height={400}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={customPieLabel}
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
        ))}
      </Pie>
      <Tooltip formatter={customTooltipFormatter} />
    </PieChart>
  </ResponsiveContainer>
);

export const ScatterChartRenderer = ({ data, xColumn, yColumn, series, chartColors }: ChartProps) => {
  const primaryColor = chartColors[0] || '#8884d8';
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        width={800}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xColumn} 
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 12 }}
          tickFormatter={customTickFormatter}
        />
        <YAxis 
          dataKey={yColumn} 
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 12 }}
          tickFormatter={customTickFormatter}
        />
        <Tooltip formatter={customTooltipFormatter} />
        <Legend />
        <Scatter 
          dataKey={yColumn} 
          fill={primaryColor}
          name={`${yColumn} vs ${xColumn}`}
        />
        {series.map((seriesConfig) => (
          <Scatter 
            key={seriesConfig.id}
            dataKey={seriesConfig.column} 
            fill={seriesConfig.color}
            name={`${seriesConfig.column} vs ${xColumn}`}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export const TreemapRenderer = ({ data, chartColors }: { data: DataRow[]; chartColors: string[] }) => (
  <ResponsiveContainer width="100%" height={400}>
    <Treemap
      width={800}
      height={400}
      data={data}
      dataKey="size"
      aspectRatio={4/3}
      stroke="#fff"
      fill="#8884d8"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
      ))}
    </Treemap>
  </ResponsiveContainer>
);

export const StackedBarRenderer = ({ data, xColumn, originalData, stackColumn, chartColors, showDataLabels = false }: StackedBarProps) => {
  const stackValues = [...new Set(originalData.map(row => row[stackColumn]?.toString()).filter(Boolean))];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        width={800}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xColumn} 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tickFormatter={customTickFormatter} />
        <Tooltip formatter={customTooltipFormatter} />
        <Legend />
        {stackValues.map((stackVal, index) => (
          <Bar 
            key={stackVal}
            dataKey={stackVal} 
            stackId="stack"
            fill={chartColors[index % chartColors.length]}
          >
            {showDataLabels && <LabelList dataKey={stackVal} position="center" formatter={formatNumber} fontSize="10" fill="#fff" />}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const HeatmapRenderer = ({ data, chartColors }: HeatmapProps) => {
  const xValues = [...new Set(data.map(d => d.x))];
  const yValues = [...new Set(data.map(d => d.y))];
  
  const cellWidth = Math.max(40, 600 / xValues.length);
  const cellHeight = Math.max(30, 400 / yValues.length);

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const getColor = (value: number) => {
    const intensity = (value - minValue) / (maxValue - minValue);
    const baseColor = chartColors[0] || '#8884d8';
    // Convert hex to rgba with varying opacity
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const opacity = 0.2 + (intensity * 0.8);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="overflow-auto">
      <svg width={xValues.length * cellWidth + 100} height={yValues.length * cellHeight + 100}>
        {yValues.map((yVal, yIndex) => (
          <text
            key={String(yVal)}
            x={80}
            y={yIndex * cellHeight + cellHeight / 2 + 20}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="12"
            fill="#666"
          >
            {String(yVal)}
          </text>
        ))}
        
        {xValues.map((xVal, xIndex) => (
          <text
            key={String(xVal)}
            x={xIndex * cellWidth + cellWidth / 2 + 90}
            y={yValues.length * cellHeight + 40}
            textAnchor="middle"
            dominantBaseline="hanging"
            fontSize="12"
            fill="#666"
            transform={`rotate(-45, ${xIndex * cellWidth + cellWidth / 2 + 90}, ${yValues.length * cellHeight + 40})`}
          >
            {String(xVal)}
          </text>
        ))}
        
        {data.map((point, index) => {
          const xIndex = xValues.indexOf(point.x);
          const yIndex = yValues.indexOf(point.y);
          
          return (
            <g key={index}>
              <rect
                x={xIndex * cellWidth + 90}
                y={yIndex * cellHeight + 20}
                width={cellWidth - 2}
                height={cellHeight - 2}
                fill={getColor(point.value)}
                stroke="#fff"
                strokeWidth={1}
              />
              <text
                x={xIndex * cellWidth + cellWidth / 2 + 90}
                y={yIndex * cellHeight + cellHeight / 2 + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#333"
              >
                {formatNumber(point.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const SankeyRenderer = ({ data, chartColors }: SankeyProps) => {
  const width = 800;
  const height = 400;
  const nodeWidth = 20;
  const nodePadding = 10;

  const sourceNodes = [...new Set(data.links.map(l => l.source))];
  const targetNodes = [...new Set(data.links.map(l => l.target))];
  
  const sourceX = 50;
  const targetX = width - 100;
  const nodeHeight = (height - (sourceNodes.length + 1) * nodePadding) / sourceNodes.length;

  const sourceColor = chartColors[0] || '#8884d8';
  const targetColor = chartColors[1] || '#82ca9d';
  const linkColor = chartColors[2] || '#ffc658';

  return (
    <div className="overflow-auto">
      <svg width={width} height={height}>
        {sourceNodes.map((node, index) => {
          const y = index * (nodeHeight + nodePadding) + nodePadding;
          return (
            <g key={`source-${node}`}>
              <rect
                x={sourceX}
                y={y}
                width={nodeWidth}
                height={nodeHeight}
                fill={sourceColor}
                stroke="#fff"
              />
              <text
                x={sourceX - 10}
                y={y + nodeHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill="#666"
              >
                {node}
              </text>
            </g>
          );
        })}

        {targetNodes.map((node, index) => {
          const y = index * (nodeHeight + nodePadding) + nodePadding;
          return (
            <g key={`target-${node}`}>
              <rect
                x={targetX}
                y={y}
                width={nodeWidth}
                height={nodeHeight}
                fill={targetColor}
                stroke="#fff"
              />
              <text
                x={targetX + nodeWidth + 10}
                y={y + nodeHeight / 2}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize="12"
                fill="#666"
              >
                {node}
              </text>
            </g>
          );
        })}

        {data.links.map((link, index) => {
          const sourceIndex = sourceNodes.indexOf(link.source);
          const targetIndex = targetNodes.indexOf(link.target);
          
          const sourceY = sourceIndex * (nodeHeight + nodePadding) + nodePadding + nodeHeight / 2;
          const targetY = targetIndex * (nodeHeight + nodePadding) + nodePadding + nodeHeight / 2;
          
          const linkWidth = Math.max(2, (link.value / Math.max(...data.links.map(l => l.value))) * 20);
          
          return (
            <path
              key={index}
              d={`M ${sourceX + nodeWidth} ${sourceY} C ${(sourceX + targetX) / 2} ${sourceY} ${(sourceX + targetX) / 2} ${targetY} ${targetX} ${targetY}`}
              stroke={linkColor}
              strokeWidth={linkWidth}
              fill="none"
              opacity={0.6}
            />
          );
        })}
      </svg>
    </div>
  );
};
