import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Database, RefreshCw, CheckCircle, FileText, Clock } from 'lucide-react';
import { DataQualityScore } from './types';
import { getScoreColor, getScoreBgColor } from './utils';

interface QualityScoreCardProps {
  qualityScore: DataQualityScore | null;
  isAnalyzing: boolean;
  lastAnalysis: Date | null;
  onRefresh: () => void;
}

export const QualityScoreCard = ({ 
  qualityScore, 
  isAnalyzing, 
  lastAnalysis, 
  onRefresh 
}: QualityScoreCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Quality Score
            </CardTitle>
            <CardDescription>
              Overall assessment of your data quality
            </CardDescription>
          </div>
          <Button 
            onClick={onRefresh} 
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {qualityScore ? (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className={`p-4 rounded-lg border ${getScoreBgColor(qualityScore.overall)}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Overall Quality Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(qualityScore.overall)}`}>
                  {qualityScore.overall.toFixed(1)}%
                </span>
              </div>
              <Progress value={qualityScore.overall} className="h-2" />
            </div>
            
            {/* Detailed Scores */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'completeness', label: 'Completeness', icon: <Database className="h-4 w-4" /> },
                { key: 'consistency', label: 'Consistency', icon: <CheckCircle className="h-4 w-4" /> },
                { key: 'accuracy', label: 'Accuracy', icon: <CheckCircle className="h-4 w-4" /> },
                { key: 'uniqueness', label: 'Uniqueness', icon: <FileText className="h-4 w-4" /> },
                { key: 'timeliness', label: 'Timeliness', icon: <Clock className="h-4 w-4" /> }
              ].map(({ key, label, icon }) => (
                <div key={key} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(qualityScore[key as keyof DataQualityScore])}`}>
                    {qualityScore[key as keyof DataQualityScore].toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Analyzing data quality...</span>
          </div>
        )}
        
        {lastAnalysis && (
          <div className="text-sm text-muted-foreground mt-4">
            Last analyzed: {lastAnalysis.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};