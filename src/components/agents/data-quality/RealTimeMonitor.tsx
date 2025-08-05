import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, AlertTriangle, CheckCircle, Clock, Play, Pause, Zap } from 'lucide-react';
import { DataQualityScore, DataQualityIssue } from './types';
import { useToast } from '@/hooks/use-toast';

interface RealTimeMonitorProps {
  onQualityUpdate?: (score: DataQualityScore, issues: DataQualityIssue[]) => void;
  isAnalyzing?: boolean;
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
}

interface RealTimeAlert {
  id: string;
  type: 'quality_drop' | 'new_issue' | 'performance';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export const RealTimeMonitor = ({ onQualityUpdate, isAnalyzing }: RealTimeMonitorProps) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    uptime: 100
  });
  const [currentScore, setCurrentScore] = useState<DataQualityScore | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const { toast } = useToast();

  // Mock alert generation removed - real-time monitoring now data-driven

  const updatePerformanceMetrics = useCallback(() => {
    // Performance metrics should be derived from actual data analysis
    // Implementation would connect to real monitoring systems
  }, []);

  const updateQualityScore = useCallback(() => {
    // Quality score calculation should be based on actual data analysis
    // This would connect to real data quality assessment services
    
    if (onQualityUpdate) {
      // For now, disable mock updates - real implementation needed
      // onQualityUpdate(realScore, realIssues);
    }
    setLastRefresh(new Date());
  }, [onQualityUpdate]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      updateQualityScore();
      updatePerformanceMetrics();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, refreshInterval, updateQualityScore, updatePerformanceMetrics]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      // Start monitoring - do initial update
      updateQualityScore();
      updatePerformanceMetrics();
    }
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'quality_drop': return <AlertTriangle className="h-4 w-4" />;
      case 'new_issue': return <Zap className="h-4 w-4" />;
      case 'performance': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Monitoring
              </CardTitle>
              <CardDescription>
                Monitor data quality metrics in real-time
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="alerts"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
                <Label htmlFor="alerts">Alerts</Label>
              </div>
              
              <Button
                onClick={toggleMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                disabled={isAnalyzing}
              >
                {isMonitoring ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isMonitoring ? 'Stop' : 'Start'} Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Refresh Interval</Label>
              <Select 
                value={refreshInterval.toString()} 
                onValueChange={(value) => setRefreshInterval(Number(value))}
                disabled={isMonitoring}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={isMonitoring ? "default" : "secondary"}>
                  {isMonitoring ? 'Active' : 'Inactive'}
                </Badge>
                {isMonitoring && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Last Update</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Response Time</div>
              <div className="text-2xl font-bold">{performanceMetrics.responseTime}ms</div>
              <Progress value={Math.min(performanceMetrics.responseTime / 5, 100)} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Throughput</div>
              <div className="text-2xl font-bold">{performanceMetrics.throughput}/sec</div>
              <Progress value={performanceMetrics.throughput / 2} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Error Rate</div>
              <div className="text-2xl font-bold">{performanceMetrics.errorRate}%</div>
              <Progress value={performanceMetrics.errorRate * 20} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Uptime</div>
              <div className="text-2xl font-bold">{performanceMetrics.uptime}%</div>
              <Progress value={performanceMetrics.uptime} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Quality Score */}
      {currentScore && (
        <Card>
          <CardHeader>
            <CardTitle>Live Quality Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{currentScore.overall.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Overall</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{currentScore.completeness.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Completeness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{currentScore.consistency.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Consistency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{currentScore.accuracy.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{currentScore.uniqueness.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Uniqueness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{currentScore.timeliness.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Timeliness</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Real-time Alerts
                {unreadAlerts > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadAlerts}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Live notifications for quality issues and performance changes
              </CardDescription>
            </div>
            
            {alerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllAlerts}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alerts</p>
              <p className="text-sm">System is running smoothly</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    alert.isRead ? 'bg-muted/30' : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => markAlertAsRead(alert.id)}
                >
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className={`text-sm ${alert.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {alert.message}
                    </p>
                  </div>
                  
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};