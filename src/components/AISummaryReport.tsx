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
import { useEnhancedAIContext } from '@/hooks/useEnhancedAIContext';
import { exportAIReportToPDF } from '@/utils/pdf';
import { DataSamplingInfo } from '@/components/transparency/DataSamplingInfo';
import { DateRangeFilter } from '@/components/ui/date-range-filter';

interface AISummaryReportProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
}

interface DatasetProfile {
  dataType: 'customer' | 'financial' | 'sales' | 'marketing' | 'operations' | 'hr' | 'scientific' | 'mixed' | 'unknown';
  confidence: number;
  keyColumns: {
    identifiers: string[];
    dates: string[];
    metrics: string[];
    categories: string[];
    risks: string[];
  };
  businessContext: string;
  analysisApproach: string;
}

interface UniversalHealthMetrics {
  dataQuality: number;
  trendDirection: 'improving' | 'stable' | 'declining' | 'volatile' | 'insufficient_data';
  riskFactors: string[];
  opportunities: string[];
  keyInsights: string[];
  criticalIssues: string[];
  dataCharacteristics: Record<string, any>;
}

interface ReportData {
  report: string;
  datasetProfile?: DatasetProfile;
  healthMetrics?: UniversalHealthMetrics;
  metadata: {
    totalRows: number;
    totalColumns: number;
    columnTypes: Record<string, number>;
    dataCompleteness: Array<{ column: string; completeness: number }>;
    persona: string;
    generatedAt: string;
    dataTypeDetected?: string;
    qualityAlert?: string;
  };
}

const personas = [
  { 
    value: 'general', 
    label: 'General Analysis', 
    icon: BarChart3, 
    description: 'Comprehensive insights adapted to your data type',
    getPrompt: (profile: DatasetProfile) => `Analyze this ${profile.dataType} dataset comprehensively. Focus on data quality, trends, patterns, and ${profile.businessContext}. Identify any critical issues, declining trends, or data quality problems. Structure your analysis based on the ${profile.analysisApproach}.`
  },
  { 
    value: 'executive', 
    label: 'Executive', 
    icon: Briefcase, 
    description: 'Strategic insights for leadership',
    getPrompt: (profile: DatasetProfile) => `Provide executive-level strategic analysis for this ${profile.dataType} data. Focus on business implications, performance trends, risk assessment, and strategic recommendations. If any declining trends or critical issues are detected, prioritize these in your analysis. Present insights suitable for C-level decision making.`
  },
  { 
    value: 'analyst', 
    label: 'Data Analyst', 
    icon: Brain, 
    description: 'Technical analysis with statistical insights',
    getPrompt: (profile: DatasetProfile) => `Perform detailed analytical assessment of this ${profile.dataType} dataset. Focus on statistical analysis, data quality assessment, correlation analysis, trend detection, and anomaly identification. Provide quantitative insights and validate data reliability. Use statistical methods appropriate for ${profile.analysisApproach}.`
  },
  { 
    value: 'operational', 
    label: 'Operational', 
    icon: Activity, 
    description: 'Process and efficiency insights',
    getPrompt: (profile: DatasetProfile) => `Analyze this ${profile.dataType} data from an operational perspective. Focus on efficiency metrics, process performance, operational KPIs, and process optimization opportunities. Identify bottlenecks, inefficiencies, or operational risks based on the data patterns.`
  },
  { 
    value: 'domain_expert', 
    label: 'Domain Expert', 
    icon: TrendingUp, 
    description: 'Industry-specific insights',
    getPrompt: (profile: DatasetProfile) => `Provide domain-expert analysis for this ${profile.dataType} dataset. Apply industry best practices, domain-specific KPIs, and specialized knowledge relevant to ${profile.businessContext}. Focus on insights that require deep understanding of this specific domain and industry context.`
  }
];

export const AISummaryReport = ({ data, columns, fileName }: AISummaryReportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('general');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredData, setFilteredData] = useState<DataRow[]>(data);
  const [filterSummary, setFilterSummary] = useState<string>(`All ${data.length.toLocaleString()} rows`);
  const { toast } = useToast();
  const { usesRemaining, isLoading: usageLoading, decrementUsage } = useUsageTracking();
  const { isAdmin } = useUserRole();
  const { buildAIContext, hasEnhancedContext } = useEnhancedAIContext();

  // Smart dataset profiling - detects what type of data this is
  const profileDataset = (data: DataRow[], columns: ColumnInfo[]): DatasetProfile => {
    console.log('=== Smart Dataset Profiling ===');
    
    const columnNames = columns.map(c => c.name.toLowerCase());
    const numericColumns = columns.filter(c => c.type === 'numeric').map(c => c.name.toLowerCase());
    const dateColumns = columns.filter(c => c.type === 'date' || c.name.toLowerCase().includes('date')).map(c => c.name);
    
    // Column pattern matching for different data types
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

    // Score each data type based on column name matches
    Object.keys(patterns).forEach(type => {
      patterns[type].score = patterns[type].keywords.reduce((score, keyword) => {
        return score + columnNames.filter(col => col.includes(keyword)).length;
      }, 0);
    });

    // Determine the most likely data type
    const scores = Object.entries(patterns).map(([type, data]) => ({ type, score: data.score }));
    const bestMatch = scores.reduce((max, current) => current.score > max.score ? current : max);
    
    let dataType = bestMatch.score > 0 ? bestMatch.type as any : 'unknown';
    const confidence = bestMatch.score / columnNames.length;

    // If no clear match, analyze patterns more deeply
    if (confidence < 0.3) {
      if (numericColumns.length > columnNames.length * 0.7) {
        dataType = 'scientific'; // Mostly numeric = likely scientific/analytical
      } else if (dateColumns.length > 2) {
        dataType = 'operations'; // Many dates = likely operational/tracking
      } else {
        dataType = 'mixed';
      }
    }

    // Categorize columns by function
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

    // Generate business context and analysis approach
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

  // Universal health analysis - works for any data type
  const analyzeUniversalHealth = (data: DataRow[], columns: ColumnInfo[], profile: DatasetProfile): UniversalHealthMetrics => {
    console.log('=== Universal Health Analysis ===');
    
    const numericColumns = columns.filter(c => c.type === 'numeric');
    const riskFactors: string[] = [];
    const opportunities: string[] = [];
    const keyInsights: string[] = [];
    const criticalIssues: string[] = [];

    // Data Quality Assessment
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

    // Trend Analysis for Numeric Columns
    let trendDirection: 'improving' | 'stable' | 'declining' | 'volatile' | 'insufficient_data' = 'insufficient_data';
    
    if (numericColumns.length > 0 && data.length > 10) {
      const trends = numericColumns.map(col => {
        const values = data.map(row => Number(row[col.name])).filter(val => !isNaN(val));
        if (values.length < 5) return 0;
        
        // Simple trend calculation
        const n = values.length;
        const x = Array.from({length: n}, (_, i) => i);
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = values.reduce((a, b) => a + b, 0) / n;
        
        const ssXX = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
        const ssXY = x.reduce((sum, xi, i) => sum + (xi - meanX) * (values[i] - meanY), 0);
        
        return ssXX > 0 ? ssXY / ssXX : 0; // slope
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

    // Outlier Detection
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

    // Domain-specific insights
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

    // Data characteristics
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

    // Generate insights based on data characteristics
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

  const buildAdaptiveAIContext = (
    data: DataRow[], 
    columns: ColumnInfo[], 
    profile: DatasetProfile, 
    healthMetrics: UniversalHealthMetrics
  ) => {
    const sampleSize = isAdmin ? 200 : 20;
    const baseContext = buildAIContext(data, columns, fileName, sampleSize, isAdmin);
    
    const adaptiveContext = `
DATASET PROFILE ANALYSIS:
Data Type: ${profile.dataType.toUpperCase()} (${(profile.confidence * 100).toFixed(1)}% confidence)
Business Context: ${profile.businessContext}
Analysis Approach: ${profile.analysisApproach}

KEY COLUMN CATEGORIES:
- Identifiers: ${profile.keyColumns.identifiers.join(', ') || 'None detected'}
- Date Columns: ${profile.keyColumns.dates.join(', ') || 'None detected'}
- Metric Columns: ${profile.keyColumns.metrics.join(', ') || 'None detected'}
- Category Columns: ${profile.keyColumns.categories.join(', ') || 'None detected'}
- Risk/Score Columns: ${profile.keyColumns.risks.join(', ') || 'None detected'}

UNIVERSAL HEALTH ASSESSMENT:
Data Quality: ${(healthMetrics.dataQuality * 100).toFixed(1)}%
Trend Direction: ${healthMetrics.trendDirection.toUpperCase()}
Risk Factors: ${healthMetrics.riskFactors.length}
Critical Issues: ${healthMetrics.criticalIssues.length}

${healthMetrics.criticalIssues.length > 0 ? `
🚨 CRITICAL ISSUES DETECTED:
${healthMetrics.criticalIssues.map(issue => `- ${issue}`).join('\n')}
` : ''}

${healthMetrics.riskFactors.length > 0 ? `
⚠️ RISK FACTORS:
${healthMetrics.riskFactors.map(risk => `- ${risk}`).join('\n')}
` : ''}

${healthMetrics.opportunities.length > 0 ? `
💡 OPPORTUNITIES:
${healthMetrics.opportunities.map(opp => `- ${opp}`).join('\n')}
` : ''}

DATA CHARACTERISTICS:
${Object.entries(healthMetrics.dataCharacteristics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

ANALYSIS INSTRUCTIONS:
1. Adapt your analysis to the detected data type: ${profile.dataType}
2. Focus on the business context: ${profile.businessContext}
3. Use appropriate analysis methods: ${profile.analysisApproach}
4. If critical issues exist, prioritize these in your analysis
5. Provide domain-specific insights relevant to ${profile.dataType} data
6. Consider data quality limitations in your recommendations
7. Structure insights appropriate for the detected data patterns
`;

    return baseContext + '\n\n' + adaptiveContext;
  };

  const generateReport = async () => {
    if (!filteredData.length || !columns.length) {
      toast({
        title: "No Data",
        description: "Please upload data before generating a report.",
        variant: "destructive",
      });
      return;
    }

    const canProceed = await decrementUsage();
    if (!canProceed) return;

    setIsGenerating(true);

    try {
      // Smart dataset profiling
      const datasetProfile = profileDataset(filteredData, columns);
      
      // Universal health analysis
      const healthMetrics = analyzeUniversalHealth(filteredData, columns, datasetProfile);
      
      // Build adaptive context
      const adaptiveContext = buildAdaptiveAIContext(filteredData, columns, datasetProfile, healthMetrics);
      
      // Get dynamic prompt based on data type and persona
      const selectedPersonaConfig = personas.find(p => p.value === selectedPersona);
      const dynamicPrompt = selectedPersonaConfig?.getPrompt(datasetProfile) || selectedPersonaConfig?.description || '';
      
      const systemPrompt = `${dynamicPrompt}

CRITICAL ANALYSIS FRAMEWORK:
- Dataset Type: ${datasetProfile.dataType} 
- Quality Level: ${(healthMetrics.dataQuality * 100).toFixed(1)}%
- Trend Status: ${healthMetrics.trendDirection}

${healthMetrics.criticalIssues.length > 0 ? `
🚨 PRIORITY: Address these critical issues first:
${healthMetrics.criticalIssues.map(issue => `- ${issue}`).join('\n')}
` : ''}

OUTPUT REQUIREMENTS:
- Adapt analysis depth to data type and business context
- Use domain-appropriate terminology and KPIs
- If quality issues exist, discuss data reliability limitations
- Provide actionable recommendations specific to ${datasetProfile.dataType} domain
- Structure findings based on ${datasetProfile.analysisApproach}
- Include confidence levels based on data quality and sample size
`;

      const { data: response, error } = await supabase.functions.invoke('ai-summary-report', {
        body: {
          dataContext: adaptiveContext,
          persona: selectedPersona,
          systemPrompt: systemPrompt,
          datasetProfile: datasetProfile,
          healthMetrics: healthMetrics
        }
      });

      if (error) throw error;

      const enhancedResponse = {
        ...response,
        datasetProfile,
        healthMetrics,
        metadata: {
          ...response.metadata,
          dataTypeDetected: `${datasetProfile.dataType} (${(datasetProfile.confidence * 100).toFixed(1)}% confidence)`,
          qualityAlert: healthMetrics.criticalIssues.length > 0 ? 
            `${healthMetrics.criticalIssues.length} critical issues detected` : 
            healthMetrics.dataQuality < 0.8 ? 
            `Data quality: ${(healthMetrics.dataQuality * 100).toFixed(1)}%` : 
            undefined
        }
      };

      setReportData(enhancedResponse);
      
      if (healthMetrics.criticalIssues.length > 0) {
        toast({
          title: "⚠️ Critical Issues Detected",
          description: `${healthMetrics.criticalIssues.length} issues found in ${datasetProfile.dataType} data`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Generated",
          description: `${datasetProfile.dataType} data analysis complete!`,
        });
      }

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
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
        description: "Failed to export report to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (data.length === 0) {
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
            Dynamic AI Analysis
            {isAdmin && (
              <Badge variant="default" className="text-xs bg-purple-500">
                Admin Mode - Unlimited
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {hasEnhancedContext && (
              <Badge variant="default" className="text-xs">
                Enhanced AI
              </Badge>
            )}
            <Badge variant="default" className="text-xs bg-blue-600">
              Smart Data Profiling
            </Badge>
            <DataSamplingInfo 
              totalRows={filteredData.length} 
              sampleSize={isAdmin ? Math.min(filteredData.length, 50000) : 20} 
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
            Intelligent analysis that adapts to your data type - automatically detects customer, financial, sales, marketing, operations, HR, or scientific data.
            {filteredData.length !== data.length && (
              <span className="font-medium"> Currently analyzing: {filterSummary}</span>
            )}
          </p>
          <DataSamplingInfo 
            totalRows={filteredData.length} 
            sampleSize={isAdmin ? Math.min(filteredData.length, 50000) : 20} 
            columns={columns}
            analysisType="report"
            showDetailedView={true}
          />
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Analysis Perspective</label>
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger>
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
              title={(!isAdmin && usesRemaining <= 0) ? "No AI uses remaining" : "Generate adaptive AI analysis"}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {reportData && (
        <Card className="p-6">
          {/* Quality/Critical Issues Alert */}
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

          {/* Dataset Profile Summary */}
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

          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold">Dynamic Analysis Report</h4>
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
                    reportData.metadata.dataCompleteness.reduce((sum, dc) => sum + dc.completeness, 0) / 
                    reportData.metadata.dataCompleteness.length
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
