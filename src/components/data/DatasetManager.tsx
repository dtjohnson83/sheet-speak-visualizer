
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Database, Trash2, Upload } from 'lucide-react';
import { useDatasets, SavedDataset } from '@/hooks/useDatasets';
import { useAuth } from '@/contexts/AuthContext';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DatasetManagerProps {
  currentData: DataRow[];
  currentColumns: ColumnInfo[];
  currentFileName: string;
  currentWorksheetName: string;
  onLoadDataset: (dataset: SavedDataset) => void;
}

export const DatasetManager = ({
  currentData,
  currentColumns,
  currentFileName,
  currentWorksheetName,
  onLoadDataset
}: DatasetManagerProps) => {
  const { user } = useAuth();
  const { datasets, saveDataset, deleteDataset, isSaving } = useDatasets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveDataset = () => {
    if (!name.trim()) return;

    saveDataset({
      name: name.trim(),
      description: description.trim() || undefined,
      fileName: currentFileName,
      worksheetName: currentWorksheetName,
      data: currentData,
      columns: currentColumns
    });

    setName('');
    setDescription('');
    setSaveDialogOpen(false);
  };

  const handleLoadDataset = (dataset: SavedDataset) => {
    onLoadDataset(dataset);
    setIsDialogOpen(false);
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            disabled={currentData.length === 0 || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Dataset
          </Button>
        </DialogTrigger>
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
              <Button onClick={handleSaveDataset} disabled={!name.trim() || isSaving}>
                {isSaving ? 'Saving...' : 'Save Dataset'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Load Dataset
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saved Datasets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {datasets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved datasets found.</p>
                <p className="text-sm">Save your current data to access it later.</p>
              </div>
            ) : (
              datasets.map((dataset) => (
                <Card key={dataset.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{dataset.name}</h3>
                      {dataset.description && (
                        <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {dataset.row_count.toLocaleString()} rows
                        </Badge>
                        <Badge variant="outline">
                          {dataset.columns.length} columns
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(dataset.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        File: {dataset.file_name}
                        {dataset.worksheet_name && ` - ${dataset.worksheet_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadDataset(dataset)}
                        className="flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDataset(dataset.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
