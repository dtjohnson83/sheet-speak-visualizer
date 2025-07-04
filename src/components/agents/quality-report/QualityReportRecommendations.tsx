import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const QualityReportRecommendations = () => {
  return (
    <div className="space-y-6">
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
    </div>
  );
};