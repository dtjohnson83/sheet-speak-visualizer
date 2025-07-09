
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileSpreadsheet, 
  Settings, 
  Trash2, 
  Copy,
  Upload,
  Eye,
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExcelTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'financial' | 'operational' | 'custom';
  sourceFile?: string;
  columns: string[];
  transformations: string[];
  visualizations: string[];
  createdAt: Date;
}

export const ReportTemplateManager = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExcelTemplate | null>(null);
  
  // Mock templates data
  const [templates] = useState<ExcelTemplate[]>([
    {
      id: '1',
      name: 'Weekly Sales Report',
      description: 'Comprehensive sales analysis with regional breakdowns and trend analysis',
      type: 'sales',
      sourceFile: 'sales_data_template.xlsx',
      columns: ['Date', 'Region', 'Product', 'Sales Amount', 'Units Sold'],
      transformations: ['Pivot by Region', 'Calculate Growth %', 'Add Moving Average'],
      visualizations: ['Sales Trend Chart', 'Regional Pie Chart', 'Top Products Bar Chart'],
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Monthly P&L Statement',
      description: 'Automated profit and loss statement with variance analysis',
      type: 'financial',
      sourceFile: 'financial_template.xlsx',
      columns: ['Account', 'Actual', 'Budget', 'Prior Year', 'Category'],
      transformations: ['Calculate Variance %', 'Group by Category', 'Add YoY Comparison'],
      visualizations: ['Budget vs Actual Chart', 'Variance Waterfall', 'Category Breakdown'],
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Inventory Dashboard',
      description: 'Stock levels, turnover rates, and reorder recommendations',
      type: 'operational',
      columns: ['SKU', 'Current Stock', 'Reorder Level', 'Last Sale Date', 'Supplier'],
      transformations: ['Calculate Days Supply', 'Flag Low Stock', 'Rank by Turnover'],
      visualizations: ['Stock Level Heatmap', 'Turnover Analysis', 'Reorder Alerts'],
      createdAt: new Date('2024-01-05')
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'custom' as const
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales': return <TrendingUp className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'operational': return <BarChart3 className="h-4 w-4" />;
      default: return <FileSpreadsheet className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-green-500/15 text-green-600 dark:text-green-400';
      case 'financial': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'operational': return 'bg-orange-500/15 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Template Created",
      description: `"${newTemplate.name}" template has been created successfully.`,
    });
    
    setNewTemplate({ name: '', description: '', type: 'custom' });
    setIsCreateDialogOpen(false);
  };

  const handleUploadExcel = () => {
    // Simulate file upload
    toast({
      title: "Excel Analysis",
      description: "Analyzing Excel file structure and creating template...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Report Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage and create automated Excel report templates
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleUploadExcel}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Weekly Sales Report"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this report includes..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Report Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="financial">Financial Report</SelectItem>
                      <SelectItem value="operational">Operational Report</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                    {getTypeIcon(template.type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge className={getTypeColor(template.type)}>
                      {template.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedTemplate(template)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">COLUMNS ({template.columns.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {template.columns.slice(0, 3).map((column, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {column}
                      </Badge>
                    ))}
                    {template.columns.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.columns.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">VISUALIZATIONS ({template.visualizations.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {template.visualizations.slice(0, 2).map((viz, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {viz}
                      </Badge>
                    ))}
                    {template.visualizations.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.visualizations.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Created {template.createdAt.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Details Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getTypeIcon(selectedTemplate.type)}
                <span>{selectedTemplate.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Data Columns</h4>
                  <div className="space-y-1">
                    {selectedTemplate.columns.map((column, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{column}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Transformations</h4>
                  <div className="space-y-1">
                    {selectedTemplate.transformations.map((transform, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{transform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Visualizations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTemplate.visualizations.map((viz, index) => (
                    <Badge key={index} variant="secondary" className="justify-start">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      {viz}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
