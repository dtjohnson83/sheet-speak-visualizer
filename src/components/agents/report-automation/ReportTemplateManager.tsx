import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  source_dataset_id?: string;
  config: any;
  transformations: any;
  visualizations: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export const ReportTemplateManager = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    template_type: 'custom' as const
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load report templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('report_templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description || null,
          template_type: newTemplate.template_type,
          config: {},
          transformations: [],
          visualizations: [],
          status: 'draft',
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Template Created",
        description: `"${newTemplate.name}" template has been created successfully.`,
      });
      
      setNewTemplate({ name: '', description: '', template_type: 'custom' });
      setIsCreateDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully.",
      });

      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    }
  };

  const handleUploadExcel = () => {
    toast({
      title: "Excel Analysis",
      description: "Excel upload functionality will be available soon.",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

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
                    value={newTemplate.template_type}
                    onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, template_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="financial">Financial Report</SelectItem>
                      <SelectItem value="operational">Operational Report</SelectItem>
                      <SelectItem value="excel">Excel Report</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Report</SelectItem>
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
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">Create your first report template to get started.</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(template.template_type)}`}>
                      {getTypeIcon(template.template_type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge className={getTypeColor(template.template_type)}>
                        {template.template_type}
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
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{template.description || 'No description provided'}</p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">STATUS</p>
                    <Badge variant="outline" className="text-xs">
                      {template.status}
                    </Badge>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created {new Date(template.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Template Details Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getTypeIcon(selectedTemplate.template_type)}
                <span>{selectedTemplate.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedTemplate.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Template Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge>{selectedTemplate.template_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant="outline">{selectedTemplate.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm">{new Date(selectedTemplate.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <div className="text-sm text-muted-foreground">
                    {Object.keys(selectedTemplate.config || {}).length > 0 
                      ? 'Custom configuration available'
                      : 'No custom configuration'
                    }
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};