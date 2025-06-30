
import React from 'react';
import { KPICard } from './KPICard';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from './AggregationConfiguration';
import { applyAggregation } from '@/lib/chart/aggregationUtils';

interface KPIRendererProps {
  data: DataRow[];
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  valueColumn?: string;
  series: SeriesConfig[];
  chartColors: string[];
  title?: string;
  aggregationMethod?: AggregationMethod;
}

export const KPIRenderer = ({ 
  data, 
  columns, 
  xColumn, 
  yColumn, 
  valueColumn, 
  series, 
  chartColors,
  title,
  aggregationMethod = 'sum'
}: KPIRendererProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available for KPI cards</p>
      </div>
    );
  }

  // Process KPI data with aggregation
  const processKPIData = () => {
    const targetColumn = valueColumn || yColumn;
    
    if (!targetColumn) {
      return [];
    }

    // Group data by xColumn if it exists, otherwise create a single KPI
    if (xColumn && xColumn !== '') {
      const grouped = data.reduce((acc, row) => {
        const key = String(row[xColumn] || 'Unknown');
        if (!acc[key]) {
          acc[key] = [];
        }
        const value = Number(row[targetColumn]) || 0;
        if (!isNaN(value)) {
          acc[key].push(value);
        }
        return acc;
      }, {} as Record<string, number[]>);

      return Object.entries(grouped).map(([key, values]) => ({
        title: key,
        value: applyAggregation(values, aggregationMethod),
        count: values.length
      }));
    } else {
      // Single KPI for all data
      const values = data
        .map(row => Number(row[targetColumn]) || 0)
        .filter(val => !isNaN(val));
      
      return [{
        title: targetColumn,
        value: applyAggregation(values, aggregationMethod),
        count: values.length
      }];
    }
  };

  const kpiData = processKPIData();
  
  if (kpiData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No valid numeric data found for KPI cards</p>
      </div>
    );
  }

  // Limit to first 4 KPIs for display
  const displayKPIs = kpiData.slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {displayKPIs.map((kpi, index) => (
        <KPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          color={chartColors[index % chartColors.length]}
          unit={aggregationMethod === 'count' ? ' items' : ''}
        />
      ))}
    </div>
  );
};
