
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, FolderOpen, Trash2, Upload, BarChart3 } from 'lucide-react';
import { useDashboards, SavedDashboard } from '@/hooks/useDashboards';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardTileData } from './DashboardTile';
import { FilterCondition } from './DashboardFilters';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DashboardManagerProps {
  tiles: DashboardTileData[];
  filters: FilterCondition[];
  currentDatasetId?: string;
  onLoadDashboard: (tiles: DashboardTileData[], filters: FilterCondition[], data?: DataRow[], columns?: ColumnInfo[]) => void;
}

export const DashboardManager = ({
  tiles,
  filters,
  currentDatasetId,
  onLoadDashboard
}: DashboardManagerProps) => {
  const { user } = useAuth();
  const { dashboards, saveDashboard, loadDashboard, deleteDashboard, isSaving, isLoading } = useDashboards();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveDashboard = () => {
    if (!name.trim()) return;

    saveDashboard({
      name: name.trim(),
      description: description.trim() || undefined,
      datasetId: currentDatasetId,
      tiles,
      filters
    });

    setName('');
    setDescription('');
    setSaveDialogOpen(false);
  };

  const handleLoadDashboard = async (dashboard: SavedDashboard) => {
    try {
      const result = await loadDashboard(dashboard.id);
      onLoadDashboard(
        result.tiles,
        result.filters,
        result.dataset?.data,
        result.dataset?.columns
      );
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            disabled={tiles.length === 0 || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Dashboard
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dashboard-name">Dashboard Name *</Label>
              <Input
                id="dashboard-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter dashboard name..."
              />
            </div>
            <div>
              <Label htmlFor="dashboard-description">Description</Label>
              <Textarea
                id="dashboard-description"
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
              <Button onClick={handleSaveDashboard} disabled={!name.trim() || isSaving}>
                {isSaving ? 'Saving...' : 'Save Dashboard'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Load Dashboard
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saved Dashboards</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {dashboards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved dashboards found.</p>
                <p className="text-sm">Save your current dashboard to access it later.</p>
              </div>
            ) : (
              dashboards.map((dashboard) => (
                <Card key={dashboard.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{dashboard.name}</h3>
                      {dashboard.description && (
                        <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {dashboard.dataset_id && (
                          <Badge variant="secondary">
                            With Dataset
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(dashboard.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadDashboard(dashboard)}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        {isLoading ? 'Loading...' : 'Load'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDashboard(dashboard.id)}
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
