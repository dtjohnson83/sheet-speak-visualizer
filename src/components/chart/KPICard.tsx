
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Target, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/numberUtils';

interface KPICardProps {
  title: string;
  value: number;
  target?: number;
  previous?: number;
  unit?: string;
  color?: string;
  className?: string;
}

export const KPICard = ({ 
  title, 
  value, 
  target, 
  previous, 
  unit = '', 
  color = '#8884d8',
  className = '' 
}: KPICardProps) => {
  const percentChange = previous ? ((value - previous) / previous) * 100 : null;
  const targetProgress = target ? (value / target) * 100 : null;
  const isPositiveChange = percentChange !== null && percentChange > 0;
  const isNegativeChange = percentChange !== null && percentChange < 0;

  return (
    <Card className={`${className} h-full`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color }}>
          {formatNumber(value)}{unit}
        </div>
        
        <div className="flex flex-col gap-1 mt-2">
          {percentChange !== null && (
            <div className="flex items-center text-xs">
              {isPositiveChange && (
                <>
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{percentChange.toFixed(1)}%</span>
                </>
              )}
              {isNegativeChange && (
                <>
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{percentChange.toFixed(1)}%</span>
                </>
              )}
              {!isPositiveChange && !isNegativeChange && (
                <span className="text-muted-foreground">0%</span>
              )}
              <span className="text-muted-foreground ml-1">from previous</span>
            </div>
          )}
          
          {targetProgress !== null && (
            <div className="flex items-center text-xs">
              <Target className="h-3 w-3 text-blue-500 mr-1" />
              <span className={`${targetProgress >= 100 ? 'text-green-500' : 'text-orange-500'}`}>
                {targetProgress.toFixed(1)}% of target
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
