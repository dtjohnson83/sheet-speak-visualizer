import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useUserRole } from '@/hooks/useUserRole';
import { FileText, Download, Sparkles, User, Briefcase, TrendingUp, Calculator, BarChart3, Brain, FileDown, AlertTriangle } from 'lucide-react';
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

interface BusinessHealthMetrics {
  customerTrend: 'growth' | 'stable' | 'decline' | 'crisis';
  acquisitionRate: number;
  churnRisk: number;
  activityLevel: number;
  revenueStability: number;
  criticalIssues: string[];
  keyMetrics: Record<string, any>;
}

interface ReportData {
  report: string;
  businessHealth?: BusinessHealthMetrics;
  metadata: {
    totalRows: number;
    totalColumns: number;
    columnTypes: Record<string, number>;
    dataCompleteness: Array<{ column: string; completeness: number }>;
    persona: string;
    generatedAt: string;
    businessHealthAlert?: string;
  };
}

const personas = [
  { 
    value: 'general', 
    label: 'General Analysis', 
    icon: BarChart3, 
    description: 'Comprehensive business insights with health assessment',
    prompt: 'Analyze this data comprehensively. Focus on business health, customer trends, revenue patterns, and operational metrics. Always identify declining trends, churn risks, and business crises. If customers are declining or revenue is dropping, make this the PRIMARY focus of your analysis.'
  },
  { 
    value: 'executive', 
    label: 'Executive', 
    icon: Briefcase, 
    description: 'Strategic insights for leadership with crisis alerts',
    prompt: 'Provide executive-level strategic analysis. CRITICALLY IMPORTANT: If business metrics show decline (customer loss, revenue drop, high churn), lead with URGENT BUSINESS HEALTH ALERTS. Focus on strategic implications, competitive position, and immediate action items for leadership.'
  },
  { 
    value: 'marketing', 
    label: 'Marketing', 
    icon: TrendingUp, 
    description: 'Customer and campaign insights with retention focus',
    prompt: 'Analyze from marketing perspective. Focus on customer acquisition vs. churn rates, segmentation opportunities, and retention strategies. If customer acquisition is declining or churn is high, prioritize retention marketing strategies over growth marketing.'
  },
  { 
    value: 'finance', 
    label: 'Finance', 
    icon: Calculator, 
    description: 'Financial performance with revenue trend analysis',
    prompt: 'Provide financial analysis focusing on revenue trends, customer lifetime value, and business sustainability. If revenue is declining or customer economics are poor, assess financial health and recommend cost optimization or turnaround strategies.'
  },
  { 
    value: 'operations', 
    label: 'Operations', 
    icon: BarChart3, 
    description: 'Efficiency and process insights with health monitoring',
    prompt: 'Analyze operational efficiency and customer service metrics. Focus on customer satisfaction, loyalty metrics, and operational KPIs. If satisfaction scores are low or churn risk is high, prioritize operational improvements for retention.'
  },
  { 
    value: 'data_scientist', 
    label: 'Data Science', 
    icon: Brain, 
    description: 'Technical statistical analysis with predictive insights',
    prompt: 'Perform statistical analysis with focus on trends, correlations, and predictive indicators. Calculate customer acquisition rates, churn predictions, and business trajectory. Always validate if business is growing, stable, declining, or in crisis based on quantitative analysis.'
  },
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

  // Analyze business health before sending to AI
  const analyzeBusinessHealth = (data: DataRow[]): BusinessHealthMetrics => {
    console.log('=== Pre-Analysis Business Health Check ===');
    
    // Analyze customer acquisition trends
    const signupDates = data
      .map(row => ({ date: new Date(row.SignupDate || ''), id: row.CustomerID }))
      .filter(item => !isNaN(item.date.getTime()) && item.id);

    const signupsByYear = signupDates.reduce((acc, item) => {
      const year = item.date.getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const years = Object.keys(signupsByYear).map(Number).sort();
    let acquisitionRate = 0;
    let customerTrend: 'growth' | 'stable' | 'decline' | 'crisis' = 'stable';

    if (years.length >= 2) {
      const latestYear = years[years.length - 1];
      const previousYear = years[years.length - 2];
      const currentYearSignups = signupsByYear[latestYear] || 0;
      const previousYearSignups = signupsByYear[previousYear] || 0;
      
      if (previousYearSignups > 0) {
        acquisitionRate = (currentYearSignups - previousYearSignups) / previousYearSignups;
        
        if (acquisitionRate > 0.1) customerTrend = 'growth';
        else if (acquisitionRate > -0.1) customerTrend = 'stable';
        else if (acquisitionRate > -0.3) customerTrend = 'decline';
        else customerTrend = 'crisis';
      }
    }

    // Analyze churn risk
    const churnScores = data
      .map(row => Number(row.ChurnRiskScore))
      .filter(score => !isNaN(score));
    const avgChurnRisk = churnScores.length > 0 ? 
      churnScores.reduce((a, b) => a + b, 0) / churnScores.length : 0.5;

    // Analyze activity level
    const currentYear = new Date().getFullYear();
    const activeCustomers = data.filter(row => {
      const lastOrder = new Date(row.LastOrderDate || '');
      return !isNaN(lastOrder.getTime()) && lastOrder.getFullYear() === currentYear;
    }).length;
    
    const activityLevel = data.length > 0 ? activeCustomers / data.length : 0;

    // Analyze revenue stability
    const revenueValues = data
      .map(row => Number(row.TotalSpend || row.Revenue || 0))
      .filter(val => val > 0);
    const revenueMean = revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length;
    const revenueVariance = revenueValues.reduce((sum, val) => sum + Math.pow(val - revenueMean, 2), 0) / revenueValues.length;
    const revenueStability = 1 - (Math.sqrt(revenueVariance) / revenueMean);

    // Identify critical issues
    const criticalIssues: string[] = [];
    if (acquisitionRate < -0.2) criticalIssues.push(`Customer acquisition declined ${Math.abs(acquisitionRate * 100).toFixed(1)}%`);
    if (avgChurnRisk > 0.6) criticalIssues.push(`High average churn risk: ${(avgChurnRisk * 100).toFixed(1)}%`);
    if (activityLevel < 0.3) criticalIssues.push(`Low customer activity: only ${(activityLevel * 100).toFixed(1)}% active`);
    const highRiskCustomers = churnScores.filter(score => score > 0.7).length;
    if (highRiskCustomers > data.length * 0.2) {
      criticalIssues.push(`${highRiskCustomers} customers (${((highRiskCustomers/data.length)*100).toFixed(1)}%) at high churn risk`);
    }

    const keyMetrics = {
      totalCustomers: data.length,
      activeCustomers,
      activityRate: activityLevel,
      avgChurnRisk,
      acquisitionTrend: acquisitionRate,
      signupsByYear,
      highRiskCustomers,
      avgRevenue: revenueMean
    };

    console.log('Business Health Analysis:', {
      customerTrend,
      acquisitionRate: (acquisitionRate * 100).toFixed(1) + '%',
      avgChurnRisk: (avgChurnRisk * 100).toFixed(1) + '%',
      activityLevel: (activityLevel * 100).toFixed(1) + '%',
      criticalIssues
    });

    return {
      customerTrend,
      acquisitionRate,
      churnRisk: avgChurnRisk,
      activityLevel,
      revenueStability: Math.max(0, Math.min(1, revenueStability)),
      criticalIssues,
      keyMetrics
    };
  };

  const buildEnhancedAIContext = (data: DataRow[], columns: ColumnInfo[], businessHealth: BusinessHealthMetrics) => {
    const sampleSize = isAdmin ? 200 : 20;
    const baseContext = buildAIContext(data, columns, fileName, sampleSize, isAdmin);
    
    // Add business health context
    const healthContext = `
CRITICAL BUSINESS HEALTH ANALYSIS:
Business State: ${businessHealth.customerTrend.toUpperCase()}
Customer Acquisition Rate: ${(businessHealth.acquisitionRate * 100).toFixed(1)}%
Average Churn Risk: ${(businessHealth.churnRisk * 100).toFixed(1)}%
Customer Activity Level: ${(businessHealth.activityLevel * 100).toFixed(1)}%
Revenue Stability: ${(businessHealth.revenueStability * 100).toFixed(1)}%

${businessHealth.criticalIssues.length > 0 ? `
🚨 CRITICAL ISSUES DETECTED:
${businessHealth.criticalIssues.map(issue => `- ${issue}`).join('\n')}

INSTRUCTIONS: These critical issues MUST be prominently featured in your analysis. If the business is in decline or crisis, make this the PRIMARY focus of your report.
` : ''}

KEY METRICS:
- Total Customers: ${businessHealth.keyMetrics.totalCustomers}
- Active Customers: ${businessHealth.keyMetrics.activeCustomers}
- High Risk Customers: ${businessHealth.keyMetrics.highRiskCustomers}
- Customer Signups by Year: ${JSON.stringify(businessHealth.keyMetrics.signupsByYear)}

ANALYSIS REQUIREMENTS:
1. If customer acquisition is negative, focus on retention and turnaround strategies
2. If churn risk is >50%, prioritize immediate retention interventions
3. If activity level is <40%, highlight customer engagement crisis
4. Always validate business health against the data trends
5. Provide specific, actionable recommendations based on business state
`;

    return baseContext + '\n\n' + healthContext;
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

    // Check usage limit before proceeding
    const canProceed = await decrementUsage();
    if (!canProceed) return;

    setIsGenerating(true);

    try {
      // Analyze business health first
      const businessHealth = analyzeBusinessHealth(filteredData);
      
      // Prepare enhanced data context with business health insights
      const enhancedContext = buildEnhancedAIContext(filteredData, columns, businessHealth);
      const selectedPersonaConfig = personas.find(p => p.value === selectedPersona);
      
      // Build comprehensive prompt with business health awareness
      const systemPrompt = `${selectedPersonaConfig?.prompt}

CRITICAL: The business health analysis shows this company is in "${businessHealth.customerTrend}" state with ${businessHealth.criticalIssues.length} critical issues.

${businessHealth.criticalIssues.length > 0 ? `
🚨 URGENT BUSINESS HEALTH ALERTS:
${businessHealth.criticalIssues.map(issue => `- ${issue}`).join('\n')}

Your analysis MUST lead with these critical findings and provide emergency recommendations.
` : ''}

ANALYSIS FRAMEWORK:
1. Business Health Assessment (lead with this if critical issues exist)
2. Data Quality and Completeness
3. Key Performance Indicators
4. Trend Analysis (customer, revenue, satisfaction)
5. Risk Assessment (churn, satisfaction, activity)
6. Actionable Recommendations (priority: emergency actions if in decline/crisis)
7. Strategic Next Steps

OUTPUT REQUIREMENTS:
- Use clear headers and bullet points for readability
- Quantify all insights with specific numbers and percentages
- If business is declining/crisis: focus 60% of report on urgent issues and solutions
- If business is stable/growing: balance analysis across all areas
- Always include confidence levels for your recommendations
- Provide specific, measurable action items
`;

      const { data: response, error } = await supabase.functions.invoke('ai-summary-report', {
        body: {
          dataContext: enhancedContext,
          persona: selectedPersona,
          systemPrompt: systemPrompt,
          businessHealth: businessHealth
        }
      });

      if (error) throw error;

      // Add business health alert to metadata if critical issues exist
      const enhancedResponse = {
        ...response,
        businessHealth,
        metadata: {
          ...response.metadata,
          businessHealthAlert: businessHealth.criticalIssues.length > 0 ? 
            `BUSINESS HEALTH ALERT: ${businessHealth.customerTrend.toUpperCase()} - ${businessHealth.criticalIssues.length} critical issues detected` : 
            undefined
        }
      };

      setReportData(enhancedResponse);
      
      // Show warning toast if critical issues detected
      if (businessHealth.criticalIssues.length > 0) {
        toast({
          title: "⚠️ Critical Business Issues Detected",
          description: `${businessHealth.criticalIssues.length} urgent issues found. Check the detailed report.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Report Generated",
          description: "Your AI summary report is ready!",
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

    const businessHealthSummary = reportData.businessHealth ? `
Business Health Assessment:
- State: ${reportData.businessHealth.customerTrend.toUpperCase()}
- Customer Acquisition Rate: ${(reportData.businessHealth.acquisitionRate * 100).toFixed(1)}%
- Average Churn Risk: ${(reportData.businessHealth.churnRisk * 100).toFixed(1)}%
- Customer Activity Level: ${(reportData.businessHealth.activityLevel * 100).toFixed(1)}%
${reportData.businessHealth.criticalIssues.length > 0 ? `
Critical Issues:
${reportData.businessHealth.criticalIssues.map(issue => `- ${issue}`).join('\n')}
` : ''}
` : '';

    const reportText = `AI Summary Report
Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString()}
Dataset: ${fileName || 'Uploaded Data'}
Persona: ${personas.find(p => p.value === reportData.metadata.persona)?.label}
${reportData.metadata.businessHealthAlert ? `
🚨 ${reportData.metadata.businessHealthAlert}
` : ''}

${businessHealthSummary}

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
    a.download = `ai-report-${fileName || 'data'}-${reportData.metadata.persona}-${Date.now()}.txt`;
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
      {/* Date Range Filter */}
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
            AI Summary Report
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
            <Badge variant="default" className="text-xs bg-green-600">
              Business Health Analysis
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
            Generate comprehensive insights with advanced business health analysis and crisis detection.
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
              Ready to analyze {filteredData.length.toLocaleString()} rows and {columns.length} columns with business health assessment
            </div>
            <Button 
              onClick={generateReport} 
              disabled={isGenerating || (!isAdmin && usesRemaining <= 0)}
              className="flex items-center gap-2"
              title={(!isAdmin && usesRemaining <= 0) ? "No AI uses remaining" : "Generate enhanced AI report with business health analysis"}
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
          {/* Business Health Alert */}
          {reportData.metadata.businessHealthAlert && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Business Health Alert</span>
              </div>
              <p className="text-red-700 text-sm">{reportData.metadata.businessHealthAlert}</p>
              {reportData.businessHealth?.criticalIssues && reportData.businessHealth.criticalIssues.length > 0 && (
                <ul className="mt-2 text-sm text-red-600">
                  {reportData.businessHealth.criticalIssues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span>•</span> {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold">Analysis Report</h4>
              <p className="text-sm text-gray-600">
                Generated on {new Date(reportData.metadata.generatedAt).toLocaleString()} • 
                {personas.find(p => p.value === reportData.metadata.persona)?.label} perspective
                {reportData.businessHealth && (
                  <span className="ml-2 font-medium">
                    • Business State: {reportData.businessHealth.customerTrend.toUpperCase()}
                  </span>
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

            {/* Business Health Summary */}
            {reportData.businessHealth && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="font-medium mb-2">Business Health Summary</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="font-medium">Customer Trend</div>
                    <div className={`${reportData.businessHealth.customerTrend === 'decline' || reportData.businessHealth.customerTrend === 'crisis' ? 'text-red-600' : 'text-gray-600'}`}>
                      {reportData.businessHealth.customerTrend.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Acquisition Rate</div>
                    <div className={`${reportData.businessHealth.acquisitionRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {(reportData.businessHealth.acquisitionRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Churn Risk</div>
                    <div className={`${reportData.businessHealth.churnRisk > 0.5 ? 'text-red-600' : 'text-gray-600'}`}>
                      {(reportData.businessHealth.churnRisk * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Activity Level</div>
                    <div className={`${reportData.businessHealth.activityLevel < 0.4 ? 'text-red-600' : 'text-gray-600'}`}>
                      {(reportData.businessHealth.activityLevel * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
