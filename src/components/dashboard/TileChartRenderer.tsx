import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, ScatterChart, Scatter, ZAxis, Heatmap, Histogram, Sankey, Treemap } from 'recharts';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { formatTooltipValue } from '@/lib/numberUtils';
import { SeriesConfig } from '@/hooks/useChartState';
import { KPIRenderer } from '../chart/KPIRenderer';

interface TileChartRendererProps {
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  sankeyTargetColumn?: string;
  valueColumn?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  series: SeriesConfig[];
  showDataLabels?: boolean;
  data: DataRow[];
  columns: ColumnInfo[];
  chartColors: string[];
}

export const TileChartRenderer = ({ 
  chartType, 
  xColumn, 
  yColumn, 
  stackColumn, 
  sankeyTargetColumn, 
  valueColumn, 
  sortColumn, 
  sortDirection, 
  series, 
  showDataLabels, 
  data, 
  columns, 
  chartColors 
}: TileChartRendererProps) => {
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} fill={chartColors[index % chartColors.length]} stackId={stackColumn} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={chartColors[index % chartColors.length]} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} stackId={stackColumn} stroke={chartColors[index % chartColors.length]} fill={chartColors[index % chartColors.length]} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey={yColumn}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))
            }
          </Pie>
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis />
          <ZAxis dataKey={valueColumn} range={[64, 144]} />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Scatter key={s.dataKey} data={data} dataKey={s.dataKey} fill={chartColors[index % chartColors.length]} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'heatmap') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Heatmap
          data={data}
          xKey={xColumn}
          yKey={yColumn}
          zKey={valueColumn}
          colors={chartColors}
          margin={{ top: 20, right: 0, bottom: 0, left: 0 }}
        >
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
        </Heatmap>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'histogram') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Histogram data={data} dataKey={yColumn} fill={chartColors[0]} />
      </ResponsiveContainer>
    );
  }

  if (chartType === 'sankey') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Sankey data={data} dataKey={yColumn} linkName={xColumn} targetKey={sankeyTargetColumn} fill={chartColors[0]} />
      </ResponsiveContainer>
    );
  }

  if (chartType === 'treemap') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Treemap data={data} dataKey={yColumn} nameKey={xColumn} fill={chartColors[0]} />
      </ResponsiveContainer>
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
    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
      No chart type selected.
    </div>
  );
};

const Cell = (props: any) => {
  return <cell fill={props.fill} />;
};
