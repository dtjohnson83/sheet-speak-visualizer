
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Upload, BarChart3, Layout, Share2, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      icon: Upload,
      title: "Easy File Upload",
      description: "Simply drag and drop your Excel files or browse to upload. Support for multiple worksheets and formats.",
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      title: "Rich Visualizations",
      description: "Create stunning charts with multiple types: bar, line, pie, scatter, and more. Customize colors and styles.",
      color: "text-green-500"
    },
    {
      icon: Layout,
      title: "Interactive Dashboards",
      description: "Build comprehensive dashboards with drag-and-drop tiles. Filter and analyze your data in real-time.",
      color: "text-purple-500"
    },
    {
      icon: Share2,
      title: "Export & Share",
      description: "Export your visualizations as images or PDFs. Share insights with your team effortlessly.",
      color: "text-orange-500"
    },
    {
      icon: Zap,
      title: "Real-time Filtering",
      description: "Apply dynamic filters across your entire dashboard. See your data update instantly.",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data stays secure. Process files locally in your browser with no server uploads required.",
      color: "text-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Charta</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            ✨ Transform Your Data Into Insights
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Visualize Your Data
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Beautifully</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload Excel files, create stunning visualizations, and build interactive dashboards. 
            No technical expertise required – just drag, drop, and discover insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
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
              Get from data to insights in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Upload</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Drop your Excel file or browse to upload. We'll automatically detect your data structure.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Visualize</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from various chart types and customize colors, labels, and styling to match your needs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Build interactive dashboards with multiple charts and apply real-time filters to explore your data.
              </p>
            </div>
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
          <Link to="/app">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Visualizing Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Charta</span>
          </div>
          <p className="text-gray-400 mb-4">
            Making data visualization accessible to everyone.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 Charta. Built with ❤️ for data enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
