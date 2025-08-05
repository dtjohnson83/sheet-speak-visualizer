import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign, 
  Users, 
  BarChart3, 
  Lightbulb,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { BusinessGraphML } from '@/lib/graph/BusinessGraphML';
import { BusinessInsight } from '@/lib/graph/BusinessIntelligenceTranslator';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { useDomainContext } from '@/hooks/useDomainContext';
import { toast } from 'sonner';

interface BusinessGraphMLDashboardProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName?: string;
}

export const BusinessGraphMLDashboard: React.FC<BusinessGraphMLDashboardProps> = ({
  data,
  columns,
  fileName = 'dataset'
}) => {
  const [analyzer] = useState(() => new BusinessGraphML());
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedInsight, setSelectedInsight] = useState<BusinessInsight | null>(null);
  const [expandedRecommendations, setExpandedRecommendations] = useState<string[]>([]);
  
  const { domainContext, isContextCollected } = useDomainContext();

  const runBusinessAnalysis = async () => {
    if (data.length === 0) {
      toast.error('No data available for analysis');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
      }, 800);

      const datasetId = `dataset-${Date.now()}`;
      const businessInsights = await analyzer.analyzeForBusiness(data, columns, datasetId, domainContext || undefined);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setInsights(businessInsights);
      toast.success(`Business analysis complete! Generated ${businessInsights.length} actionable insights.`);
    } catch (error) {
      console.error('Business analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const getPriorityColor = (priority: BusinessInsight['businessImpact']['strategic']['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: BusinessInsight['businessImpact']['strategic']['priority']) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <BarChart3 className="h-4 w-4" />;
      case 'low': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getEffortColor = (effort: 'low' | 'medium' | 'high') => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRecommendation = (insightId: string) => {
    setExpandedRecommendations(prev =>
      prev.includes(insightId)
        ? prev.filter(id => id !== insightId)
        : [...prev, insightId]
    );
  };

  const calculateTotalImpact = () => {
    const financialImpacts = insights.map(insight => {
      const impact = insight.businessImpact.financial.potential;
      const numbers = impact.match(/\$?([\d,]+)/g);
      if (numbers) {
        const value = parseInt(numbers[0].replace(/[$,]/g, ''));
        return isNaN(value) ? 0 : value;
      }
      return 0;
    });
    
    return financialImpacts.reduce((sum, impact) => sum + impact, 0);
  };

  const getInsightSummaryStats = () => {
    const critical = insights.filter(i => i.businessImpact.strategic.priority === 'critical').length;
    const high = insights.filter(i => i.businessImpact.strategic.priority === 'high').length;
    const avgConfidence = insights.reduce((sum, i) => sum + i.businessImpact.financial.confidence, 0) / (insights.length || 1);
    const totalActions = insights.reduce((sum, i) => sum + i.actionableRecommendations.length, 0);
    
    return { critical, high, avgConfidence: Math.round(avgConfidence), totalActions };
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Upload data to start business intelligence analysis</p>
        </CardContent>
      </Card>
    );
  }

  const stats = getInsightSummaryStats();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Business Intelligence Dashboard</h2>
            <p className="text-muted-foreground mt-1">
              AI-powered business insights with strategic recommendations
              {domainContext && ` • ${domainContext.domain} Context`}
            </p>
          </div>
          <Button 
            onClick={runBusinessAnalysis} 
            disabled={isAnalyzing}
            size="lg"
            className="min-w-[200px]"
          >
            {isAnalyzing ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run Business Analysis
              </>
            )}
          </Button>
        </div>

        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing business intelligence...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <>
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Critical Issues</p>
                    <p className="text-2xl font-bold">{stats.critical}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">High Priority</p>
                    <p className="text-2xl font-bold">{stats.high}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Avg Confidence</p>
                    <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Total Impact</p>
                    <p className="text-2xl font-bold">${calculateTotalImpact().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Executive Overview</TabsTrigger>
              <TabsTrigger value="critical">Critical Actions</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Priority Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5" />
                      Top Priority Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights
                      .filter(insight => insight.businessImpact.strategic.priority === 'critical' || insight.businessImpact.strategic.priority === 'high')
                      .slice(0, 3)
                      .map((insight) => (
                        <div key={insight.id} className="border-l-4 border-primary pl-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{insight.businessTitle}</h4>
                            <Badge variant={getPriorityColor(insight.businessImpact.strategic.priority)}>
                              {insight.businessImpact.strategic.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {insight.executiveSummary}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {insight.businessImpact.financial.timeframe}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                {/* Financial Impact Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Financial Impact Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.slice(0, 4).map((insight) => (
                      <div key={insight.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{insight.businessTitle}</p>
                          <p className="text-xs text-muted-foreground">{insight.businessImpact.financial.potential}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {insight.businessImpact.financial.confidence}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="critical" className="space-y-4">
              {insights
                .filter(insight => insight.businessImpact.strategic.priority === 'critical')
                .map((insight) => (
                  <Card key={insight.id} className="border-red-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center text-red-700">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            {insight.businessTitle}
                          </CardTitle>
                          <p className="text-muted-foreground mt-2">{insight.executiveSummary}</p>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Financial Impact</h5>
                          <p className="text-sm text-muted-foreground">{insight.businessImpact.financial.potential}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Timeline</h5>
                          <p className="text-sm text-muted-foreground">{insight.businessImpact.financial.timeframe}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Confidence</h5>
                          <p className="text-sm text-muted-foreground">{insight.businessImpact.financial.confidence}%</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Immediate Actions Required</h5>
                        <div className="space-y-2">
                          {insight.actionableRecommendations.slice(0, 2).map((rec, idx) => (
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 mt-0.5 text-red-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{rec.action}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded ${getEffortColor(rec.effort)}`}>
                                    {rec.effort} effort
                                  </span>
                                  <span className="text-xs text-muted-foreground">{rec.timeline}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              {insights
                .filter(insight => insight.businessImpact.strategic.priority === 'high' || insight.businessImpact.strategic.priority === 'medium')
                .map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center">
                            {getPriorityIcon(insight.businessImpact.strategic.priority)}
                            <span className="ml-2">{insight.businessTitle}</span>
                          </CardTitle>
                          <p className="text-muted-foreground mt-2">{insight.executiveSummary}</p>
                        </div>
                        <Badge variant={getPriorityColor(insight.businessImpact.strategic.priority)}>
                          {insight.businessImpact.strategic.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Collapsible>
                        <CollapsibleTrigger 
                          className="flex items-center justify-between w-full p-2 hover:bg-muted rounded"
                          onClick={() => toggleRecommendation(insight.id)}
                        >
                          <span className="font-medium text-sm">View Action Plan ({insight.actionableRecommendations.length} actions)</span>
                          {expandedRecommendations.includes(insight.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-3 space-y-3">
                          {insight.actionableRecommendations.map((rec, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <h6 className="font-medium text-sm">{rec.action}</h6>
                                <span className={`text-xs px-2 py-1 rounded ${getEffortColor(rec.effort)}`}>
                                  {rec.effort}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.expectedOutcome}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Timeline: {rec.timeline}</span>
                                <span>KPI Impact: {rec.kpiImpact.join(', ')}</span>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {insights.map((insight) => (
                        <div
                          key={insight.id}
                          className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                            selectedInsight?.id === insight.id 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted border-border'
                          }`}
                          onClick={() => setSelectedInsight(insight)}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm truncate flex-1">{insight.businessTitle}</h4>
                            <Badge 
                              variant={getPriorityColor(insight.businessImpact.strategic.priority)}
                              className="ml-2 text-xs"
                            >
                              {insight.businessImpact.strategic.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {insight.executiveSummary}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  {selectedInsight ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          {getPriorityIcon(selectedInsight.businessImpact.strategic.priority)}
                          <span className="ml-2">{selectedInsight.businessTitle}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h5 className="font-medium mb-2">Executive Summary</h5>
                          <p className="text-muted-foreground">{selectedInsight.executiveSummary}</p>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Detailed Analysis</h5>
                          <p className="text-muted-foreground text-sm">{selectedInsight.detailedDescription}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">Business Impact</h5>
                            <div className="space-y-2 text-sm">
                              <div><strong>Financial:</strong> {selectedInsight.businessImpact.financial.potential}</div>
                              <div><strong>Operational:</strong> {selectedInsight.businessImpact.operational.efficiency}</div>
                              <div><strong>Strategic:</strong> {selectedInsight.businessImpact.strategic.alignment}</div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2">Stakeholders</h5>
                            <div className="flex flex-wrap gap-1">
                              {selectedInsight.stakeholders.map((stakeholder, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {stakeholder}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Action Plan</h5>
                          <div className="space-y-3">
                            {selectedInsight.actionableRecommendations.map((rec, idx) => (
                              <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h6 className="font-medium text-sm">{rec.action}</h6>
                                  <span className={`text-xs px-2 py-1 rounded ${getEffortColor(rec.effort)}`}>
                                    {rec.effort}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{rec.expectedOutcome}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Timeline: {rec.timeline}</span>
                                  <span>KPI Impact: {rec.kpiImpact.join(', ')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedInsight.risksAndMitigations.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Risk Assessment</h5>
                            <div className="space-y-2">
                              {selectedInsight.risksAndMitigations.map((risk, idx) => (
                                <div key={idx} className="border rounded-lg p-3 bg-yellow-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-yellow-800">{risk.risk}</p>
                                      <p className="text-sm text-yellow-700 mt-1">{risk.mitigation}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(risk.probability * 100)}% risk
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Select an Insight</h3>
                        <p className="text-muted-foreground">Click on an insight from the list to view detailed analysis</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};