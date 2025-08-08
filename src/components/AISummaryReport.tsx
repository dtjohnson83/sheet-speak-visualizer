import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useUserRole } from '@/hooks/useUserRole';
import { FileText, Download, Sparkles, User, Briefcase, TrendingUp, Calculator, BarChart3, Brain, FileDown, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDomainContext } from '@/hooks/useDomainContext';
import { exportAIReportToPDF } from '@/utils/pdf';
import { DataSamplingInfo } from '@/components/transparency/DataSamplingInfo';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { UnifiedReportData, DatasetProfile, UniversalHealthMetrics } from '@/types/reportTypes';
import { useAIAgents } from '@/hooks/useAIAgents';

interface AISummaryReportProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
  isExecutiveMode?: boolean;
}

const personas = [
  { 
    value: 'general', 
    label: 'General Analysis', 
    icon: BarChart3, 
    description: 'Comprehensive business intelligence insights'
  },
  { 
    value: 'executive', 
    label: 'Executive', 
    icon: Briefcase, 
    description: 'Strategic insights for leadership decisions'
  },
  { 
    value: 'analyst', 
    label: 'Data Analyst', 
    icon: Brain, 
    description: 'Technical analysis with statistical insights'
  },
  { 
    value: 'marketing', 
    label: 'Marketing', 
    icon: TrendingUp, 
    description: 'Customer and campaign performance insights'
  },
  { 
    value: 'finance', 
    label: 'Finance', 
    icon: Calculator, 
    description: 'Financial performance and cost analysis'
  },
  { 
    value: 'operations', 
    label: 'Operations', 
    icon: Activity, 
    description: 'Process efficiency and operational insights'
  }
];

export const AISummaryReport = ({ data, columns, fileName, isExecutiveMode = false }: AISummaryReportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('general');
  const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
  const [filteredData, setFilteredData] = useState<DataRow[]>(data);
  const [filterSummary, setFilterSummary] = useState<string>(`All ${data.length.toLocaleString()} rows`);
  const { toast } = useToast();
  const { usesRemaining, isLoading: usageLoading, decrementUsage } = useUsageTracking();
  const { isAdmin } = useUserRole();
  const { buildAIContext, domainContext, isContextCollected } = useDomainContext();
  const { agents, tasks, insights, agentSummary } = useAIAgents();

  const profileDataset = (data: DataRow[], columns: ColumnInfo[]): DatasetProfile => {
    console.log('=== Smart Dataset Profiling ===');
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No data provided for profiling');
      return {
        dataType: 'unknown',
        confidence: 0,
        keyColumns: {
          identifiers: [],
          dates: [],
          metrics: [],
          categories: [],
          risks: []
        },
        businessContext: 'general data patterns and statistical relationships',
        analysisApproach: 'exploratory data analysis and pattern discovery'
      };
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      console.warn('No columns provided for profiling');
      return {
        dataType: 'unknown',
        confidence: 0,
        keyColumns: {
          identifiers: [],
          dates: [],
          metrics: [],
          categories: [],
          risks: []
        },
        businessContext: 'general data patterns and statistical relationships',
        analysisApproach: 'exploratory data analysis and pattern discovery'
      };
    }

    const columnNames = columns.map(c => c.name.toLowerCase());
    const numericColumns = columns.filter(c => c.type === 'numeric').map(c => c.name.toLowerCase());
    const dateColumns = columns.filter(c => c.type === 'date' || c.name.toLowerCase().includes('date')).map(c => c.name);
    
    const patterns = {
      customer: {
        keywords: ['customer', 'user', 'client', 'signup', 'churn', 'retention', 'satisfaction', 'loyalty', 'spend'],
        score: 0
      },
      financial: {
        keywords: ['revenue', 'profit', 'cost', 'price', 'amount', 'balance', 'account', 'transaction', 'payment', 'invoice'],
        score: 0
      },
      sales: {
        keywords: ['sales', 'order', 'product', 'quantity', 'inventory', 'units', 'sold', 'purchase', 'sku'],
        score: 0
      },
      marketing: {
        keywords: ['campaign', 'ad', 'click', 'impression', 'conversion', 'lead', 'engagement', 'ctr', 'cpc'],
        score: 0
      },
      operations: {
        keywords: ['process', 'efficiency', 'production', 'manufacturing', 'quality', 'defect', 'cycle', 'throughput'],
        score: 0
      },
      hr: {
        keywords: ['employee', 'staff', 'salary', 'performance', 'department', 'hire', 'termination', 'rating'],
        score: 0
      },
      scientific: {
        keywords: ['experiment', 'sample', 'measurement', 'test', 'result', 'parameter', 'variable', 'observation'],
        score: 0
      }
    };

    Object.keys(patterns).forEach(type => {
      patterns[type].score = patterns[type].keywords.reduce((score, keyword) => {
        return score + columnNames.filter(col => col.includes(keyword)).length;
      }, 0);
    });

    const scores = Object.entries(patterns).map(([type, data]) => ({ type, score: data.score }));
    const bestMatch = scores.reduce((max, current) => current.score > max.score ? current : max);
    
    let dataType = bestMatch.score > 0 ? bestMatch.type as any : 'unknown';
    const confidence = bestMatch.score / columnNames.length;

    if (confidence < 0.3) {
      if (numericColumns.length > columnNames.length * 0.7) {
        dataType = 'scientific';
      } else if (dateColumns.length > 2) {
        dataType = 'operations';
      } else {
        dataType = 'mixed';
      }
    }

    const keyColumns = {
      identifiers: columnNames.filter(col => 
        col.includes('id') || col.includes('key') || col.includes('code') || col.includes('number')
      ),
      dates: dateColumns,
      metrics: numericColumns.filter(col => 
        !col.includes('id') && !col.includes('code') && !col.includes('number')
      ),
      categories: columns.filter(c => 
        c.type === 'text' && !c.name.toLowerCase().includes('id') && !c.name.toLowerCase().includes('name')
      ).map(c => c.name),
      risks: columnNames.filter(col => 
        col.includes('risk') || col.includes('score') || col.includes('rating')
      )
    };

    const businessContexts = {
      customer: 'customer lifecycle, retention, and satisfaction metrics',
      financial: 'financial performance, profitability, and monetary flows',
      sales: 'sales performance, product demand, and inventory management',
      marketing: 'campaign effectiveness, customer acquisition, and engagement',
      operations: 'operational efficiency, process performance, and quality metrics',
      hr: 'workforce analytics, performance management, and organizational metrics',
      scientific: 'experimental results, measurements, and research data',
      mixed: 'multi-domain business metrics and performance indicators',
      unknown: 'general data patterns and statistical relationships'
    };

    const analysisApproaches = {
      customer: 'customer journey analysis, cohort studies, and retention modeling',
      financial: 'financial ratio analysis, trend analysis, and performance benchmarking',
      sales: 'sales funnel analysis, demand forecasting, and product performance',
      marketing: 'campaign ROI analysis, conversion optimization, and attribution modeling',
      operations: 'process optimization, efficiency analysis, and quality control',
      hr: 'workforce analytics, performance correlation, and organizational health',
      scientific: 'statistical hypothesis testing, correlation analysis, and experimental validation',
      mixed: 'multi-perspective analysis combining domain-specific approaches',
      unknown: 'exploratory data analysis and pattern discovery'
    };

    console.log('Dataset Profile:', {
      dataType,
      confidence: (confidence * 100).toFixed(1) + '%',
      keyColumns,
      scores
    });

    return {
      dataType,
      confidence,
      keyColumns,
      businessContext: businessContexts[dataType],
      analysisApproach: analysisApproaches[dataType]
    };
  };

  const analyzeUniversalHealth = (data: DataRow[], columns: ColumnInfo[], profile: DatasetProfile): UniversalHealthMetrics => {
    console.log('=== Universal Health Analysis ===');
    
    if (!data || !Array.isArray(data) || data.length === 0 || !columns || !Array.isArray(columns) || columns.length === 0) {
      return {
        dataQuality: 0,
        trendDirection: 'insufficient_data',
        riskFactors: ['No data available for analysis'],
        opportunities: [],
        keyInsights: [],
        criticalIssues: ['Insufficient data for quality assessment'],
        dataCharacteristics: {
          rowCount: 0,
          columnCount: 0,
          numericColumns: 0,
          dateColumns: 0,
          categoricalColumns: 0,
          identifierColumns: 0,
          dataType: 'unknown',
          confidence: 0
        }
      };
    }

    const numericColumns = columns.filter(c => c.type === 'numeric');
    const riskFactors: string[] = [];
    const opportunities: string[] = [];
    const keyInsights: string[] = [];
    const criticalIssues: string[] = [];

    let totalCompleteness = 0;
    const columnCompleteness = columns.map(col => {
      const nonEmpty = data.filter(row => row[col.name] != null && row[col.name] !== '').length;
      const completeness = nonEmpty / data.length;
      totalCompleteness += completeness;
      
      if (completeness < 0.8) {
        riskFactors.push(`${col.name} has ${((1-completeness)*100).toFixed(1)}% missing data`);
      }
      
      return { column: col.name, completeness };
    });
    
    const dataQuality = totalCompleteness / columns.length;

    let trendDirection: 'improving' | 'stable' | 'declining' | 'volatile' | 'insufficient_data' = 'insufficient_data';
    
    if (numericColumns.length > 0 && data.length > 10) {
      const trends = numericColumns.map(col => {
        const values = data.map(row => Number(row[col.name])).filter(val => !isNaN(val));
        if (values.length < 5) return 0;
        
        const n = values.length;
        const x = Array.from({length: n}, (_, i) => i);
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = values.reduce((a, b) => a + b, 0) / n;
        
        const ssXX = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
        const ssXY = x.reduce((sum, xi, i) => sum + (xi - meanX) * (values[i] - meanY), 0);
        
        return ssXX > 0 ? ssXY / ssXX : 0;
      });
      
      const avgTrend = trends.reduce((a, b) => a + b, 0) / trends.length;
      const trendVariance = trends.reduce((sum, t) => sum + Math.pow(t - avgTrend, 2), 0) / trends.length;
      
      if (trendVariance > Math.abs(avgTrend) * 2) {
        trendDirection = 'volatile';
        riskFactors.push('High volatility detected in key metrics');
      } else if (avgTrend > 0.1) {
        trendDirection = 'improving';
        opportunities.push('Positive trends detected in multiple metrics');
      } else if (avgTrend < -0.1) {
        trendDirection = 'declining';
        criticalIssues.push('Declining trends detected in key metrics');
      } else {
        trendDirection = 'stable';
      }
    }

    numericColumns.forEach(col => {
      const values = data.map(row => Number(row[col.name])).filter(val => !isNaN(val));
      if (values.length > 10) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
        const outliers = values.filter(val => Math.abs(val - mean) > 3 * stdDev).length;
        
        if (outliers > values.length * 0.05) {
          riskFactors.push(`${col.name} has ${outliers} potential outliers (${((outliers/values.length)*100).toFixed(1)}%)`);
        }
      }
    });

    if (profile.dataType === 'customer' && profile.keyColumns.risks.length > 0) {
      const riskCol = profile.keyColumns.risks[0];
      const riskValues = data.map(row => Number(row[riskCol])).filter(val => !isNaN(val));
      if (riskValues.length > 0) {
        const avgRisk = riskValues.reduce((a, b) => a + b, 0) / riskValues.length;
        const highRisk = riskValues.filter(val => val > 0.7).length;
        
        if (avgRisk > 0.5) {
          criticalIssues.push(`High average risk score: ${(avgRisk * 100).toFixed(1)}%`);
        }
        if (highRisk > data.length * 0.2) {
          criticalIssues.push(`${highRisk} records (${((highRisk/data.length)*100).toFixed(1)}%) at high risk`);
        }
      }
    }

    const dataCharacteristics = {
      rowCount: data.length,
      columnCount: columns.length,
      numericColumns: numericColumns.length,
      dateColumns: profile.keyColumns.dates.length,
      categoricalColumns: profile.keyColumns.categories.length,
      identifierColumns: profile.keyColumns.identifiers.length,
      dataType: profile.dataType,
      confidence: profile.confidence
    };

    if (data.length < 50) {
      riskFactors.push('Limited sample size may affect analysis reliability');
    }
    
    if (numericColumns.length === 0) {
      riskFactors.push('No numeric columns found for quantitative analysis');
    }
    
    if (profile.keyColumns.dates.length === 0) {
      opportunities.push('Consider adding timestamp data for temporal analysis');
    }

    console.log('Universal Health Metrics:', {
      dataQuality: (dataQuality * 100).toFixed(1) + '%',
      trendDirection,
      riskFactors: riskFactors.length,
      criticalIssues: criticalIssues.length
    });

    return {
      dataQuality,
      trendDirection,
      riskFactors,
      opportunities,
      keyInsights,
      criticalIssues,
      dataCharacteristics
    };
  };

  const generateReport = async () => {
    if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload data before generating a report.",
        variant: "destructive",
      });
      return;
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      toast({
        title: "No Columns",
        description: "No columns detected in the data.",
        variant: "destructive",
      });
      return;
    }

    const canProceed = await decrementUsage();
    if (!canProceed) return;

    setIsGenerating(true);

    try {
      console.log('Starting optimized report generation with data:', {
        dataLength: filteredData.length,
        columnsLength: columns.length,
        persona: selectedPersona
      });

      const datasetProfile = profileDataset(filteredData, columns);
      const healthMetrics = analyzeUniversalHealth(filteredData, columns, datasetProfile);
      
      // Create optimized data context - smaller sample for faster processing
      const sampleSize = isAdmin ? 50 : 10;
      const dataContext = await buildAIContext(filteredData, columns, fileName, sampleSize, isAdmin);
      
      console.log('Sending optimized request to AI function...');

      // Enhanced payload for executive mode
      const requestBody = {
        dataContext: dataContext,
        persona: selectedPersona,
        datasetProfile: datasetProfile,
        healthMetrics: healthMetrics,
        domainContext: domainContext,
        ...(isExecutiveMode && {
          agentSummary: agentSummary,
          multiAgentInsights: {
            totalAgents: agents.length,
            activeAgents: agents.filter(a => a.status === 'active').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            totalInsights: insights.length,
            criticalInsights: insights.filter(i => i.severity === 'critical').length,
            recentInsights: insights.filter(i => 
              new Date(i.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
            ).length
          }
        })
      };

      const { data: response, error } = await supabase.functions.invoke('ai-summary-report', {
        body: requestBody
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI function response received:', response);

      const unifiedReportData: UnifiedReportData = {
        report: response.report || 'Report generation completed but no content returned.',
        datasetProfile,
        healthMetrics,
        metadata: {
          totalRows: response.metadata?.totalRows || filteredData.length,
          totalColumns: response.metadata?.totalColumns || columns.length,
          columnTypes: response.metadata?.columnTypes || {},
          dataCompleteness: response.metadata?.dataCompleteness || [],
          persona: selectedPersona,
          generatedAt: response.metadata?.generatedAt || new Date().toISOString(),
          dataTypeDetected: `${datasetProfile.dataType} (${(datasetProfile.confidence * 100).toFixed(1)}% confidence)`,
          qualityAlert: healthMetrics.criticalIssues.length > 0 ? 
            `${healthMetrics.criticalIssues.length} critical issues detected` : 
            healthMetrics.dataQuality < 0.8 ? 
            `Data quality: ${(healthMetrics.dataQuality * 100).toFixed(1)}%` : 
            undefined
        }
      };

      setReportData(unifiedReportData);
      
      if (healthMetrics.criticalIssues.length > 0) {
        toast({
          title: "⚠️ Critical Issues Detected",
          description: `${healthMetrics.criticalIssues.length} issues found in analysis`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `${datasetProfile.dataType} data insights generated successfully!`,
        });
      }

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    const profileSummary = reportData.datasetProfile ? `
Dataset Profile:
- Type: ${reportData.datasetProfile.dataType} (${(reportData.datasetProfile.confidence * 100).toFixed(1)}% confidence)
- Business Context: ${reportData.datasetProfile.businessContext}
- Analysis Approach: ${reportData.datasetProfile.analysisApproach}

Universal Health Metrics:
- Data Quality: ${(reportData.healthMetrics?.dataQuality || 0 * 100).toFixed(1)}%
- Trend Direction: ${reportData.healthMetrics?.trendDirection || 'unknown'}
${reportData.healthMetrics?.criticalIssues && reportData.healthMetrics.criticalIssues.length > 0 ? `
Critical Issues:
${reportData.healthMetrics.criticalIssues.map(issue => `- ${issue}`).join('\n')}
` : ''}
` : '';

    const reportText = `AI Summary Report - Dynamic Analysis
Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString()}
Dataset: ${fileName || 'Uploaded Data'}
Persona: ${personas.find(p => p.value === reportData.metadata.persona)?.label}
${reportData.metadata.dataTypeDetected ? `Data Type: ${reportData.metadata.dataTypeDetected}` : ''}
${reportData.metadata.qualityAlert ? `Quality Alert: ${reportData.metadata.qualityAlert}` : ''}

${profileSummary}

${reportData.report}

---
Report Metadata:
- Total Rows: ${reportData.metadata.totalRows.toLocaleString()}
- Total Columns: ${reportData.metadata.totalColumns}
- Column Types: ${Object.entries(reportData.metadata.columnTypes).map(([type, count]) => `${count} ${type}`).join(', ')}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-report-${reportData.datasetProfile?.dataType || 'data'}-${reportData.metadata.persona}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportReportToPDF = async () => {
    if (!reportData) return;

    try {
      await exportAIReportToPDF(reportData, fileName);
      toast({
        title: "Export Successful",
        description: "AI report exported to PDF successfully.",
      });
    } catch (error) {
      console.error('Error exporting report to PDF:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export report to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-gray-600">Upload data to generate an AI summary report.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <DateRangeFilter
        data={data}
        columns={columns}
        onFilteredDataChange={(filtered, summary) => {
          setFilteredData(filtered);
          setFilterSummary(summary);
        }}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Data Analysis
            {isAdmin && (
              <Badge variant="default" className="text-xs bg-purple-500">
                Admin Mode
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {isContextCollected && domainContext && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                {domainContext.domain} Context
              </Badge>
            )}
            <Badge variant="default" className="text-xs bg-blue-600">
              Optimized Processing
            </Badge>
            <DataSamplingInfo 
              totalRows={filteredData.length} 
              sampleSize={isAdmin ? 50 : 10} 
              columns={columns}
              analysisType="report"
            />
            {!usageLoading && !isAdmin && (
              <Badge variant={usesRemaining > 0 ? "secondary" : "destructive"}>
                {usesRemaining} uses remaining
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600">
            Get focused, actionable insights from your data. Analysis adapts to your data type and business context.
            {filteredData.length !== data.length && (
              <span className="font-medium"> Currently analyzing: {filterSummary}</span>
            )}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" htmlFor="analysis-persona">Analysis Perspective</label>
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger id="analysis-persona" name="analysisPersona">
                <SelectValue placeholder="Select analysis perspective" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((persona) => {
                  const Icon = persona.icon;
                  return (
                    <SelectItem key={persona.value} value={persona.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{persona.label}</div>
                          <div className="text-xs text-gray-500">{persona.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Smart analysis for {filteredData.length.toLocaleString()} rows and {columns.length} columns
            </div>
            <Button 
              onClick={generateReport} 
              disabled={isGenerating || (!isAdmin && usesRemaining <= 0)}
              className="flex items-center gap-2"
              title={(!isAdmin && usesRemaining <= 0) ? "No AI uses remaining" : "Generate focused data analysis"}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {reportData && (
        <Card className="p-6">
          {reportData.metadata.qualityAlert && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Data Quality Alert</span>
              </div>
              <p className="text-yellow-700 text-sm">{reportData.metadata.qualityAlert}</p>
              {reportData.healthMetrics?.criticalIssues && reportData.healthMetrics.criticalIssues.length > 0 && (
                <ul className="mt-2 text-sm text-yellow-600">
                  {reportData.healthMetrics.criticalIssues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span>•</span> {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {reportData.datasetProfile && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Dataset Profile</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="font-medium">Data Type: </span>
                  <span className="text-blue-700">{reportData.datasetProfile.dataType}</span>
                  <span className="text-blue-600 ml-1">({(reportData.datasetProfile.confidence * 100).toFixed(1)}%)</span>
                </div>
                <div>
                  <span className="font-medium">Quality: </span>
                  <span className={`${(reportData.healthMetrics?.dataQuality || 0) > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {((reportData.healthMetrics?.dataQuality || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="font-medium">Trend: </span>
                  <span className={`${reportData.healthMetrics?.trendDirection === 'declining' ? 'text-red-600' : reportData.healthMetrics?.trendDirection === 'improving' ? 'text-green-600' : 'text-gray-600'}`}>
                    {reportData.healthMetrics?.trendDirection || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Domain Context Display */}
          {isContextCollected && domainContext && (
            <div className="bg-muted/50 border rounded-lg p-4 mb-4">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Domain Context
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div><strong>Domain:</strong> {domainContext.domain}</div>
                {domainContext.industry && (
                  <div><strong>Industry:</strong> {domainContext.industry}</div>
                )}
                {domainContext.businessObjectives && domainContext.businessObjectives.length > 0 && (
                  <div><strong>Objectives:</strong> {domainContext.businessObjectives.join(', ')}</div>
                )}
                {domainContext.keyMetrics && domainContext.keyMetrics.length > 0 && (
                  <div><strong>Key Metrics:</strong> {domainContext.keyMetrics.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold">AI Analysis Report</h4>
              <p className="text-sm text-gray-600">
                Generated on {new Date(reportData.metadata.generatedAt).toLocaleString()} • 
                {personas.find(p => p.value === reportData.metadata.persona)?.label} perspective
                {reportData.metadata.dataTypeDetected && (
                  <span className="ml-2 font-medium">• {reportData.metadata.dataTypeDetected}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={exportReportToPDF} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                onClick={exportReport} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Text
              </Button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {reportData.report}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Rows</div>
                <div className="text-gray-600">{reportData.metadata.totalRows.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium">Columns</div>
                <div className="text-gray-600">{reportData.metadata.totalColumns}</div>
              </div>
              <div>
                <div className="font-medium">Data Quality</div>
                <div className="text-gray-600">
                  {Math.round(
                    reportData.metadata.dataCompleteness.length > 0 
                      ? reportData.metadata.dataCompleteness.reduce((sum, dc) => sum + dc.completeness, 0) / reportData.metadata.dataCompleteness.length
                      : 0
                  )}% complete
                </div>
              </div>
              <div>
                <div className="font-medium">Analysis Type</div>
                <div className="text-gray-600">{personas.find(p => p.value === reportData.metadata.persona)?.label}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
