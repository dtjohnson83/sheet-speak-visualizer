import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Database, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Eye,
  ArrowRight,
  Users,
  TrendingUp
} from 'lucide-react';
import { DatasetInfo } from '@/contexts/AppStateContext';
import { useDatasets } from '@/hooks/useDatasets';

interface MultiDatasetManagerProps {
  datasets: DatasetInfo[];
  activeDatasetId: string;
  onDatasetSelect: (datasetId: string) => void;
  onDatasetRemove: (datasetId: string) => void;
  onDatasetSave: (dataset: DatasetInfo) => void;
}

export const MultiDatasetManager: React.FC<MultiDatasetManagerProps> = ({
  datasets,
  activeDatasetId,
  onDatasetSelect,
  onDatasetRemove,
  onDatasetSave
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<DatasetInfo | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { saveDataset, isSaving } = useDatasets();

  const handleSaveDataset = async (dataset: DatasetInfo) => {
    if (!name.trim()) return;

    try {
      await saveDataset({
        name: name.trim(),
        description: description.trim() || undefined,
        fileName: dataset.fileName,
        worksheetName: dataset.worksheetName,
        data: dataset.data,
        columns: dataset.columns
      });

      onDatasetSave(dataset);
      setSaveDialogOpen(false);
      setName('');
      setDescription('');
      setSelectedDataset(null);
    } catch (error) {
      console.error('Failed to save dataset:', error);
    }
  };

  const openSaveDialog = (dataset: DatasetInfo) => {
    setSelectedDataset(dataset);
    setName(dataset.name);
    setDescription('');
    setSaveDialogOpen(true);
  };

  if (datasets.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Manager
          </CardTitle>
          <CardDescription>
            No datasets loaded. Upload or connect to a data source to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Manager
            <Badge variant="secondary" className="ml-2">
              {datasets.length} loaded
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your loaded datasets, switch between them, and save your work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className={`p-4 border rounded-lg transition-all ${
                  dataset.id === activeDatasetId 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{dataset.name}</h3>
                        {dataset.id === activeDatasetId && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                        {dataset.isSaved && (
                          <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                            <Database className="h-3 w-3 mr-1" />
                            Saved
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {dataset.fileName}
                        {dataset.worksheetName && ` - ${dataset.worksheetName}`}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {dataset.rowCount.toLocaleString()} rows
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {dataset.columnCount} columns
                        </div>
                        <div>
                          Modified: {new Date(dataset.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {dataset.id !== activeDatasetId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDatasetSelect(dataset.id)}
                        className="h-8"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                    
                    {!dataset.isSaved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSaveDialog(dataset)}
                        className="h-8"
                      >
                        <Database className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDatasetRemove(dataset.id)}
                      className="h-8 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Dataset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dataset-name">Dataset Name *</Label>
              <Input
                id="dataset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter dataset name..."
              />
            </div>
            <div>
              <Label htmlFor="dataset-description">Description</Label>
              <Textarea
                id="dataset-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedDataset && handleSaveDataset(selectedDataset)}
                disabled={!name.trim() || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Dataset'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};