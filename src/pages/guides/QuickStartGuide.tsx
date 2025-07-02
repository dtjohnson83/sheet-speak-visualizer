import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, BarChart3, Layout, Download, CheckCircle } from 'lucide-react';

const QuickStartGuide = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Data",
      description: "Start by uploading an Excel file (.xlsx or .xls). Chartuvo automatically detects columns and data types.",
      details: [
        "Click the upload area or drag and drop your file",
        "Select a specific worksheet if your file has multiple sheets",
        "Review the data preview to ensure proper import"
      ]
    },
    {
      icon: BarChart3,
      title: "Create Your First Chart",
      description: "Navigate to the Visualizations tab and select your chart type based on your data.",
      details: [
        "Choose appropriate X and Y columns for your chart",
        "Select from bar, line, pie, scatter, and more chart types",
        "Customize colors, labels, and styling options"
      ]
    },
    {
      icon: Layout,
      title: "Build a Dashboard",
      description: "Save charts as tiles and arrange them in a dashboard layout.",
      details: [
        "Click 'Save as Tile' after creating each chart",
        "Switch to the Dashboard tab to see your tiles",
        "Drag and resize tiles to create your perfect layout"
      ]
    },
    {
      icon: Download,
      title: "Export and Share",
      description: "Export your visualizations and dashboards in various formats.",
      details: [
        "Download charts as PNG images",
        "Export data in CSV or Excel format",
        "Save dashboard layouts for future use"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            Quick Start Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get started with Chartuvo in just a few simple steps
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Step {index + 1}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="mb-6">
                Follow these steps and you'll have your first dashboard ready in minutes!
              </p>
              <Link to="/app">
                <Button size="lg" variant="secondary">
                  Start Creating Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;