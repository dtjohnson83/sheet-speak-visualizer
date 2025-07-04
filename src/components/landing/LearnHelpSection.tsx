import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Play, Users, GitBranch, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LearnHelpSectionProps {
  onWatchDemo: () => void;
}

export const LearnHelpSection = ({ onWatchDemo }: LearnHelpSectionProps) => {
  return (
    <section className="px-4 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learn & Get Help
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Master Chartuvo with comprehensive guides and tutorials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <Link to="/guides/quick-start">
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
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
          </Link>

          <Link to="/guides/ai-features">
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">AI Features Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Master AI chat, intelligent agents, chatbot tones, and automated data quality monitoring.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/data-flow">
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle className="text-lg">Data Flow Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Understand how your data moves through Chartuvo from upload to AI insights.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/agents-deep-dive">
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-lg">Agents Deep Dive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Master AI agents for automated monitoring, quality checks, and intelligent alerts.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onWatchDemo}>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Demo Video</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Watch a complete walkthrough of Chartuvo's features and capabilities.
              </p>
            </CardContent>
          </Card>

          <Link to="/guides/best-practices">
            <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
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
          </Link>
        </div>

        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link to="/guides">
              <Button variant="outline" size="lg" className="w-full">
                <BookOpen className="w-5 h-5 mr-2" />
                All Guides
              </Button>
            </Link>
            <Button 
              variant="default" 
              size="lg" 
              className="w-full"
              onClick={onWatchDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};