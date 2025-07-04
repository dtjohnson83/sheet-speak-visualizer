import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface QualityTrend {
  date: string;
  score: number;
  issues: number;
}

interface QualityTrendsTabProps {
  qualityTrends: QualityTrend[];
}

export const QualityTrendsTab = ({ qualityTrends }: QualityTrendsTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quality Trends
          </CardTitle>
          <CardDescription>
            Historical data quality metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {qualityTrends.length > 0 ? (
            <div className="space-y-4">
              {qualityTrends.map((trend, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{new Date(trend.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">{trend.issues} issues found</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{trend.score.toFixed(1)}%</div>
                    <Badge variant={trend.score >= 90 ? 'default' : trend.score >= 70 ? 'secondary' : 'destructive'}>
                      {trend.score >= 90 ? 'Excellent' : trend.score >= 70 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No historical data available. Run quality checks to build trends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};