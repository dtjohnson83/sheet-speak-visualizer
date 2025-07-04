import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Shield,
  FileCheck,
  Clock,
  Database,
  BarChart3,
  Target,
  List,
  AlertCircle
} from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface QualityReportProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

interface QualityIssue {
  category: string;
  severity: 'high' | 'medium' | 'low';
  column?: string;
  description: string;
  recommendation: string;
  priority: number;
  affectedRows?: number;
  percentage?: number;
}

export const QualityReport = ({ data, columns, fileName }: QualityReportProps) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQualityIssues = (): QualityIssue[] => {
    const issues: QualityIssue[] = [];

    columns.forEach(column => {
      const columnData = data.map(row => row[column.name]);
      const nonNullData = columnData.filter(value => value !== null && value !== undefined && value !== '');
      const nullCount = columnData.length - nonNullData.length;

      // Completeness issues
      if (nullCount > 0) {
        const percentage = (nullCount / columnData.length) * 100;
        issues.push({
          category: 'Completeness',
          severity: percentage > 20 ? 'high' : percentage > 10 ? 'medium' : 'low',
          column: column.name,
          description: `Column has ${nullCount} missing values (${percentage.toFixed(1)}% missing)`,
          recommendation: percentage > 20 
            ? 'Critical: Implement data validation rules and make this field mandatory in source systems'
            : percentage > 10
            ? 'Important: Review data collection process and add validation checks'
            : 'Monitor: Consider adding default values or optional field handling',
          priority: percentage > 20 ? 9 : percentage > 10 ? 6 : 3,
          affectedRows: nullCount,
          percentage
        });
      }

      // Validity issues for age fields
      if (column.name.toLowerCase().includes('age')) {
        const invalidAges = nonNullData.filter(value => {
          const num = Number(value);
          return isNaN(num) || num < 0 || num > 150;
        });
        
        if (invalidAges.length > 0) {
          issues.push({
            category: 'Validity',
            severity: 'high',
            column: column.name,
            description: `${invalidAges.length} invalid age values found`,
            recommendation: 'Implement age validation rules (0-150 years) and clean existing invalid data',
            priority: 8,
            affectedRows: invalidAges.length,
            percentage: (invalidAges.length / nonNullData.length) * 100
          });
        }
      }

      // Email format issues
      if (column.name.toLowerCase().includes('email')) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = nonNullData.filter(value => !emailPattern.test(String(value)));
        
        if (invalidEmails.length > 0) {
          issues.push({
            category: 'Conformity',
            severity: 'medium',
            column: column.name,
            description: `${invalidEmails.length} invalid email formats found`,
            recommendation: 'Implement email validation at data entry points and clean existing invalid emails',
            priority: 7,
            affectedRows: invalidEmails.length,
            percentage: (invalidEmails.length / nonNullData.length) * 100
          });
        }
      }

      // Uniqueness issues for ID fields
      if (column.name.toLowerCase().includes('id')) {
        const uniqueValues = new Set(nonNullData).size;
        const duplicates = nonNullData.length - uniqueValues;
        
        if (duplicates > 0) {
          issues.push({
            category: 'Uniqueness',
            severity: 'high',
            column: column.name,
            description: `${duplicates} duplicate values found in ID field`,
            recommendation: 'Implement unique constraints and investigate source of duplicates',
            priority: 9,
            affectedRows: duplicates,
            percentage: (duplicates / nonNullData.length) * 100
          });
        }
      }

      // Consistency issues for numeric fields
      if (column.type === 'numeric') {
        const numericValues = nonNullData.filter(value => !isNaN(Number(value)));
        const nonNumericCount = nonNullData.length - numericValues.length;
        
        if (nonNumericCount > 0) {
          issues.push({
            category: 'Consistency',
            severity: 'medium',
            column: column.name,
            description: `${nonNumericCount} non-numeric values in numeric field`,
            recommendation: 'Implement data type validation and clean non-numeric values',
            priority: 6,
            affectedRows: nonNumericCount,
            percentage: (nonNumericCount / nonNullData.length) * 100
          });
        }
      }
    });

    return issues.sort((a, b) => b.priority - a.priority);
  };

  const issues = generateQualityIssues();
  const highPriorityIssues = issues.filter(issue => issue.severity === 'high');
  const mediumPriorityIssues = issues.filter(issue => issue.severity === 'medium');
  const lowPriorityIssues = issues.filter(issue => issue.severity === 'low');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive">High Priority</Badge>;
      case 'medium': return <Badge variant="default">Medium Priority</Badge>;
      case 'low': return <Badge variant="secondary">Low Priority</Badge>;
      default: return <Badge variant="outline">Info</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Completeness': return <Database className="h-4 w-4" />;
      case 'Validity': return <Shield className="h-4 w-4" />;
      case 'Conformity': return <FileCheck className="h-4 w-4" />;
      case 'Consistency': return <CheckCircle className="h-4 w-4" />;
      case 'Uniqueness': return <FileText className="h-4 w-4" />;
      case 'Freshness': return <Clock className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const downloadReport = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Total Issues</span>
              </div>
              <div className="text-2xl font-bold">{issues.length}</div>
            </Card>
            
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium">High Priority</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{highPriorityIssues.length}</div>
            </Card>
            
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Medium Priority</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{mediumPriorityIssues.length}</div>
            </Card>
            
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Low Priority</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{lowPriorityIssues.length}</div>
            </Card>
          </div>

          {issues.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Excellent Data Quality!</h3>
                  <p className="text-gray-600">
                    No significant data quality issues were detected in your dataset.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Priority Actions Tab */}
        <TabsContent value="priority" className="space-y-6">
          {highPriorityIssues.length > 0 ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{highPriorityIssues.length} high-priority issues</strong> require immediate attention to ensure data integrity.
                </AlertDescription>
              </Alert>
              
              {highPriorityIssues.map((issue, index) => (
                <Card key={index} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(issue.category)}
                        <span className="font-medium">{issue.column || 'General'}</span>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <Badge variant="outline">Priority {issue.priority}/10</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Issue:</strong> {issue.description}</p>
                      <p className="text-sm"><strong>Action Required:</strong> {issue.recommendation}</p>
                      {issue.affectedRows && (
                        <p className="text-xs text-gray-600">
                          Impact: {issue.affectedRows} rows ({issue.percentage?.toFixed(1)}% of data)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No High-Priority Issues</h3>
                  <p className="text-gray-600">
                    Great! Your data doesn't have any critical issues requiring immediate attention.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Issues Tab */}
        <TabsContent value="detailed" className="space-y-6">
          {issues.length > 0 ? (
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(issue.severity)}
                        {getCategoryIcon(issue.category)}
                        <span className="font-medium">{issue.column || 'General'}</span>
                        {getSeverityBadge(issue.severity)}
                        <Badge variant="outline" className="capitalize">{issue.category}</Badge>
                      </div>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">{issue.description}</p>
                      <p className="text-sm text-blue-600"><strong>Recommendation:</strong> {issue.recommendation}</p>
                      {issue.affectedRows && (
                        <p className="text-xs text-gray-500">
                          {issue.affectedRows} rows affected ({issue.percentage?.toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                  <p className="text-gray-600">
                    Your data quality is excellent across all dimensions.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Improvement Recommendations</CardTitle>
              <CardDescription>
                Strategic recommendations to enhance your data quality processes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Immediate Actions (Next 24-48 hours)</h4>
                  <ul className="space-y-1 text-sm text-gray-600 ml-4">
                    <li>• Address all high-priority data quality issues</li>
                    <li>• Implement data validation rules for critical fields</li>
                    <li>• Clean invalid or duplicate data entries</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Short-term Improvements (1-2 weeks)</h4>
                  <ul className="space-y-1 text-sm text-gray-600 ml-4">
                    <li>• Resolve medium-priority issues</li>
                    <li>• Implement automated data quality monitoring</li>
                    <li>• Establish data quality metrics and KPIs</li>
                    <li>• Create data validation workflows</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Long-term Strategy (1-3 months)</h4>
                  <ul className="space-y-1 text-sm text-gray-600 ml-4">
                    <li>• Implement comprehensive data governance framework</li>
                    <li>• Establish data quality standards and policies</li>
                    <li>• Create automated data quality reporting</li>
                    <li>• Train team on data quality best practices</li>
                    <li>• Regular quality audits and assessments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};