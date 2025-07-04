import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Database, BarChart3, Brain, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const DataFlowGuide = () => {
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
            Data Flow Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Understand how your data moves through Chartuvo from upload to insights
          </p>
        </div>

        <div className="space-y-8">
          {/* Visual Flow Diagram */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Data Journey</CardTitle>
              <CardDescription>
                Follow your data's path through the Chartuvo system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <span className="text-sm font-medium">Upload</span>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Database className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                    <span className="text-sm font-medium">Process</span>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                    <span className="text-sm font-medium">Visualize</span>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Brain className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                    <span className="text-sm font-medium">AI Insights</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Data Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Step 1: Data Upload & Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Supported Formats</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Excel files (.xlsx, .xls)</li>
                    <li>• CSV files</li>
                    <li>• Multiple worksheets</li>
                    <li>• Large datasets (up to millions of rows)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What Happens</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• File validation and security scanning</li>
                    <li>• Automatic data type detection</li>
                    <li>• Column structure analysis</li>
                    <li>• Sample data preview generation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Data Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                Step 2: Data Processing & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Automatic Processing</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Data quality assessment</li>
                    <li>• Missing value detection</li>
                    <li>• Statistical summary generation</li>
                    <li>• Relationship detection between columns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI Enhancement</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Business context interpretation</li>
                    <li>• Column meaning identification</li>
                    <li>• Pattern recognition</li>
                    <li>• Anomaly detection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Step 3: Chart Creation & Dashboards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Chart Generation</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Smart chart type recommendations</li>
                    <li>• Interactive configuration</li>
                    <li>• Real-time preview updates</li>
                    <li>• Multi-series support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dashboard Building</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Drag-and-drop tile arrangement</li>
                    <li>• Responsive layout system</li>
                    <li>• Cross-chart filtering</li>
                    <li>• Export capabilities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Step 4: AI-Powered Insights & Agents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">AI Chat & Analysis</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Natural language queries</li>
                    <li>• Contextual data understanding</li>
                    <li>• Business perspective analysis</li>
                    <li>• Automated report generation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Intelligent Agents</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Continuous data quality monitoring</li>
                    <li>• Automated anomaly detection</li>
                    <li>• Scheduled analysis tasks</li>
                    <li>• Proactive alert notifications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-600 dark:text-red-400" />
                Data Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Security Measures</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• End-to-end encryption</li>
                    <li>• Secure file upload protocols</li>
                    <li>• User access controls</li>
                    <li>• Regular security audits</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Data Handling</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Isolated user environments</li>
                    <li>• Automatic data cleanup</li>
                    <li>• GDPR compliance</li>
                    <li>• Data residency options</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Ready to Get Started?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/guides/quick-start">
                  <Button variant="outline" className="w-full">
                    Quick Start Guide
                  </Button>
                </Link>
                <Link to="/guides/ai-features">
                  <Button variant="outline" className="w-full">
                    AI Features Guide
                  </Button>
                </Link>
                <Link to="/guides/agents-deep-dive">
                  <Button variant="outline" className="w-full">
                    Agents Deep Dive
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

export default DataFlowGuide;