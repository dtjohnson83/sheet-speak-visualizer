import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { FileText, Download, Sparkles, User, Briefcase, TrendingUp, Calculator, BarChart3, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useEnhancedAIContext } from '@/hooks/useEnhancedAIContext';

interface AISummaryReportProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
}

interface ReportData {
  report: string;
  metadata: {
    totalRows: number;
    totalColumns: number;
    columnTypes: Record<string, number>;
    dataCompleteness: Array<{ column: string; completeness: number }>;
    persona: string;
    generatedAt: string;
  };
}

const personas = [
  { value: 'general', label: 'General Analysis', icon: BarChart3, description: 'Comprehensive business insights' },
  { value: 'executive', label: 'Executive', icon: Briefcase, description: 'Strategic insights for leadership' },
  { value: 'marketing', label: 'Marketing', icon: TrendingUp, description: 'Customer and campaign insights' },
  { value: 'finance', label: 'Finance', icon: Calculator, description: 'Financial performance analysis' },
  { value: 'operations', label: 'Operations', icon: BarChart3, description: 'Efficiency and process insights' },
  { value: 'data_scientist', label: 'Data Science', icon: Brain, description: 'Technical statistical analysis' },
];

export const AISummaryReport = ({ data, columns, fileName }: AISummaryReportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('general');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { toast } = useToast();
  const { usesRemaining, isLoading: usageLoading, decrementUsage } = useUsageTracking();
  const { buildAIContext, hasEnhancedContext } = useEnhancedAIContext();

  const generateReport = async () => {
    if (!data.length || !columns.length) {
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
      // Prepare enhanced data context for AI
      const dataContext = buildAIContext(data, columns, fileName, 20);

      const { data: response, error } = await supabase.functions.invoke('ai-summary-report', {
        body: {
          dataContext,
          persona: selectedPersona
        }
      });

      if (error) throw error;

      setReportData(response);
      toast({
        title: "Report Generated",
        description: "Your AI summary report is ready!",
      });

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

    const reportText = `AI Summary Report
Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString()}
Dataset: ${fileName || 'Uploaded Data'}
Persona: ${personas.find(p => p.value === reportData.metadata.persona)?.label}

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
    a.download = `ai-report-${fileName || 'data'}-${reportData.metadata.persona}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Summary Report
          </h3>
          <div className="flex items-center gap-2">
            {hasEnhancedContext && (
              <Badge variant="default" className="text-xs">
                Enhanced AI
              </Badge>
            )}
            {!usageLoading && (
              <Badge variant={usesRemaining > 0 ? "secondary" : "destructive"}>
                {usesRemaining} uses remaining
              </Badge>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          Generate comprehensive insights and analysis of your data with AI-powered reporting.
        </p>
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
              Ready to analyze {data.length.toLocaleString()} rows and {columns.length} columns
            </div>
            <Button 
              onClick={generateReport} 
              disabled={isGenerating || usesRemaining <= 0}
              className="flex items-center gap-2"
              title={usesRemaining <= 0 ? "No AI uses remaining" : "Generate AI report"}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold">Analysis Report</h4>
              <p className="text-sm text-gray-600">
                Generated on {new Date(reportData.metadata.generatedAt).toLocaleString()} • 
                {personas.find(p => p.value === reportData.metadata.persona)?.label} perspective
              </p>
            </div>
            <Button 
              onClick={exportReport} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
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