
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VideoModal } from '@/components/VideoModal';
import { FeedbackButton } from '@/components/FeedbackButton';
import { Upload, BarChart3, Layout, Zap, Shield, Brain, BookOpen, Play, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/b6f37075-7fc7-47ba-9704-f02449e75dfe.png" 
              alt="Chartuvo Logo" 
              className="h-20 w-auto md:h-24"
            />
          </div>
          <div className="flex items-center gap-4">
            <FeedbackButton />
            {user ? (
              <Link to="/app">
                <Button variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline">
                  Sign In
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Visualize Your Data
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Beautifully</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload Excel files, create stunning visualizations, and build interactive dashboards with AI-powered insights. 
            Get automated analysis reports and discover patterns instantly – no technical expertise required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/app">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started Free
                </Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => setIsVideoModalOpen(true)}
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
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

      {/* How It Works */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From data upload to intelligent insights in four powerful steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload & Prepare</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload Excel files and let AI automatically detect structure, data types, and business context.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get comprehensive AI insights, chat with your data, and generate expert reports from multiple perspectives.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Visualize</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create stunning charts and build interactive dashboards with drag-and-drop tiles and real-time filtering.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Automate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Deploy AI agents for continuous monitoring, anomaly detection, and automated insight generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learn & Get Help */}
      <section className="px-4 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Learn & Get Help
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Master Charta with comprehensive guides and tutorials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Learn the basics: upload files, create charts, and build your first dashboard in minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">AI Features Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Master AI chat, agents, and business context to get deeper insights from your data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Watch step-by-step tutorials covering advanced features and best practices.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Discover data preparation tips and visualization best practices from experts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust Charta for their data visualization needs.
          </p>
          {user ? (
            <Link to="/app">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Visualizing Now
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/b6f37075-7fc7-47ba-9704-f02449e75dfe.png" 
              alt="Chartuvo Logo" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-gray-400 mb-4">
            Making data visualization accessible to everyone.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 Charta. Built with ❤️ for data enthusiasts.
          </p>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://vimeo.com/1097634521/90b5e70a7c?ts=0&share=copy"
        title="Charta Demo"
      />
    </div>
  );
};

export default Landing;
