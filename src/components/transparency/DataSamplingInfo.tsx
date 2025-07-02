import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DataSamplingInfoProps {
  totalRows: number;
  sampleSize: number;
  columns: ColumnInfo[];
  analysisType?: 'chat' | 'report';
  showDetailedView?: boolean;
}

interface ConfidenceLevel {
  level: 'high' | 'medium' | 'low';
  color: string;
  icon: React.ReactNode;
  description: string;
}

export const DataSamplingInfo = ({ 
  totalRows, 
  sampleSize, 
  columns, 
  analysisType = 'chat',
  showDetailedView = false 
}: DataSamplingInfoProps) => {
  const samplePercentage = (sampleSize / totalRows) * 100;
  
  // Calculate confidence based on sample size and data characteristics
  const getConfidenceLevel = (): ConfidenceLevel => {
    if (samplePercentage >= 10 || sampleSize >= 1000) {
      return {
        level: 'high',
        color: 'text-green-600',
        icon: <CheckCircle className="h-4 w-4" />,
        description: 'High confidence - sample is representative'
      };
    } else if (samplePercentage >= 1 || sampleSize >= 100) {
      return {
        level: 'medium',
        color: 'text-yellow-600',
        icon: <Info className="h-4 w-4" />,
        description: 'Medium confidence - insights are directional'
      };
    } else {
      return {
        level: 'low',
        color: 'text-red-600',
        icon: <AlertTriangle className="h-4 w-4" />,
        description: 'Low confidence - limited sample size'
      };
    }
  };

  const confidence = getConfidenceLevel();
  
  // Calculate data coverage metrics
  const numericColumns = columns.filter(col => col.type === 'numeric').length;
  const textColumns = columns.filter(col => col.type === 'text').length;
  const dateColumns = columns.filter(col => col.type === 'date').length;
  
  const coverageScore = Math.min(100, (sampleSize / Math.max(100, totalRows * 0.05)) * 100);

  if (!showDetailedView) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-1 ${confidence.color}`}>
          {confidence.icon}
          <span className="font-medium">
            {sampleSize.toLocaleString()} of {totalRows.toLocaleString()} rows
          </span>
        </div>
        <Badge variant={confidence.level === 'high' ? 'default' : confidence.level === 'medium' ? 'secondary' : 'destructive'}>
          {confidence.level.toUpperCase()} confidence
        </Badge>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-muted/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">AI Analysis Scope</h4>
          <Badge variant={confidence.level === 'high' ? 'default' : confidence.level === 'medium' ? 'secondary' : 'destructive'}>
            {confidence.level.toUpperCase()} confidence
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Sample Size</div>
            <div className="text-lg font-semibold">
              {sampleSize.toLocaleString()} rows
            </div>
            <div className="text-xs text-muted-foreground">
              {samplePercentage.toFixed(2)}% of total dataset
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Data Coverage</div>
            <div className="flex items-center gap-2">
              <Progress value={coverageScore} className="flex-1 h-2" />
              <span className="text-sm font-medium">{Math.round(coverageScore)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className={`flex items-center gap-2 ${confidence.color}`}>
            {confidence.icon}
            <span className="text-sm font-medium">{confidence.description}</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Analysis covers {columns.length} columns: {numericColumns} numeric, {textColumns} text, {dateColumns} date
          </div>
        </div>

        {confidence.level === 'low' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">Limited Sample Warning</div>
                <div className="text-yellow-700">
                  Insights may not represent the full dataset. Consider filtering data or asking for more specific analysis.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};