import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BarChart3, Layout, Zap, Shield, Brain, Cog, BellRing, Bot } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "Enhanced AI Analysis",
    description: "Interactive AI chat, expert multi-persona reports, and domain-aware insights.",
  },
  {
    icon: BarChart3,
    title: "Learning Dashboard",
    description: "Track feedback analytics and manage background learning jobs in one place.",
  },
  {
    icon: Cog,
    title: "Auto-Scheduled Agent Tasks",
    description: "Schedule agents to run automatically for monitoring and insight generation.",
  },
  {
    icon: BellRing,
    title: "Alert Notifications",
    description: "Email and webhook alerts for anomalies and important data changes.",
  },
  {
    icon: Shield,
    title: "Data Quality Monitoring",
    description: "Automated checks with anomaly detection and completeness validation.",
  },
  {
    icon: Upload,
    title: "Easy Data Connection",
    description: "Drag-and-drop files or connect Sheets, databases, and APIs quickly.",
  },
  {
    icon: Layout,
    title: "Interactive Dashboards",
    description: "Custom dashboards with drag-and-drop tiles and real-time filtering.",
  },
  {
    icon: Bot,
    title: "Platform Chatbot",
    description: "Context-aware Q&A assistant for guidance and next-step suggestions.",
  }
];

export const FeaturesSection = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  return (
    <section className="px-4 py-20 bg-muted/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful AI capabilities designed for intelligent data analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-card/80 backdrop-blur-sm"
              onMouseEnter={() => setIsHovered(feature.title)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 transition-all duration-300 ${
                  isHovered === feature.title ? 'scale-110' : ''
                }`}>
                  <feature.icon className={`w-6 h-6 text-primary`} />
                </div>
                <CardTitle className="text-xl text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
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