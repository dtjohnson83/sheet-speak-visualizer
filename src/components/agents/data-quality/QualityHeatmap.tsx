import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { DataQualityIssue } from './types';
import { ColumnInfo } from '@/pages/Index';

interface QualityHeatmapProps {
  columns: ColumnInfo[];
  issues: DataQualityIssue[];
}

interface HeatmapCell {
  column: string;
  type: string;
  severity: 'high' | 'medium' | 'low' | 'none';
  count: number;
  percentage: number;
  description?: string;
}

const QUALITY_TYPES = [
  { key: 'completeness', label: 'Completeness' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'uniqueness', label: 'Uniqueness' },
  { key: 'timeliness', label: 'Timeliness' }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-orange-500';
    case 'low': return 'bg-yellow-500';
    default: return 'bg-green-500';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high': return <XCircle className="h-3 w-3 text-white" />;
    case 'medium': return <AlertTriangle className="h-3 w-3 text-white" />;
    case 'low': return <AlertTriangle className="h-3 w-3 text-white" />;
    default: return <CheckCircle className="h-3 w-3 text-white" />;
  }
};

export const QualityHeatmap = ({ columns, issues }: QualityHeatmapProps) => {
  // Create heatmap data structure
  const createHeatmapData = (): HeatmapCell[][] => {
    const data: HeatmapCell[][] = [];
    
    columns.forEach(column => {
      const columnData: HeatmapCell[] = [];
      
      QUALITY_TYPES.forEach(type => {
        const columnIssues = issues.filter(
          issue => issue.column === column.name && issue.type === type.key
        );
        
        if (columnIssues.length > 0) {
          const highestSeverityIssue = columnIssues.reduce((prev, current) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            return severityOrder[current.severity] > severityOrder[prev.severity] ? current : prev;
          });
          
          columnData.push({
            column: column.name,
            type: type.key,
            severity: highestSeverityIssue.severity,
            count: columnIssues.length,
            percentage: highestSeverityIssue.percentage,
            description: highestSeverityIssue.description
          });
        } else {
          columnData.push({
            column: column.name,
            type: type.key,
            severity: 'none',
            count: 0,
            percentage: 0
          });
        }
      });
      
      data.push(columnData);
    });
    
    return data;
  };

  const heatmapData = createHeatmapData();

  const getColumnSummary = (columnName: string) => {
    const columnIssues = issues.filter(issue => issue.column === columnName);
    const highSeverityCount = columnIssues.filter(issue => issue.severity === 'high').length;
    const mediumSeverityCount = columnIssues.filter(issue => issue.severity === 'medium').length;
    const lowSeverityCount = columnIssues.filter(issue => issue.severity === 'low').length;
    
    return { high: highSeverityCount, medium: mediumSeverityCount, low: lowSeverityCount };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Quality Issues Heatmap
        </CardTitle>
        <CardDescription>
          Visual overview of data quality issues across columns and quality dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Severity:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>No Issues</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-6 gap-1 mb-2">
                <div className="p-2 text-sm font-medium">Column</div>
                {QUALITY_TYPES.map(type => (
                  <div key={type.key} className="p-2 text-xs font-medium text-center">
                    {type.label}
                  </div>
                ))}
              </div>

              {/* Heatmap Rows */}
              <TooltipProvider>
                {heatmapData.map((columnData, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-6 gap-1 mb-1">
                    {/* Column Name */}
                    <div className="p-2 text-sm font-medium bg-muted rounded flex items-center justify-between">
                      <span className="truncate">{columnData[0].column}</span>
                      <div className="flex gap-1">
                        {(() => {
                          const summary = getColumnSummary(columnData[0].column);
                          return (
                            <>
                              {summary.high > 0 && (
                                <Badge variant="destructive" className="text-xs px-1">
                                  {summary.high}
                                </Badge>
                              )}
                              {summary.medium > 0 && (
                                <Badge variant="default" className="text-xs px-1">
                                  {summary.medium}
                                </Badge>
                              )}
                              {summary.low > 0 && (
                                <Badge variant="secondary" className="text-xs px-1">
                                  {summary.low}
                                </Badge>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Quality Type Cells */}
                    {columnData.map((cell, cellIndex) => (
                      <Tooltip key={cellIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              h-8 rounded flex items-center justify-center cursor-pointer
                              ${getSeverityColor(cell.severity)}
                              hover:opacity-80 transition-opacity
                            `}
                          >
                            {getSeverityIcon(cell.severity)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {cell.column} - {QUALITY_TYPES[cellIndex].label}
                            </div>
                            {cell.severity !== 'none' ? (
                              <>
                                <div className="text-sm">
                                  Severity: <span className="capitalize">{cell.severity}</span>
                                </div>
                                <div className="text-sm">
                                  Impact: {cell.percentage.toFixed(1)}%
                                </div>
                                {cell.description && (
                                  <div className="text-xs text-muted-foreground max-w-xs">
                                    {cell.description}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-green-600">No issues detected</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {issues.filter(i => i.severity === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {issues.filter(i => i.severity === 'medium').length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {issues.filter(i => i.severity === 'low').length}
              </div>
              <div className="text-sm text-muted-foreground">Low Severity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {columns.length - new Set(issues.map(i => i.column)).size}
              </div>
              <div className="text-sm text-muted-foreground">Clean Columns</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};