import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Target, 
  Download,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Sparkles,
  Send
} from 'lucide-react';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { QuestionProcessor, QuestionAnalysis } from '@/lib/visualization/QuestionProcessor';
import { VisualizationEngine, ProcessedVisualization } from '@/lib/visualization/VisualizationEngine';
import { SimpleGraphInsight } from '@/lib/analytics/SimpleGraphAnalyzer';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface QuestionBasedAnalyticsProps {
  data: DataRow[];
  columns: ColumnInfo[];
  datasetName: string;
}

interface AnalyticsSession {
  id: string;
  question: string;
  analysis: QuestionAnalysis;
  visualization: ProcessedVisualization;
  graphInsights?: SimpleGraphInsight[];
  timestamp: Date;
}

export const QuestionBasedAnalytics: React.FC<QuestionBasedAnalyticsProps> = ({
  data,
  columns,
  datasetName
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  const [activeSession, setActiveSession] = useState<AnalyticsSession | null>(null);
  const [questionProcessor] = useState(new QuestionProcessor());
  const [visualizationEngine] = useState(new VisualizationEngine());
  const isMobile = useIsMobile();

  // Validate data availability
  const hasValidData = data && data.length > 0 && columns && columns.length > 0;

  // Sample questions based on data characteristics
  const getSampleQuestions = (): string[] => {
    const numericColumns = columns.filter(col => col.type === 'numeric');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    
    const questions: string[] = [
      'What are the main trends in our data?',
      'Show me the top performing categories',
      'What patterns can you identify?',
      'Are there any anomalies or outliers?',
      'How are different segments performing?'
    ];

    if (numericColumns.length > 0) {
      questions.push(`What is the distribution of ${numericColumns[0].name}?`);
      questions.push(`Show me the trend of ${numericColumns[0].name} over time`);
    }

    if (categoricalColumns.length > 0) {
      questions.push(`Compare performance by ${categoricalColumns[0].name}`);
      questions.push(`What is the breakdown of ${categoricalColumns[0].name}?`);
      questions.push(`How are different ${categoricalColumns[0].name} connected?`);
    }

    // Add relationship and pattern questions
    questions.push('What groups or clusters exist in my data?');
    questions.push('Are there any unusual patterns or outliers?');
    questions.push('What connections can you find in the data?');

    if (numericColumns.length >= 2) {
      questions.push(`Is there a correlation between ${numericColumns[0].name} and ${numericColumns[1].name}?`);
    }

    return questions;
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!hasValidData) {
      toast.error('No data available for analysis. Please load a dataset first.');
      return;
    }

    setLoading(true);
    try {
      // Analyze the question
      const analysis = await questionProcessor.analyzeQuestion(question, data, columns);
      
      // Generate visualization specification
      const spec = questionProcessor.generateVisualizationSpec(analysis, data, columns);
      
      // Create the visualization
      const visualization = await visualizationEngine.generateVisualization(analysis, spec, data, columns);
      
      // Add automated insights
      const additionalInsights = visualizationEngine.generateAutomatedInsights(visualization);
      visualization.metadata.insights.push(...additionalInsights);
      
      // Generate graph insights for relationship questions
      const graphInsights = visualizationEngine.generateGraphInsights(data, columns, question);

      // Create session
      const session: AnalyticsSession = {
        id: `session-${Date.now()}`,
        question: question.trim(),
        analysis,
        visualization,
        graphInsights: graphInsights.length > 0 ? graphInsights : undefined,
        timestamp: new Date()
      };

      setSessions(prev => [session, ...prev]);
      setActiveSession(session);
      setQuestion('');
      
      toast.success('Analysis complete! Check out your insights.');
    } catch (error) {
      console.error('Question analysis failed:', error);
      toast.error('Failed to analyze question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuestionClick = (sampleQuestion: string) => {
    setQuestion(sampleQuestion);
  };

  const renderChart = (visualization: ProcessedVisualization) => {
    if (!visualization.chartData) return null;

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: !isMobile,
      plugins: {
        legend: {
          position: isMobile ? 'bottom' as const : 'top' as const,
          labels: {
            boxWidth: isMobile ? 12 : 16,
            padding: isMobile ? 10 : 20,
            font: {
              size: isMobile ? 10 : 12
            }
          }
        },
        title: {
          display: true,
          text: visualization.title,
          font: {
            size: isMobile ? 12 : 16
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          titleFont: {
            size: isMobile ? 10 : 12
          },
          bodyFont: {
            size: isMobile ? 9 : 11
          }
        }
      },
      scales: visualization.type === 'pie_chart' ? {} : {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: isMobile ? 9 : 11
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: isMobile ? 9 : 11
            },
            maxRotation: isMobile ? 45 : 0
          }
        }
      },
    };

    switch (visualization.type) {
      case 'line_chart':
      case 'area_chart':
        return <Line data={visualization.chartData} options={chartOptions} />;
      case 'bar_chart':
        return <Bar data={visualization.chartData} options={chartOptions} />;
      case 'pie_chart':
        return <Pie data={visualization.chartData} options={chartOptions} />;
      case 'scatter_plot':
        return <Scatter data={visualization.chartData} options={chartOptions} />;
      default:
        return <Bar data={visualization.chartData} options={chartOptions} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getIntentIcon = (intent: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'trend_analysis': <TrendingUp className="h-4 w-4" />,
      'comparison': <BarChart3 className="h-4 w-4" />,
      'performance_metrics': <Target className="h-4 w-4" />,
      'risk_assessment': <AlertTriangle className="h-4 w-4" />,
      'anomaly_detection': <AlertTriangle className="h-4 w-4" />
    };
    return iconMap[intent] || <Brain className="h-4 w-4" />;
  };

  // Show message if no data available
  if (!hasValidData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            Please load a dataset first to use the Question-Based Analytics feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Question Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <MessageSquare className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            Ask a Question About Your Data
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Get instant visualizations and insights by asking business questions in natural language
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <Textarea
              placeholder="e.g., What are our top performing products? Show me customer trends over time..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={`${isMobile ? 'min-h-[60px]' : 'min-h-[80px]'} resize-none ${isMobile ? 'text-sm' : ''}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuestionSubmit();
                }
              }}
            />
            <Button 
              onClick={handleQuestionSubmit} 
              disabled={loading || !question.trim() || !hasValidData}
              className={`${isMobile ? 'w-full' : 'px-6'} ${isMobile ? 'min-h-[44px]' : ''}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 animate-spin" />
                  {isMobile ? 'Analyzing...' : 'Analyzing...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {isMobile ? 'Analyze' : 'Analyze'}
                </div>
              )}
            </Button>
          </div>

          {/* Sample Questions */}
          <div>
            <p className="text-sm font-medium mb-2">Try these sample questions:</p>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {getSampleQuestions().slice(0, isMobile ? 4 : 6).map((sampleQuestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleQuestionClick(sampleQuestion)}
                  className={`${isMobile ? 'text-xs p-2 h-auto text-left justify-start' : 'text-xs'}`}
                >
                  {sampleQuestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Analysis Result */}
      {activeSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getIntentIcon(activeSession.analysis.intent)}
                {activeSession.visualization.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(activeSession.visualization.businessImpact.priority)}>
                  {activeSession.visualization.businessImpact.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {Math.round(activeSession.analysis.confidence * 100)}% Confidence
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Q: "{activeSession.question}"
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visualization" className="space-y-4">
              <TabsList className={`${activeSession.graphInsights && activeSession.graphInsights.length > 0 ? 'grid-cols-5' : 'grid-cols-4'} grid w-full`}>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="impact">Business Impact</TabsTrigger>
                {activeSession.graphInsights && activeSession.graphInsights.length > 0 && (
                  <TabsTrigger value="graph-insights">Patterns & Groups</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="visualization" className="space-y-4">
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} ${isMobile ? 'gap-4' : 'gap-6'}`}>
                  {/* Chart */}
                  <div className={`${isMobile ? 'order-2' : 'lg:col-span-2'}`}>
                    <div className={`${isMobile ? 'p-2' : 'p-4'} border rounded-lg bg-card`}>
                      <div className={`${isMobile ? 'h-64' : 'h-80'}`}>
                        {renderChart(activeSession.visualization)}
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className={`space-y-4 ${isMobile ? 'order-1' : ''}`}>
                    <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Key Metrics</h4>
                    <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      {Object.entries(activeSession.visualization.metadata.keyMetrics).map(([key, value]) => {
                        // Skip the analyzedColumn metadata
                        if (key === 'analyzedColumn') return null;
                        
                        return (
                          <div key={key} className={`${isMobile ? 'p-2' : 'p-3'} border rounded-lg text-center`}>
                            <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                              {typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                            <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                              {key}
                            </p>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid gap-4">
                  {activeSession.visualization.metadata.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                      <Lightbulb className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid gap-4">
                  {activeSession.visualization.metadata.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="impact" className={`space-y-4 ${isMobile ? '' : 'space-y-6'}`}>
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                  <Card>
                    <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                      <DollarSign className={`mx-auto mb-2 text-green-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Financial Impact</p>
                      <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{activeSession.visualization.businessImpact.financialImpact}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                      <Clock className={`mx-auto mb-2 text-blue-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Timeframe</p>
                      <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{activeSession.visualization.businessImpact.timeframe}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                      <AlertTriangle className={`mx-auto mb-2 text-warning ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Priority</p>
                      <p className={`font-medium capitalize ${isMobile ? 'text-sm' : ''}`}>{activeSession.visualization.businessImpact.priority}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className={`${isMobile ? 'p-3' : 'p-4'} text-center`}>
                      <Users className={`mx-auto mb-2 text-purple-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                      <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Data Points</p>
                      <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{activeSession.visualization.metadata.totalDataPoints}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className={`font-medium mb-3 ${isMobile ? 'text-sm' : ''}`}>Key Stakeholders</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeSession.visualization.businessImpact.stakeholders.map((stakeholder, index) => (
                      <Badge key={index} variant="secondary" className={`${isMobile ? 'text-xs' : ''}`}>
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className={`${isMobile ? 'p-3' : 'p-4'} bg-muted/50 rounded-lg`}>
                  <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm' : ''}`}>Business Context</h4>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{activeSession.analysis.businessContext}</p>
                </div>
              </TabsContent>

              {activeSession.graphInsights && activeSession.graphInsights.length > 0 && (
                <TabsContent value="graph-insights" className="space-y-4">
                  <div className="space-y-4">
                    {activeSession.graphInsights.map((insight, index) => (
                       <div key={index} className="p-4 border rounded-lg bg-card">
                         <div className="flex items-start gap-3 mb-3">
                           <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                             {insight.type === 'connections' && <Users className="h-4 w-4 text-blue-500" />}
                             {insight.type === 'patterns' && <TrendingUp className="h-4 w-4 text-green-500" />}
                             {insight.type === 'groups' && <BarChart3 className="h-4 w-4 text-purple-500" />}
                             {insight.type === 'outliers' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center justify-between mb-2">
                               <h4 className="font-medium text-foreground">{insight.question}</h4>
                               <Badge variant="secondary">
                                 {Math.round(insight.confidence * 100)}% confidence
                               </Badge>
                             </div>
                             <p className="text-sm text-foreground mb-3">{insight.answer}</p>
                             
                             {insight.details.length > 0 && (
                               <div className="space-y-1 mb-3">
                                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Details:</p>
                                 {insight.details.map((detail, detailIndex) => (
                                   <div key={detailIndex} className="text-xs p-2 bg-muted/30 rounded flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                     {detail}
                                   </div>
                                 ))}
                               </div>
                             )}
                             
                             <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                               <div className="flex items-start gap-2">
                                 <span className="text-lg">💡</span>
                                 <div>
                                   <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">What you can do:</p>
                                   <p className="text-sm text-blue-600 dark:text-blue-400">{insight.actionable}</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Previous Sessions */}
      {sessions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Previous Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(1, 6).map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setActiveSession(session)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{session.question}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.analysis.intent.replace('_', ' ')} • {session.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(session.visualization.businessImpact.priority)} className="text-xs">
                      {session.visualization.businessImpact.priority}
                    </Badge>
                    {getIntentIcon(session.analysis.intent)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      {sessions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Intelligent Data Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Ask questions about your data in natural language and get instant visualizations with business insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-3 border rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-sm">Trend Analysis</h4>
                <p className="text-xs text-muted-foreground">Identify patterns and trends over time</p>
              </div>
              <div className="p-3 border rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium text-sm">Performance Comparison</h4>
                <p className="text-xs text-muted-foreground">Compare different segments and categories</p>
              </div>
              <div className="p-3 border rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning mb-2" />
                <h4 className="font-medium text-sm">Risk Assessment</h4>
                <p className="text-xs text-muted-foreground">Detect anomalies and assess risks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};