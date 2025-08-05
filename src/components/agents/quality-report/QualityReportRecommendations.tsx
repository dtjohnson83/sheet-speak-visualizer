import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, DollarSign, Clock, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateSmartRecommendations, EnhancedRecommendation } from '@/lib/ml/recommendationEngine';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface QualityReportRecommendationsProps {
  data: DataRow[];
  columns: ColumnInfo[];
  issues: any[];
  insights: any[];
  fileName: string;
  businessContext?: {
    industry?: string;
    companySize?: string;
    revenue?: number;
    objectives?: string[];
    timeframe?: string;
  };
}

export const QualityReportRecommendations: React.FC<QualityReportRecommendationsProps> = ({
  data,
  columns,
  issues,
  insights,
  fileName,
  businessContext
}) => {
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        const enhancedRecs = await generateSmartRecommendations(
          data,
          columns,
          issues,
          insights,
          businessContext
        );
        setRecommendations(enhancedRecs);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [data, columns, issues, insights, businessContext]);

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generating Enhanced Business Recommendations</CardTitle>
            <CardDescription>
              Analyzing your data with AI to provide contextualized business insights...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">Processing business context and generating recommendations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>AI-Enhanced Business Recommendations</span>
          </CardTitle>
          <CardDescription>
            Contextualized recommendations with financial impact, timelines, and implementation roadmaps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No specific recommendations generated for this dataset.</p>
              <p className="text-sm mt-2">This typically indicates good data quality or insufficient data for analysis.</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <Badge variant={getPriorityColor(rec.priority.level)}>
                          {rec.priority.level.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {rec.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCard(rec.id)}
                      className="ml-4"
                    >
                      {expandedCards.has(rec.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Financial Impact</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(rec.financialImpact.range.min)} - {formatCurrency(rec.financialImpact.range.max)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Timeline</p>
                        <p className="text-xs text-muted-foreground">{rec.timeframe.weeks} weeks</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Success Rate</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(rec.dataPoints.successProbability * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Priority Score</p>
                        <p className="text-xs text-muted-foreground">{rec.priority.score}/100</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedCards.has(rec.id) && (
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {/* Financial Impact Details */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          Financial Impact Analysis
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-sm mb-2">{rec.financialImpact.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Expected Range:</span>
                              <p>{formatCurrency(rec.financialImpact.range.min)} - {formatCurrency(rec.financialImpact.range.max)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Confidence Level:</span>
                              <p>{Math.round(rec.financialImpact.confidence * 100)}%</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Basis:</strong> {rec.financialImpact.basis}
                          </p>
                        </div>
                      </div>

                      {/* Timeline & Implementation */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-600" />
                          Implementation Timeline
                        </h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-sm mb-3">{rec.timeframe.description}</p>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium">Implementation Phases:</span>
                              <ul className="text-sm mt-1 space-y-1">
                                {rec.timeframe.phases.map((phase, index) => (
                                  <li key={index} className="flex items-center">
                                    <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs mr-2">
                                      {index + 1}
                                    </span>
                                    {phase}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {rec.timeframe.dependencies.length > 0 && (
                              <div className="mt-3">
                                <span className="text-sm font-medium">Dependencies:</span>
                                <ul className="text-sm mt-1 text-muted-foreground">
                                  {rec.timeframe.dependencies.map((dep, index) => (
                                    <li key={index}>• {dep}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Priority & Data Points */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                            Priority Assessment
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Priority Score:</span>
                              <span className="font-medium">{rec.priority.score}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Strategic Alignment:</span>
                              <span className="font-medium">{rec.priority.strategicAlignment}%</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Urgency:</strong> {rec.priority.urgency}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-purple-600" />
                            Data Analysis
                          </h4>
                          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Affected Records:</span>
                              <span className="font-medium">{rec.dataPoints.affected.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Analysis Confidence:</span>
                              <span className="font-medium">{Math.round(rec.dataPoints.confidence * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Success Probability:</span>
                              <span className="font-medium">{Math.round(rec.dataPoints.successProbability * 100)}%</span>
                            </div>
                            <div className="mt-2">
                              <span className="text-sm font-medium">Key Metrics:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rec.dataPoints.keyMetrics.map((metric, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {metric}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Implementation Details */}
                      <div>
                        <h4 className="font-semibold mb-2">Implementation Roadmap</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Action Steps</h5>
                            <ul className="text-sm space-y-1">
                              {rec.implementation.steps.map((step, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-muted/30 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Required Resources</h5>
                            <ul className="text-sm space-y-1">
                              {rec.implementation.resources.map((resource, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-600 mr-2">•</span>
                                  {resource}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-muted/30 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Potential Risks</h5>
                            <ul className="text-sm space-y-1">
                              {rec.implementation.risks.map((risk, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-orange-600 mr-2">•</span>
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};