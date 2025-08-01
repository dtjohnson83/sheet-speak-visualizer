import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartVisualization } from '@/components/ChartVisualization';
import { KPICard } from '@/components/chart/KPICard';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AITextResponseProps {
  content: string;
}

interface AIKPIResponseProps {
  value: number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  previousValue?: number;
  format?: string;
  context?: string;
}

interface AIChartResponseProps {
  data: DataRow[];
  columns: ColumnInfo[];
  chartType: string;
  xColumn: string;
  yColumn: string;
  title?: string;
  description?: string;
}

interface AIMixedResponseProps {
  textContent?: string;
  kpiData?: AIKPIResponseProps;
  chartData?: AIChartResponseProps;
}

export const AITextResponse: React.FC<AITextResponseProps> = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-foreground leading-relaxed">{content}</p>
    </div>
  );
};

export const AIKPIResponse: React.FC<AIKPIResponseProps> = ({ 
  value, 
  label, 
  trend = 'neutral', 
  previousValue, 
  format = 'number',
  context 
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'decimal':
        return val.toFixed(2);
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {getTrendIcon()}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{formatValue(value)}</p>
          {previousValue !== undefined && (
            <p className={`text-xs ${getTrendColor()}`}>
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
              {Math.abs(((value - previousValue) / previousValue) * 100).toFixed(1)}% from previous
            </p>
          )}
          {context && (
            <p className="text-xs text-muted-foreground">{context}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const AIChartResponse: React.FC<AIChartResponseProps> = ({ 
  data, 
  columns, 
  chartType, 
  xColumn, 
  yColumn, 
  title, 
  description 
}) => {
  return (
    <Card className="w-full">
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <div className="h-80">
          <ChartVisualization
            data={data}
            columns={columns}
            dataSourceName="AI Generated Chart"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const AIMixedResponse: React.FC<AIMixedResponseProps> = ({ 
  textContent, 
  kpiData, 
  chartData 
}) => {
  return (
    <div className="space-y-4">
      {textContent && <AITextResponse content={textContent} />}
      
      <div className="flex flex-col lg:flex-row gap-4">
        {kpiData && (
          <div className="flex-shrink-0">
            <AIKPIResponse {...kpiData} />
          </div>
        )}
        
        {chartData && (
          <div className="flex-1">
            <AIChartResponse {...chartData} />
          </div>
        )}
      </div>
    </div>
  );
};