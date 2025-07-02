import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Palette, Layout, TrendingUp, AlertCircle } from 'lucide-react';

const BestPracticesGuide = () => {
  const practices = [
    {
      icon: Database,
      title: "Data Preparation",
      description: "Clean and organize your data for better visualizations.",
      tips: [
        "Remove empty rows and columns before uploading",
        "Use consistent date formats (YYYY-MM-DD recommended)",
        "Ensure column headers are descriptive and unique",
        "Convert text numbers to actual numeric values"
      ]
    },
    {
      icon: TrendingUp,
      title: "Chart Selection",
      description: "Choose the right chart type for your data story.",
      tips: [
        "Use bar charts for comparing categories",
        "Use line charts for trends over time",
        "Use pie charts for parts of a whole (max 7 slices)",
        "Use scatter plots to show correlations"
      ]
    },
    {
      icon: Palette,
      title: "Visual Design",
      description: "Create clear and engaging visualizations.",
      tips: [
        "Use consistent color schemes across charts",
        "Ensure sufficient contrast for accessibility",
        "Limit the number of colors (3-5 per chart)",
        "Use color purposefully to highlight insights"
      ]
    },
    {
      icon: Layout,
      title: "Dashboard Layout",
      description: "Organize your dashboard for maximum impact.",
      tips: [
        "Place the most important charts at the top",
        "Group related visualizations together",
        "Leave white space for better readability",
        "Use consistent sizing and alignment"
      ]
    }
  ];

  const commonMistakes = [
    {
      mistake: "Overloading charts with too much data",
      solution: "Focus on key insights and use filters to drill down"
    },
    {
      mistake: "Using 3D effects or unnecessary decorations",
      solution: "Keep designs clean and functional"
    },
    {
      mistake: "Missing or unclear chart titles",
      solution: "Always include descriptive titles and axis labels"
    },
    {
      mistake: "Using pie charts for too many categories",
      solution: "Switch to bar charts when you have more than 7 categories"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            Best Practices Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Expert tips for creating effective data visualizations
          </p>
        </div>

        <div className="space-y-8">
          {practices.map((practice, index) => (
            <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                    <practice.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">{practice.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {practice.description}
                </p>
                <ul className="space-y-2">
                  {practice.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 border-0 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl">Common Mistakes to Avoid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonMistakes.map((item, index) => (
                <div key={index} className="border-l-4 border-amber-400 pl-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ❌ {item.mistake}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    ✅ {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Card className="border-0 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Apply These Practices?</h3>
              <p className="mb-6">
                Use these guidelines to create more effective and engaging visualizations.
              </p>
              <Link to="/app">
                <Button size="lg" variant="secondary">
                  Start Visualizing
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BestPracticesGuide;