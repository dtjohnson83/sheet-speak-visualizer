
import React from 'react';
import { KPICard } from './KPICard';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { processChartData } from '@/lib/chartDataProcessor';

interface KPIRendererProps {
  data: DataRow[];
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  valueColumn?: string;
  series: SeriesConfig[];
  chartColors: string[];
  title?: string;
}

export const KPIRenderer = ({ 
  data, 
  columns, 
  xColumn, 
  yColumn, 
  valueColumn, 
  series, 
  chartColors,
  title 
}: KPIRendererProps) => {
  const processedData = processChartData(data, columns, {
    xColumn,
    yColumn,
    chartType: 'kpi',
    series,
    valueColumn
  });

  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available for KPI cards</p>
      </div>
    );
  }

  // For KPI cards, we'll show the first few data points as separate cards
  const kpiCards = processedData.slice(0, 4).map((item, index) => {
    const value = Number(item[yColumn] || item[valueColumn || yColumn] || 0);
    const label = String(item[xColumn] || `KPI ${index + 1}`);
    
    // Try to find target and previous values if they exist in the data
    const target = item.target ? Number(item.target) : undefined;
    const previous = item.previous ? Number(item.previous) : undefined;
    
    return {
      title: label,
      value,
      target,
      previous,
      color: chartColors[index % chartColors.length]
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {kpiCards.map((kpi, index) => (
        <KPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          target={kpi.target}
          previous={kpi.previous}
          color={kpi.color}
        />
      ))}
    </div>
  );
};
