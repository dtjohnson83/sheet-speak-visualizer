import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AnomalyDetail, BusinessImpactAssessment } from '@/types/agents';

interface AnomalyDetailViewerProps {
  anomalies: AnomalyDetail[];
  column: string;
  businessImpact?: BusinessImpactAssessment;
  totalRows: number;
}

export const AnomalyDetailViewer = ({ 
  anomalies, 
  column, 
  businessImpact,
  totalRows 
}: AnomalyDetailViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-info" />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const getBusinessImpactIcon = (impact?: string) => {
    switch (impact) {
      case 'revenue': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'operations': return <Activity className="h-4 w-4 text-info" />;
      case 'quality': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'risk': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const highSeverityCount = anomalies.filter(a => a.severity === 'high').length;
  const mediumSeverityCount = anomalies.filter(a => a.severity === 'medium').length;
  const lowSeverityCount = anomalies.filter(a => a.severity === 'low').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-lg">Anomalies in {column}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {anomalies.length} of {totalRows} rows
            </Badge>
          </div>
        </div>
        <CardDescription>
          Detailed analysis of {anomalies.length} anomalous data points
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Business Impact Summary */}
        {businessImpact && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              {getBusinessImpactIcon(businessImpact.type)}
              <h4 className="font-semibold">Business Impact Assessment</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Impact Level:</span>
                <Badge variant={businessImpact.category === 'high' ? 'destructive' : 
                              businessImpact.category === 'medium' ? 'secondary' : 'outline'} 
                       className="ml-2">
                  {businessImpact.category}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="ml-2">
                  {businessImpact.type}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Urgency:</span>
                <span className="ml-2 font-medium">{businessImpact.urgency.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-2 font-medium">{(businessImpact.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Severity Summary */}
        <div className="flex items-center gap-4 text-sm">
          {highSeverityCount > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>{highSeverityCount} High</span>
            </div>
          )}
          {mediumSeverityCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span>{mediumSeverityCount} Medium</span>
            </div>
          )}
          {lowSeverityCount > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-info" />
              <span>{lowSeverityCount} Low</span>
            </div>
          )}
        </div>

        {/* Anomaly Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>View Detailed Anomaly Breakdown</span>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Expected Range</TableHead>
                    <TableHead>Deviation</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies.slice(0, 10).map((anomaly, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">
                        {anomaly.row_index + 1}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {typeof anomaly.value === 'number' ? anomaly.value.toFixed(2) : anomaly.value}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {anomaly.expected_range.min.toFixed(2)} - {anomaly.expected_range.max.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {anomaly.deviation > 0 ? 
                            <TrendingUp className="h-3 w-3 text-destructive" /> : 
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          }
                          <span className="font-mono text-sm">
                            {Math.abs(anomaly.deviation).toFixed(1)}σ
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(anomaly.severity)}
                          <Badge variant={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-32 truncate">
                        {anomaly.recommended_action || 'Review data point'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {anomalies.length > 10 && (
                <div className="p-3 border-t bg-muted/30 text-sm text-muted-foreground text-center">
                  Showing 10 of {anomalies.length} anomalies
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Investigation Steps */}
        {anomalies[0]?.investigation_steps && anomalies[0].investigation_steps.length > 0 && (
          <div className="p-4 border rounded-lg bg-info/10">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recommended Investigation Steps
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {anomalies[0].investigation_steps.map((step, index) => (
                <li key={index} className="text-muted-foreground">{step}</li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};