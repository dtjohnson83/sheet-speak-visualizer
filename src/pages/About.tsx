import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Brain, Zap, Shield, Upload, BarChart3, Layout, Users, TrendingUp, AlertTriangle, Bot } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <LandingHeader />
      
      <main className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Chartuvo</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Chartuvo is an AI-powered data analysis and visualization platform that brings Forward Thinking Intelligence to your business decisions. 
              We combine advanced machine learning, predictive analytics, and automated monitoring to transform raw data into actionable insights.
            </p>
          </div>

          {/* What is Chartuvo */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">What is Chartuvo?</h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Chartuvo is a comprehensive business intelligence platform that leverages artificial intelligence to provide Forward Thinking Intelligence. 
                Our platform connects to multiple data sources, performs advanced analysis, and delivers predictive insights through interactive dashboards and AI-powered reporting.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Unlike traditional data visualization tools, Chartuvo proactively monitors data quality, predicts future trends, and provides automated insights 
                through AI agents that work continuously to ensure your data remains accurate and actionable.
              </p>
            </div>
          </section>

          {/* Core Capabilities */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Core Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <Brain className="w-12 h-12 text-indigo-500 mb-4" />
                  <CardTitle className="text-xl">AI-Powered Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Interactive AI chat with your data, comprehensive expert reports from multiple AI personas, 
                    and business context integration for domain-specific analysis and insights.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <Zap className="w-12 h-12 text-purple-600 mb-4" />
                  <CardTitle className="text-xl">Predictive Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Machine learning-powered forecasting, trend prediction, and scenario modeling. 
                    Generate business insights with confidence intervals and statistical validation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <Shield className="w-12 h-12 text-red-500 mb-4" />
                  <CardTitle className="text-xl">Data Quality Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Automated data quality checks with anomaly detection, completeness validation, 
                    and real-time monitoring with intelligent alerts and recommendations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <Upload className="w-12 h-12 text-blue-500 mb-4" />
                  <CardTitle className="text-xl">Multi-Source Connectivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connect to Excel, CSV, JSON, databases, Google Sheets, and more. 
                    Automatic data structure detection and seamless integration across platforms.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-green-500 mb-4" />
                  <CardTitle className="text-xl">Rich Visualizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Interactive charts including bar, line, pie, scatter, heatmaps, treemaps, and histograms. 
                    Customizable styling and real-time data updates.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <Layout className="w-12 h-12 text-cyan-500 mb-4" />
                  <CardTitle className="text-xl">Interactive Dashboards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Drag-and-drop dashboard builder with real-time filtering capabilities. 
                    Present AI-driven insights through customizable, responsive layouts.
                  </p>
                </CardContent>
              </Card>

            </div>
          </section>

          {/* AI Agents & Automation */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">AI Agents & Automation</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <Bot className="w-12 h-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">Intelligent AI Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Deploy autonomous AI agents that continuously monitor your data, detect anomalies, 
                    and generate insights. Our agents work 24/7 to ensure data quality and identify opportunities.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Data Quality Monitoring Agents</li>
                    <li>• Predictive Analytics Agents</li>
                    <li>• Anomaly Detection Agents</li>
                    <li>• Automated Report Generation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                  <CardTitle className="text-xl">Smart Alerting System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Receive intelligent notifications when important changes occur in your data. 
                    Configurable alert thresholds and multiple notification channels ensure you never miss critical insights.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Email and webhook notifications</li>
                    <li>• Customizable severity levels</li>
                    <li>• Cooldown periods to prevent spam</li>
                    <li>• Contextual recommendations</li>
                  </ul>
                </CardContent>
              </Card>

            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Who Uses Chartuvo?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardHeader>
                  <Users className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
                  <CardTitle className="text-xl">Business Analysts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Generate comprehensive reports, identify trends, and provide data-driven recommendations 
                    with AI-powered insights and automated analysis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardHeader>
                  <TrendingUp className="w-12 h-12 text-green-500 mb-4 mx-auto" />
                  <CardTitle className="text-xl">Decision Makers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Make informed strategic decisions with predictive analytics, scenario modeling, 
                    and real-time monitoring of key business metrics.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center">
                <CardHeader>
                  <Shield className="w-12 h-12 text-purple-500 mb-4 mx-auto" />
                  <CardTitle className="text-xl">Data Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ensure data quality, automate monitoring processes, and scale analytics capabilities 
                    with intelligent agents and automated workflows.
                  </p>
                </CardContent>
              </Card>

            </div>
          </section>

          {/* Technology Stack */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Technology & Features</h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI & Machine Learning</h3>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Advanced natural language processing for data chat</li>
                    <li>• Predictive modeling and forecasting algorithms</li>
                    <li>• Anomaly detection and pattern recognition</li>
                    <li>• Automated insight generation and recommendations</li>
                    <li>• Multi-persona AI expert report generation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Processing</h3>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Real-time data ingestion and processing</li>
                    <li>• Multi-format data source connectivity</li>
                    <li>• Automated data quality validation</li>
                    <li>• Scalable data transformation pipelines</li>
                    <li>• Secure data handling and privacy protection</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">Ready to Experience Forward Thinking Intelligence?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join thousands of professionals who trust Chartuvo for their data analysis and business intelligence needs. 
                Start your journey with AI-powered insights today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default About;