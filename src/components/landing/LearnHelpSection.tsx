import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Users, GitBranch, Bot, BarChart3, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnHelpSection = () => {
  return (
    <section className="px-4 py-20 bg-muted/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Learn & Get Help
          </h2>
          <p className="text-xl text-muted-foreground">
            Master Chartuvo with comprehensive guides and tutorials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <Link to="/guides/quick-start">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Learn the basics: upload files, create charts, and build your first dashboard in minutes.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/ai-features">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">AI Features Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Master AI chat, intelligent agents, chatbot tones, and automated data quality monitoring.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/data-flow">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Data Flow Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Understand how your data moves through Chartuvo from upload to AI insights.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/agents-deep-dive">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Agents Deep Dive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Master AI agents for automated monitoring, quality checks, and intelligent alerts.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/learning-dashboard">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Learning Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Monitor feedback analytics and schedule learning jobs to improve AI over time.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/alerts">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BellRing className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Alert Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Configure email and webhook alerts for anomalies and important data events.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/guides/best-practices">
            <Card className="bg-card hover:shadow-lg transition-all duration-300 h-full cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Discover data preparation tips and visualization best practices from experts.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link to="/guides">
            <Button variant="outline" size="lg">
              <BookOpen className="w-5 h-5 mr-2" />
              All Guides
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};