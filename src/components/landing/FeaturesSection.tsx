import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BarChart3, Layout, Zap, Shield, Brain } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: "Easy File Upload",
    description: "Simply drag and drop your Excel files or browse to upload. Support for multiple worksheets and formats.",
    color: "text-blue-500"
  },
  {
    icon: Brain,
    title: "Enhanced AI Analysis",
    description: "Get comprehensive AI insights with interactive chat, expert reports from multiple personas, and business context integration for domain-specific analysis.",
    color: "text-indigo-500"
  },
  {
    icon: Zap,
    title: "AI-Powered Agents",
    description: "Deploy autonomous AI agents for continuous data monitoring, anomaly detection, trend analysis, and automated insight generation.",
    color: "text-purple-600"
  },
  {
    icon: BarChart3,
    title: "Rich Visualizations",
    description: "Create stunning charts with multiple types: bar, line, pie, scatter, heatmaps, and more. Customize colors and styles effortlessly.",
    color: "text-green-500"
  },
  {
    icon: Layout,
    title: "Interactive Dashboards",
    description: "Build comprehensive dashboards with drag-and-drop tiles. Filter and analyze your data in real-time with advanced business context.",
    color: "text-cyan-500"
  },
  {
    icon: Shield,
    title: "Business Context Integration",
    description: "Enhance AI accuracy with domain-specific understanding. Input business rules, industry context, and organizational knowledge.",
    color: "text-amber-600"
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
            Powerful features designed for effortless data visualization
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