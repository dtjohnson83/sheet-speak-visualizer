
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { ChartRenderersProps } from '@/types';
import { KPIRenderer } from './KPIRenderer';
import { AggregationMethod } from './AggregationConfiguration';
import { formatTooltipValue } from '@/lib/numberUtils';

interface ExtendedChartRenderersProps extends ChartRenderersProps {
  aggregationMethod?: AggregationMethod;
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
  aggregationMethod = 'sum'
}: ExtendedChartRenderersProps) => {
  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Bar 
              key={s.column} 
              dataKey={s.column} 
              fill={chartColors[index % chartColors.length]} 
              stackId={stackColumn ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Line 
              key={s.column} 
              type="monotone" 
              dataKey={s.column} 
              stroke={chartColors[index % chartColors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} />
          <YAxis />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Area 
              key={s.column} 
              type="monotone" 
              dataKey={s.column} 
              stackId={stackColumn ? 'stack' : undefined}
              stroke={chartColors[index % chartColors.length]} 
              fill={chartColors[index % chartColors.length]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            dataKey={yColumn}
            nameKey={xColumn}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label={showDataLabels}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xColumn} type="number" />
          <YAxis dataKey={yColumn} type="number" />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          {series.map((s, index) => (
            <Scatter 
              key={s.column} 
              dataKey={s.column} 
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Placeholder components for advanced chart types that need more complex implementation
  if (chartType === 'heatmap') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Heatmap Chart Renderer - Coming Soon</p>
      </div>
    );
  }

  if (chartType === 'histogram') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Bar dataKey="frequency" fill={chartColors[0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'sankey') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Sankey Chart Renderer - Coming Soon</p>
      </div>
    );
  }

  if (chartType === 'treemap') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Treemap Chart Renderer - Coming Soon</p>
      </div>
    );
  }

  if (chartType === 'topX') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey={xColumn} type="category" />
          <Tooltip formatter={(value: any) => formatTooltipValue(value)} />
          <Legend />
          <Bar dataKey={yColumn} fill={chartColors[0]} />
        </BarChart>
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
        aggregationMethod={aggregationMethod}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Select a chart type to visualize your data.</p>
    </div>
  );
};
