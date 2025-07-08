import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BarChart3,
  Target,
  Info
} from 'lucide-react';

export const DataQualityGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Data Quality Assessment Guide</h1>
        <p className="text-xl text-muted-foreground">
          Understand and improve your data quality with automated assessment and recommendations
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Understanding Data Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Data quality is assessed across four key dimensions that determine how reliable and useful 
            your data is for analysis and decision-making.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">Completeness (85%)</h4>
                <Progress value={85} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Measures the percentage of non-missing values in your dataset
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">Validity (92%)</h4>
                <Progress value={92} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Checks if data values conform to expected formats and types
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">Consistency (78%)</h4>
                <Progress value={78} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Evaluates internal logical consistency and standardization
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-600">Accuracy (88%)</h4>
                <Progress value={88} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Identifies outliers and potential data entry errors
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Common Quality Issues & Solutions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Low Completeness Issues</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Column 'phone_number' has 35% missing values</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Solutions:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Implement data collection improvements at the source</li>
                      <li>• Use statistical imputation for numeric fields</li>
                      <li>• Consider if the field is truly required for analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Validity Problems</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Date column contains inconsistent formats</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Solutions:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Standardize date format to ISO 8601 (YYYY-MM-DD)</li>
                      <li>• Implement data validation at input points</li>
                      <li>• Use automated parsing with error handling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Consistency Issues</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Category values have inconsistent capitalization</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Examples: "Electronics", "electronics", "ELECTRONICS"</p>
                    <p className="text-xs text-muted-foreground">Solutions:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Implement controlled vocabularies</li>
                      <li>• Use data normalization rules</li>
                      <li>• Create lookup tables for categorical values</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Accuracy Concerns</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sales column contains 12 potential outliers</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Solutions:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Investigate outliers for data entry errors</li>
                      <li>• Implement business logic validation</li>
                      <li>• Consider outlier treatment methods (cap, remove, or flag)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Data Quality Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Prevention Strategies</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Implement data validation at source systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Use standardized data entry forms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Create data quality monitoring alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Establish data governance policies</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Remediation Techniques</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span>Statistical imputation for missing values</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span>Data standardization and normalization</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span>Outlier detection and treatment</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span>Regular quality monitoring and reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Improvement Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quality Improvement Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">1</div>
              <div>
                <h5 className="font-semibold">Assess Current State</h5>
                <p className="text-sm text-muted-foreground">
                  Review the automatically generated quality profile to understand current data health
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">2</div>
              <div>
                <h5 className="font-semibold">Prioritize Issues</h5>
                <p className="text-sm text-muted-foreground">
                  Focus on critical and high-severity issues that impact analysis accuracy
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">3</div>
              <div>
                <h5 className="font-semibold">Implement Solutions</h5>
                <p className="text-sm text-muted-foreground">
                  Apply the recommended fixes and data cleaning techniques
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">4</div>
              <div>
                <h5 className="font-semibold">Monitor Progress</h5>
                <p className="text-sm text-muted-foreground">
                  Track quality improvements over time and establish ongoing monitoring
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Help */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Need Help with Data Quality?</AlertTitle>
        <AlertDescription>
          Use the AI Chat feature to ask specific questions about your data quality issues. 
          The AI can provide personalized recommendations based on your actual data characteristics.
        </AlertDescription>
      </Alert>
    </div>
  );
};