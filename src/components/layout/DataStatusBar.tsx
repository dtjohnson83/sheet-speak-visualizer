import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Database, AlertCircle, Settings } from 'lucide-react';
import { useDatasets } from '@/hooks/useDatasets';
import { useAppState } from '@/contexts/AppStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { DatasetSwitcher } from '@/components/dataset/DatasetSwitcher';
import { useMultiDatasetActions } from '@/hooks/useMultiDatasetActions';
interface DataStatusBarProps {
  displayFileName: string;
  dataLength: number;
  columnsLength: number;
  realtimeEnabled: boolean;
  // Domain context props passed from parent
  contextSummary?: { domain: string; industry: string } | null;
  triggerSurvey: (force?: boolean) => void;
  showSurvey: boolean;
}

export const DataStatusBar: React.FC<DataStatusBarProps> = ({
  displayFileName,
  dataLength,
  columnsLength,
  realtimeEnabled,
  contextSummary,
  triggerSurvey,
  showSurvey
}) => {
  const { user } = useAuth();
  const { state, dispatch } = useAppState();
  const { saveDataset, isSaving } = useDatasets();
  const multiDatasetActions = useMultiDatasetActions();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const datasets = Array.from(state.datasets.values());
  const activeDataset = state.activeDatasetId ? state.datasets.get(state.activeDatasetId) : null;

  const handleQuickSave = () => {
    if (!name.trim()) return;

    saveDataset({
      name: name.trim(),
      description: description.trim() || undefined,
      fileName: state.fileName,
      worksheetName: state.worksheetName,
      data: state.data,
      columns: state.columns
    });

    // Update state to reflect saved status
    setTimeout(() => {
      dispatch({ 
        type: 'SET_DATASET_SAVED', 
        payload: { 
          datasetId: 'temp-id', // Will be updated when we get the real ID
          datasetName: name.trim() 
        } 
      });
    }, 1000);

    setName('');
    setDescription('');
    setSaveDialogOpen(false);
  };

  return (
    <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DatasetSwitcher
            datasets={datasets}
            activeDatasetId={state.activeDatasetId}
            onDatasetSelect={multiDatasetActions.selectDataset}
            onDatasetRemove={multiDatasetActions.removeDataset}
          />
          
          {realtimeEnabled && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-2 h-2 bg-info rounded-full animate-pulse"></div>
              <span className="text-xs text-info">Real-time</span>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            {activeDataset ? (
              <>
                {activeDataset.name} • {activeDataset.rowCount.toLocaleString()} rows • {activeDataset.columnCount} columns
              </>
            ) : (
              <>
                {state.isSaved && state.currentDatasetName ? state.currentDatasetName : displayFileName} • {dataLength.toLocaleString()} rows • {columnsLength} columns
              </>
            )}
          </div>
          
          {/* Save Status Badge */}
          <div className="flex items-center gap-2">
            {activeDataset ? (
              activeDataset.isSaved ? (
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  <Database className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsaved
                </Badge>
              )
            ) : (
              state.isSaved ? (
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  <Database className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsaved
                </Badge>
              )
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick Save Button - only show if not saved and user is authenticated */}
          {!state.isSaved && user && (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={isSaving}
                  className="flex items-center gap-2 text-warning border-warning/20 hover:bg-warning/10"
                >
                  <Save className="h-3 w-3" />
                  Save Dataset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Save Current Dataset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quick-dataset-name">Dataset Name *</Label>
                    <Input
                      id="quick-dataset-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter dataset name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="quick-dataset-description">Description</Label>
                    <Textarea
                      id="quick-dataset-description"
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
                    <Button onClick={handleQuickSave} disabled={!name.trim() || isSaving}>
                      {isSaving ? 'Saving...' : 'Save Dataset'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
           )}
           
           {/* Debug indicator for survey state */}
           {showSurvey && (
             <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-700">
               🔍 Survey Active
             </div>
           )}
           
           {/* Domain Context Status */}
          {contextSummary ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-xs">
                {contextSummary.domain}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  console.log('Edit context button clicked');
                  triggerSurvey(true);
                }}
                className="h-6 w-6 p-0"
                title="Edit domain context"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('Add Context button clicked');
                console.log('triggerSurvey function:', triggerSurvey);
                console.log('showSurvey state before trigger:', showSurvey);
                triggerSurvey();
                // Force a re-render check
                setTimeout(() => {
                  console.log('showSurvey state after trigger (delayed):', showSurvey);
                }, 100);
              }}
              className="text-xs h-6"
            >
              Add Context
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground">
            <span>Use Ctrl+1-8 for quick tab navigation</span>
          </div>
        </div>
      </div>
    </div>
  );
};