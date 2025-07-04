import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BarChart3, Layout, Zap, Shield, Brain } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Enhanced AI Analysis",
    description: "Get comprehensive AI insights with interactive chat, expert reports from multiple personas, and business context integration for domain-specific analysis.",
    color: "text-indigo-500"
  },
  {
    icon: Zap,
    title: "Predictive Analytics",
    description: "Leverage machine learning for forecasting, trend prediction, and scenario modeling. Generate business insights with confidence intervals.",
    color: "text-purple-600"
  },
  {
    icon: Shield,
    title: "Data Quality Monitoring",
    description: "Automated data quality checks with anomaly detection, completeness validation, and real-time monitoring with intelligent alerts.",
    color: "text-red-500"
  },
  {
    icon: Upload,
    title: "Easy Data Connection",
    description: "Simply drag and drop your data files or connect to your data sources. Support for Excel, CSV, JSON, databases, Google Sheets, and more.",
    color: "text-blue-500"
  },
  {
    icon: BarChart3,
    title: "Rich Visualizations",
    description: "Support your analysis with interactive charts: bar, line, pie, scatter, heatmaps, treemaps, and histograms to communicate insights effectively.",
    color: "text-green-500"
  },
  {
    icon: Layout,
    title: "Interactive Dashboards",
    description: "Present your AI-driven insights through customizable dashboards with drag-and-drop tiles and real-time filtering capabilities.",
    color: "text-cyan-500"
  }
];

export const FeaturesSection = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  return (
    <section className="px-4 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powerful AI capabilities designed for intelligent data analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              onMouseEnter={() => setIsHovered(feature.title)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-4 transition-all duration-300 ${
                  isHovered === feature.title ? 'scale-110' : ''
                }`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};