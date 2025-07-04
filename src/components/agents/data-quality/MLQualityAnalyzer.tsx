import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DataQualityIssue } from './types';
import { useToast } from '@/hooks/use-toast';

interface MLQualityAnalyzerProps {
  data: DataRow[];
  columns: ColumnInfo[];
  issues: DataQualityIssue[];
  onInsightGenerated?: (insights: MLInsight[]) => void;
}

interface MLInsight {
  id: string;
  type: 'anomaly' | 'pattern' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  column?: string;
  action?: string;
  impact: number; // 0-100
  timestamp: Date;
}

interface AnomalyDetectionResult {
  column: string;
  anomalies: Array<{
    index: number;
    value: any;
    score: number;
    reason: string;
  }>;
  threshold: number;
}

interface PatternAnalysis {
  pattern: string;
  frequency: number;
  columns: string[];
  confidence: number;
  description: string;
}

export const MLQualityAnalyzer = ({ data, columns, issues, onInsightGenerated }: MLQualityAnalyzerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [insights, setInsights] = useState<MLInsight[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetectionResult[]>([]);
  const [patterns, setPatterns] = useState<PatternAnalysis[]>([]);
  const [predictions, setPredictions] = useState<MLInsight[]>([]);
  const [isMLEnabled, setIsMLEnabled] = useState(true);

  const { toast } = useToast();

  // Statistical anomaly detection using Z-score and IQR methods
  const detectAnomalies = useCallback((columnData: any[], columnName: string, columnType: string): AnomalyDetectionResult => {
    const anomalies: Array<{ index: number; value: any; score: number; reason: string }> = [];
    
    if (columnType === 'numeric') {
      const numericData = columnData
        .map((value, index) => ({ value: Number(value), index }))
        .filter(item => !isNaN(item.value));
      
      if (numericData.length === 0) return { column: columnName, anomalies, threshold: 0 };
      
      const values = numericData.map(item => item.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Z-score method
      const zThreshold = 2.5;
      numericData.forEach(({ value, index }) => {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > zThreshold) {
          anomalies.push({
            index,
            value,
            score: zScore,
            reason: `Z-score ${zScore.toFixed(2)} exceeds threshold ${zThreshold}`
          });
        }
      });
      
      // IQR method for additional validation
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      numericData.forEach(({ value, index }) => {
        if (value < lowerBound || value > upperBound) {
          const existing = anomalies.find(a => a.index === index);
          if (!existing) {
            anomalies.push({
              index,
              value,
              score: Math.abs(value - mean) / stdDev,
              reason: `IQR outlier (${value} outside [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}])`
            });
          }
        }
      });
      
      return { column: columnName, anomalies, threshold: zThreshold };
    }
    
    // For categorical data - detect rare values
    if (columnType === 'text') {
      const valueCounts = new Map<string, number>();
      columnData.forEach(value => {
        if (value != null && value !== '') {
          const strValue = String(value);
          valueCounts.set(strValue, (valueCounts.get(strValue) || 0) + 1);
        }
      });
      
      const totalValues = columnData.filter(v => v != null && v !== '').length;
      const rarityThreshold = Math.max(1, Math.floor(totalValues * 0.01)); // 1% threshold
      
      columnData.forEach((value, index) => {
        if (value != null && value !== '') {
          const count = valueCounts.get(String(value)) || 0;
          if (count <= rarityThreshold && count > 0) {
            anomalies.push({
              index,
              value,
              score: 1 - (count / totalValues),
              reason: `Rare value (appears ${count} times, ${((count / totalValues) * 100).toFixed(1)}%)`
            });
          }
        }
      });
    }
    
    return { column: columnName, anomalies, threshold: 0.01 };
  }, []);

  // Pattern recognition using frequency analysis and correlation
  const analyzePatterns = useCallback((): PatternAnalysis[] => {
    const patterns: PatternAnalysis[] = [];
    
    // Analyze missing value patterns
    const missingPatterns = new Map<string, number>();
    data.forEach(row => {
      const missingCols = columns.filter(col => {
        const value = row[col.name];
        return value === null || value === undefined || value === '';
      }).map(col => col.name).sort().join(',');
      
      if (missingCols) {
        missingPatterns.set(missingCols, (missingPatterns.get(missingCols) || 0) + 1);
      }
    });
    
    missingPatterns.forEach((frequency, pattern) => {
      if (frequency > data.length * 0.05) { // Pattern appears in >5% of rows
        patterns.push({
          pattern: `Missing values: ${pattern}`,
          frequency,
          columns: pattern.split(','),
          confidence: Math.min(frequency / data.length, 1),
          description: `${frequency} rows have missing values in the same columns: ${pattern.split(',').join(', ')}`
        });
      }
    });
    
    // Analyze data type inconsistencies
    columns.forEach(col => {
      if (col.type === 'numeric') {
        const columnData = data.map(row => row[col.name]);
        const nonNumericValues = columnData.filter(value => 
          value !== null && value !== undefined && value !== '' && isNaN(Number(value))
        );
        
        if (nonNumericValues.length > 0) {
          const uniqueNonNumeric = [...new Set(nonNumericValues.map(String))];
          patterns.push({
            pattern: `Type inconsistency in ${col.name}`,
            frequency: nonNumericValues.length,
            columns: [col.name],
            confidence: nonNumericValues.length / columnData.length,
            description: `Found ${nonNumericValues.length} non-numeric values in numeric column: ${uniqueNonNumeric.slice(0, 3).join(', ')}${uniqueNonNumeric.length > 3 ? '...' : ''}`
          });
        }
      }
    });
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }, [data, columns]);

  // Generate predictive insights
  const generatePredictions = useCallback((): MLInsight[] => {
    const predictions: MLInsight[] = [];
    
    // Predict potential future issues based on current trends
    const qualityTrend = issues.length / data.length;
    
    if (qualityTrend > 0.05) { // More than 5% issues
      predictions.push({
        id: `pred_${Date.now()}_1`,
        type: 'prediction',
        title: 'Quality Deterioration Risk',
        description: `Based on current issue rate (${(qualityTrend * 100).toFixed(1)}%), data quality may continue to decline without intervention.`,
        confidence: Math.min(qualityTrend * 2, 0.9),
        severity: qualityTrend > 0.1 ? 'high' : 'medium',
        impact: Math.min(qualityTrend * 100, 85),
        timestamp: new Date(),
        action: 'Implement automated data validation rules'
      });
    }
    
    // Predict resource impact
    const highImpactIssues = issues.filter(issue => issue.percentage > 10).length;
    if (highImpactIssues > 0) {
      predictions.push({
        id: `pred_${Date.now()}_2`,
        type: 'prediction',
        title: 'Processing Performance Impact',
        description: `${highImpactIssues} high-impact issues may slow down data processing by an estimated ${highImpactIssues * 15}%.`,
        confidence: 0.75,
        severity: 'medium',
        impact: highImpactIssues * 15,
        timestamp: new Date(),
        action: 'Prioritize fixing high-impact issues first'
      });
    }
    
    return predictions;
  }, [data, issues]);

  // Generate intelligent recommendations
  const generateRecommendations = useCallback((): MLInsight[] => {
    const recommendations: MLInsight[] = [];
    
    // Recommend based on issue patterns
    const issuesByColumn = new Map<string, DataQualityIssue[]>();
    issues.forEach(issue => {
      if (!issuesByColumn.has(issue.column)) {
        issuesByColumn.set(issue.column, []);
      }
      issuesByColumn.get(issue.column)!.push(issue);
    });
    
    issuesByColumn.forEach((columnIssues, columnName) => {
      if (columnIssues.length > 1) {
        const severityScore = columnIssues.reduce((sum, issue) => {
          return sum + (issue.severity === 'high' ? 3 : issue.severity === 'medium' ? 2 : 1);
        }, 0);
        
        recommendations.push({
          id: `rec_${Date.now()}_${columnName}`,
          type: 'recommendation',
          title: `Focus on ${columnName} Column`,
          description: `Column "${columnName}" has ${columnIssues.length} issues. Consider implementing validation rules or data cleaning procedures.`,
          confidence: Math.min(columnIssues.length / 5, 0.95),
          severity: severityScore > 5 ? 'high' : severityScore > 2 ? 'medium' : 'low',
          column: columnName,
          impact: Math.min(severityScore * 10, 80),
          timestamp: new Date(),
          action: `Set up automated validation for ${columnName}`
        });
      }
    });
    
    // Smart suggestions based on data patterns
    const nullColumns = columns.filter(col => {
      const nullCount = data.filter(row => {
        const value = row[col.name];
        return value === null || value === undefined || value === '';
      }).length;
      return nullCount > data.length * 0.3; // >30% null values
    });
    
    if (nullColumns.length > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_nulls`,
        type: 'recommendation',
        title: 'Address High Null Rate Columns',
        description: `${nullColumns.length} columns have >30% null values: ${nullColumns.map(c => c.name).join(', ')}. Consider making these optional or providing defaults.`,
        confidence: 0.8,
        severity: 'medium',
        impact: 60,
        timestamp: new Date(),
        action: 'Review column requirements and add default values'
      });
    }
    
    return recommendations;
  }, [data, columns, issues]);

  const runMLAnalysis = useCallback(async () => {
    if (data.length === 0 || columns.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      const allInsights: MLInsight[] = [];
      
      // Step 1: Anomaly Detection (30%)
      setAnalysisProgress(10);
      const detectedAnomalies: AnomalyDetectionResult[] = [];
      
      for (const column of columns) {
        const columnData = data.map(row => row[column.name]);
        const anomalyResult = detectAnomalies(columnData, column.name, column.type);
        
        if (anomalyResult.anomalies.length > 0) {
          detectedAnomalies.push(anomalyResult);
          
          // Create insight for significant anomalies
          if (anomalyResult.anomalies.length > data.length * 0.02) { // >2% anomalies
            allInsights.push({
              id: `anomaly_${column.name}_${Date.now()}`,
              type: 'anomaly',
              title: `Anomalies Detected in ${column.name}`,
              description: `Found ${anomalyResult.anomalies.length} anomalous values (${((anomalyResult.anomalies.length / data.length) * 100).toFixed(1)}% of data)`,
              confidence: Math.min(anomalyResult.anomalies.length / (data.length * 0.1), 0.95),
              severity: anomalyResult.anomalies.length > data.length * 0.05 ? 'high' : 'medium',
              column: column.name,
              impact: Math.min((anomalyResult.anomalies.length / data.length) * 100, 90),
              timestamp: new Date(),
              action: 'Review and validate flagged values'
            });
          }
        }
      }
      setAnomalies(detectedAnomalies);
      setAnalysisProgress(30);
      
      // Step 2: Pattern Analysis (50%)
      const detectedPatterns = analyzePatterns();
      setPatterns(detectedPatterns);
      
      detectedPatterns.forEach(pattern => {
        if (pattern.confidence > 0.1) {
          allInsights.push({
            id: `pattern_${Date.now()}_${Math.random()}`,
            type: 'pattern',
            title: `Data Pattern Identified`,
            description: pattern.description,
            confidence: pattern.confidence,
            severity: pattern.confidence > 0.3 ? 'high' : pattern.confidence > 0.1 ? 'medium' : 'low',
            impact: Math.min(pattern.confidence * 100, 85),
            timestamp: new Date(),
            action: 'Investigate pattern root cause'
          });
        }
      });
      setAnalysisProgress(50);
      
      // Step 3: Predictions (70%)
      const generatedPredictions = generatePredictions();
      setPredictions(generatedPredictions);
      allInsights.push(...generatedPredictions);
      setAnalysisProgress(70);
      
      // Step 4: Recommendations (90%)
      const generatedRecommendations = generateRecommendations();
      allInsights.push(...generatedRecommendations);
      setAnalysisProgress(90);
      
      // Sort insights by impact and confidence
      const sortedInsights = allInsights.sort((a, b) => {
        const scoreA = a.impact * 0.6 + a.confidence * 100 * 0.4;
        const scoreB = b.impact * 0.6 + b.confidence * 100 * 0.4;
        return scoreB - scoreA;
      });
      
      setInsights(sortedInsights);
      onInsightGenerated?.(sortedInsights);
      setAnalysisProgress(100);
      
      toast({
        title: "ML Analysis Complete",
        description: `Generated ${sortedInsights.length} insights from machine learning analysis.`,
      });
      
    } catch (error) {
      console.error('ML Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete ML analysis.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  }, [data, columns, detectAnomalies, analyzePatterns, generatePredictions, generateRecommendations, onInsightGenerated, toast]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'pattern': return <TrendingUp className="h-4 w-4" />;
      case 'prediction': return <Target className="h-4 w-4" />;
      case 'recommendation': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
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

  return (
    <div className="space-y-6">
      {/* ML Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Machine Learning Analysis
              </CardTitle>
              <CardDescription>
                Advanced AI-powered data quality insights and predictions
              </CardDescription>
            </div>
            
            <Button
              onClick={runMLAnalysis}
              disabled={isAnalyzing || data.length === 0}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Run ML Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isAnalyzing && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {insights.length > 0 && (
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">All Insights</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4">
              {insights.map(insight => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant={getSeverityColor(insight.severity) as any} className="text-xs">
                            {insight.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Impact: {insight.impact}%</span>
                            {insight.column && <span>Column: {insight.column}</span>}
                            <span>{insight.timestamp.toLocaleTimeString()}</span>
                          </div>
                          
                          {insight.action && (
                            <Badge variant="outline" className="text-xs">
                              {insight.action}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="anomalies" className="space-y-4">
            {anomalies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No anomalies detected</p>
                <p className="text-sm">Your data appears to be consistent</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {anomalies.map(anomaly => (
                  <Card key={anomaly.column}>
                    <CardHeader>
                      <CardTitle className="text-lg">{anomaly.column}</CardTitle>
                      <CardDescription>
                        {anomaly.anomalies.length} anomalies detected
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {anomaly.anomalies.slice(0, 10).map((anom, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                            <span className="text-sm">Row {anom.index + 1}: {String(anom.value)}</span>
                            <div className="text-xs text-muted-foreground">
                              Score: {anom.score.toFixed(2)}
                            </div>
                          </div>
                        ))}
                        {anomaly.anomalies.length > 10 && (
                          <div className="text-center text-sm text-muted-foreground">
                            ... and {anomaly.anomalies.length - 10} more
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-4">
            {patterns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No significant patterns detected</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {patterns.map((pattern, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{pattern.pattern}</h4>
                        <Badge variant="outline">
                          {Math.round(pattern.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pattern.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Frequency: {pattern.frequency} | Columns: {pattern.columns.join(', ')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="predictions" className="space-y-4">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No predictions available</p>
                <p className="text-sm">Run analysis with more data for predictions</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {predictions.map(prediction => (
                  <Alert key={prediction.id}>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <strong>{prediction.title}</strong>
                          <Badge variant={getSeverityColor(prediction.severity) as any}>
                            {prediction.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p>{prediction.description}</p>
                        {prediction.action && (
                          <div className="text-sm text-muted-foreground">
                            Recommended action: {prediction.action}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};