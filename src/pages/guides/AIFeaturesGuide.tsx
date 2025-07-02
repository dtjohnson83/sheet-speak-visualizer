import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Bot, Brain, FileText, Lightbulb } from 'lucide-react';

const AIFeaturesGuide = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Data Chat",
      description: "Have natural conversations with your data to get instant insights.",
      capabilities: [
        "Ask questions in plain English about your data",
        "Get statistical summaries and data explanations",
        "Discover patterns and trends automatically",
        "Receive chart and visualization recommendations"
      ]
    },
    {
      icon: Brain,
      title: "Business Context",
      description: "Provide context about your business to get more relevant insights.",
      capabilities: [
        "Define your business goals and KPIs",
        "Explain what your data represents",
        "Set up custom metrics and calculations",
        "Get industry-specific recommendations"
      ]
    },
    {
      icon: Bot,
      title: "AI Agents",
      description: "Create specialized AI agents to monitor and analyze your data continuously.",
      capabilities: [
        "Set up automated data monitoring",
        "Create custom analysis workflows",
        "Schedule regular insight generation",
        "Get alerts when patterns change"
      ]
    },
    {
      icon: FileText,
      title: "AI Summary Reports",
      description: "Generate comprehensive reports that summarize your data insights.",
      capabilities: [
        "Automatically generate data summaries",
        "Identify key trends and outliers",
        "Create executive-ready reports",
        "Export insights in multiple formats"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/guides">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guides
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Features Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Unlock the power of AI to get deeper insights from your data
          </p>
        </div>

        <div className="space-y-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {feature.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {feature.capabilities.map((capability, capIndex) => (
                    <div key={capIndex} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{capability}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 space-y-6">
          <Card className="border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Tips for Better AI Interactions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Be Specific</h4>
                  <p className="text-sm opacity-90">
                    Ask detailed questions about what you want to learn from your data.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Provide Context</h4>
                  <p className="text-sm opacity-90">
                    Explain your business goals to get more relevant insights.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Iterate</h4>
                  <p className="text-sm opacity-90">
                    Build on previous questions to dive deeper into your analysis.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Experiment</h4>
                  <p className="text-sm opacity-90">
                    Try different AI agents and features to find what works best.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/app">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Try AI Features Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesGuide;