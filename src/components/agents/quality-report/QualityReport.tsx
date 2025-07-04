import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  BarChart3,
  Target,
  List,
  TrendingUp
} from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { QualityReportSummary } from './QualityReportSummary';
import { QualityReportPriorityActions } from './QualityReportPriorityActions';
import { QualityReportIssuesList } from './QualityReportIssuesList';
import { QualityReportRecommendations } from './QualityReportRecommendations';
import { generateQualityIssues } from './QualityIssueGenerator';

interface QualityReportProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

export const QualityReport = ({ data, columns, fileName }: QualityReportProps) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  const issues = generateQualityIssues(data, columns);
  const highPriorityIssues = issues.filter(issue => issue.severity === 'high');
  const mediumPriorityIssues = issues.filter(issue => issue.severity === 'medium');
  const lowPriorityIssues = issues.filter(issue => issue.severity === 'low');


  const downloadReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGenerating(true);
    
    const reportContent = `
DATA QUALITY ASSESSMENT REPORT
Generated: ${new Date().toLocaleString()}
Dataset: ${fileName}

EXECUTIVE SUMMARY
================
Total Issues Found: ${issues.length}
High Priority Issues: ${highPriorityIssues.length}
Medium Priority Issues: ${mediumPriorityIssues.length}
Low Priority Issues: ${lowPriorityIssues.length}

Dataset Information:
- Total Rows: ${data.length.toLocaleString()}
- Total Columns: ${columns.length}

PRIORITY ACTION ITEMS
====================
${highPriorityIssues.map((issue, index) => `
${index + 1}. ${issue.column || 'General'} - ${issue.category.toUpperCase()}
   Issue: ${issue.description}
   Action: ${issue.recommendation}
   Impact: ${issue.affectedRows || 0} rows affected${issue.percentage ? ` (${issue.percentage.toFixed(1)}%)` : ''}
`).join('')}

DETAILED FINDINGS
=================
${issues.map((issue, index) => `
${index + 1}. Column: ${issue.column || 'N/A'}
   Category: ${issue.category}
   Severity: ${issue.severity.toUpperCase()}
   Description: ${issue.description}
   Recommendation: ${issue.recommendation}
   Priority Score: ${issue.priority}/10
   ${issue.affectedRows ? `Affected Rows: ${issue.affectedRows}` : ''}
   ${issue.percentage ? `Percentage: ${issue.percentage.toFixed(1)}%` : ''}
`).join('')}

NEXT STEPS
==========
1. Address all high-priority issues immediately
2. Plan remediation for medium-priority issues within 2 weeks
3. Monitor low-priority issues and address during next maintenance cycle
4. Implement automated quality monitoring for ongoing data validation
5. Review and update data collection processes based on findings
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-quality-report-${fileName}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsGenerating(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Quality Assessment Report
              </CardTitle>
              <CardDescription>
                Comprehensive analysis and recommendations for {fileName}
              </CardDescription>
            </div>
            <Button 
              type="button"
              variant="outline" 
              onClick={downloadReport}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Priority Actions
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Issues
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <QualityReportSummary 
            issues={issues}
            highPriorityIssues={highPriorityIssues}
            mediumPriorityIssues={mediumPriorityIssues}
            lowPriorityIssues={lowPriorityIssues}
          />
        </TabsContent>

        {/* Priority Actions Tab */}
        <TabsContent value="priority" className="space-y-6">
          <QualityReportPriorityActions highPriorityIssues={highPriorityIssues} />
        </TabsContent>

        {/* All Issues Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <QualityReportIssuesList issues={issues} />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <QualityReportRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
};