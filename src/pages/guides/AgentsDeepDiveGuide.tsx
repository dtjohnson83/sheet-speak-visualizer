import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Shield, Bell, BarChart3, Clock, Settings, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgentsDeepDiveGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/guides">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guides
            </Button>
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Agents Deep Dive
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Master AI agents for automated data monitoring, quality checks, and intelligent insights
          </p>
        </div>

        <div className="space-y-8">
          {/* What are AI Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                What are AI Agents?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                AI Agents are autonomous assistants that continuously monitor your data, perform automated analysis, 
                and provide proactive insights without manual intervention. They work in the background to ensure 
                data quality and deliver timely business intelligence.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• 24/7 automated monitoring</li>
                    <li>• Proactive issue detection</li>
                    <li>• Consistent data quality checks</li>
                    <li>• Reduced manual oversight</li>
                    <li>• Scalable analysis workflows</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Core Capabilities
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Data quality assessment</li>
                    <li>• Anomaly detection</li>
                    <li>• Trend analysis</li>
                    <li>• Automated reporting</li>
                    <li>• Alert generation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Agent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                Data Quality Agent
                <Badge variant="secondary">Most Popular</Badge>
              </CardTitle>
              <CardDescription>
                Continuously monitors your datasets for quality issues and data integrity problems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Quality Checks
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <span className="text-sm">Completeness</span>
                      <Badge variant="outline">95%+ target</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <span className="text-sm">Consistency</span>
                      <Badge variant="outline">90%+ target</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <span className="text-sm">Accuracy</span>
                      <Badge variant="outline">95%+ target</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <span className="text-sm">Uniqueness</span>
                      <Badge variant="outline">98%+ target</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Advanced Checks
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Anomaly Detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Data Freshness Validation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Schema Conformity
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Business Rule Validation
                    </li>
                  </ul>
                </div>
              </div>

              {/* Configuration Options */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configuration Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Frequency</span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Hourly</li>
                      <li>• Daily (default)</li>
                      <li>• Weekly</li>
                      <li>• Custom schedule</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Thresholds</span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Quality score limits</li>
                      <li>• Error rate thresholds</li>
                      <li>• Missing data limits</li>
                      <li>• Anomaly sensitivity</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Notifications</span>
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• In-app alerts</li>
                      <li>• Email notifications</li>
                      <li>• Webhook integrations</li>
                      <li>• Slack/Teams</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setting Up Your First Agent */}
          <Card>
            <CardHeader>
              <CardTitle>Setting Up Your First Agent</CardTitle>
              <CardDescription>
                Step-by-step guide to creating and configuring a Data Quality Agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Upload Your Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Start by uploading a dataset to the main application. Agents work with existing data.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Navigate to Agents Tab</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      In the main application, find the "Agents" tab in the sidebar navigation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Create Data Quality Agent</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Click "Create Agent" button and the system will automatically configure a Data Quality Agent for your dataset.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Configure Settings</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Adjust frequency, thresholds, and notification preferences in the agent configuration panel.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Monitor Results</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      View quality reports, trends, and alerts in the agent dashboard. The agent will begin monitoring immediately.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Best Practices for AI Agents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">✓ Do's</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Start with conservative thresholds</li>
                    <li>• Monitor agent performance regularly</li>
                    <li>• Set up meaningful alert notifications</li>
                    <li>• Review quality reports weekly</li>
                    <li>• Adjust settings based on data patterns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">✗ Don'ts</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Don't set overly strict thresholds initially</li>
                    <li>• Don't ignore agent recommendations</li>
                    <li>• Don't run too many agents on small datasets</li>
                    <li>• Don't disable alerts without review</li>
                    <li>• Don't forget to update configurations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
                  <h4 className="font-semibold mb-1">Agent Not Creating</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    If the "Create Agent" button doesn't work or shows errors:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Ensure you have uploaded data first</li>
                    <li>• Check your internet connection</li>
                    <li>• Try refreshing the page</li>
                    <li>• Verify you have sufficient usage credits</li>
                  </ul>
                </div>
                
                <div className="p-4 border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-semibold mb-1">Too Many False Alerts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    If you're receiving too many alerts:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Increase quality thresholds gradually</li>
                    <li>• Adjust anomaly sensitivity settings</li>
                    <li>• Review data patterns for normal variations</li>
                    <li>• Consider longer cooldown periods</li>
                  </ul>
                </div>
                
                <div className="p-4 border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-semibold mb-1">Missing Important Issues</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    If the agent isn't catching data problems:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Lower quality thresholds temporarily</li>
                    <li>• Enable all advanced checks</li>
                    <li>• Increase monitoring frequency</li>
                    <li>• Review and update business rules</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Create Your First Agent?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/">
                  <Button className="w-full">
                    Go to Application
                  </Button>
                </Link>
                <Link to="/guides/ai-features">
                  <Button variant="outline" className="w-full">
                    AI Features Guide
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentsDeepDiveGuide;