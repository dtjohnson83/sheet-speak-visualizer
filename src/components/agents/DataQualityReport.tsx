import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DataQualityReportProps {
  reportData: {
    timestamp: string;
    datasetInfo: {
      rows: number;
      columns: number;
    };
    qualityScore: {
      overall: number;
      completeness: number;
      consistency: number;
      accuracy: number;
      uniqueness: number;
      timeliness: number;
    };
    issues: Array<{
      type: string;
      severity: string;
      column: string;
      description: string;
      affectedRows: number;
      percentage: number;
    }>;
    summary: {
      totalIssues: number;
      highSeverityIssues: number;
      affectedColumns: number;
    };
  };
  fileName?: string;
}

export const DataQualityReport = ({ reportData, fileName = "dataset" }: DataQualityReportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      // Here you would implement PDF generation logic
      // For now, we'll create a detailed text report
      const reportContent = generateReportContent();
      downloadReport(reportContent, 'text');
    } catch (error) {
      console.error('Error generating PDF report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportContent = () => {
    const { timestamp, datasetInfo, qualityScore, issues, summary } = reportData;
    
    return `
DATA QUALITY ASSESSMENT REPORT
Generated: ${new Date(timestamp).toLocaleString()}
Dataset: ${fileName}

EXECUTIVE SUMMARY
================
Overall Quality Score: ${qualityScore.overall.toFixed(1)}%
Dataset Size: ${datasetInfo.rows.toLocaleString()} rows, ${datasetInfo.columns} columns
Total Issues Found: ${summary.totalIssues}
High Severity Issues: ${summary.highSeverityIssues}
Affected Columns: ${summary.affectedColumns}

QUALITY DIMENSIONS
==================
Completeness: ${qualityScore.completeness.toFixed(1)}%
Consistency: ${qualityScore.consistency.toFixed(1)}%
Accuracy: ${qualityScore.accuracy.toFixed(1)}%
Uniqueness: ${qualityScore.uniqueness.toFixed(1)}%
Timeliness: ${qualityScore.timeliness.toFixed(1)}%

DETAILED FINDINGS
=================
${issues.length > 0 ? 
  issues.map((issue, index) => `
${index + 1}. ${issue.column} - ${issue.type.toUpperCase()} ISSUE
   Severity: ${issue.severity.toUpperCase()}
   Description: ${issue.description}
   Impact: ${issue.affectedRows} rows affected (${issue.percentage.toFixed(1)}%)
`).join('\n') : 
'No significant data quality issues detected.'}

RECOMMENDATIONS
===============
${generateRecommendations()}

QUALITY SCORE INTERPRETATION
============================
90-100%: Excellent - Data meets high quality standards
70-89%:  Good - Minor improvements recommended
50-69%:  Fair - Significant improvements needed
0-49%:   Poor - Major data quality issues require immediate attention
    `;
  };

  const generateRecommendations = () => {
    const { qualityScore, issues } = reportData;
    const recommendations: string[] = [];

    if (qualityScore.completeness < 90) {
      recommendations.push("• Implement data validation rules to prevent missing values");
      recommendations.push("• Consider making critical fields mandatory in data entry systems");
    }

    if (qualityScore.consistency < 90) {
      recommendations.push("• Establish data format standards and validation rules");
      recommendations.push("• Implement data type checking and format validation");
    }

    if (qualityScore.uniqueness < 95) {
      recommendations.push("• Review and implement unique constraints on identifier fields");
      recommendations.push("• Investigate sources of duplicate data entries");
    }

    if (issues.some(issue => issue.severity === 'high')) {
      recommendations.push("• Prioritize addressing high-severity issues immediately");
      recommendations.push("• Implement automated data quality monitoring");
    }

    if (recommendations.length === 0) {
      recommendations.push("• Maintain current data quality practices");
      recommendations.push("• Consider implementing automated quality monitoring for ongoing assurance");
    }

    return recommendations.join('\n');
  };

  const downloadReport = (content: string, format: 'text' | 'json') => {
    const blob = new Blob([content], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-quality-report-${fileName}-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSONReport = () => {
    const jsonContent = JSON.stringify(reportData, null, 2);
    downloadReport(jsonContent, 'json');
  };

  const getQualityStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (score >= 70) return { label: 'Good', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
    if (score >= 50) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { label: 'Poor', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  };

  const { timestamp, datasetInfo, qualityScore, issues, summary } = reportData;
  const qualityStatus = getQualityStatus(qualityScore.overall);
  const StatusIcon = qualityStatus.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Quality Report
            </CardTitle>
            <CardDescription>
              Comprehensive assessment for {fileName}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadJSONReport}
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generatePDFReport}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Report'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">Overall Score</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {qualityScore.overall.toFixed(1)}%
            </div>
            <Badge className={qualityStatus.color}>
              {qualityStatus.label}
            </Badge>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5" />
              <span className="font-medium">Dataset Size</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {datasetInfo.rows.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {datasetInfo.columns} columns
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Issues Found</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {summary.totalIssues}
            </div>
            <div className="text-sm text-red-600">
              {summary.highSeverityIssues} high severity
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Generated</span>
            </div>
            <div className="text-sm font-medium">
              {new Date(timestamp).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          </Card>
        </div>

        <Separator />

        {/* Quality Dimensions */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quality Dimensions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { key: 'completeness', label: 'Completeness', icon: Database },
              { key: 'consistency', label: 'Consistency', icon: CheckCircle },
              { key: 'accuracy', label: 'Accuracy', icon: CheckCircle },
              { key: 'uniqueness', label: 'Uniqueness', icon: FileText },
              { key: 'timeliness', label: 'Timeliness', icon: Activity }
            ].map(({ key, label, icon: Icon }) => {
              const score = qualityScore[key as keyof typeof qualityScore];
              const status = getQualityStatus(score);
              return (
                <Card key={key} className="p-4 text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-lg font-bold mb-1">
                    {score.toFixed(0)}%
                  </div>
                  <div className="text-sm font-medium mb-2">
                    {label}
                  </div>
                  <Badge className={`${status.color} text-xs`}>
                    {status.label}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Detailed Issues */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detailed Findings
          </h3>
          {issues.length > 0 ? (
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{issue.column}</span>
                      <Badge variant={
                        issue.severity === 'high' ? 'destructive' : 
                        issue.severity === 'medium' ? 'default' : 'secondary'
                      }>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {issue.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {issue.affectedRows} rows ({issue.percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    {issue.description}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600">
                No significant data quality issues detected.
              </p>
            </Card>
          )}
        </div>

        <Separator />

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Recommendations
          </h3>
          <Card className="p-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-3">
                Based on the data quality analysis, here are our recommendations:
              </p>
              <div className="space-y-2">
                {generateRecommendations().split('\n').filter(rec => rec.trim()).map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation.replace('• ', '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};