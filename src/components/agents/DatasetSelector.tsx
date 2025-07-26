import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle } from 'lucide-react';
import { useDatasets } from '@/hooks/useDatasets';
import { useAppState } from '@/contexts/AppStateContext';

interface DatasetSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  showRowCounts?: boolean;
  contextLabel?: string;
}

export const DatasetSelector = ({ 
  value, 
  onValueChange, 
  placeholder = "Select a dataset...", 
  showRowCounts = true,
  contextLabel 
}: DatasetSelectorProps) => {
  const { datasets } = useDatasets();
  const { state } = useAppState();

  // Check if current data is loaded but not saved
  const hasUnsavedData = state.data.length > 0 && !state.isSaved;
  const currentDatasetName = state.isSaved ? state.currentDatasetName : 'Current Dataset (Unsaved)';

  return (
    <div className="space-y-2">
      {contextLabel && (
        <div className="text-sm text-muted-foreground font-medium">{contextLabel}</div>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {/* Show current unsaved dataset if exists */}
          {hasUnsavedData && (
            <SelectItem value="current-unsaved" className="flex items-center gap-2">
              <div className="flex items-center gap-2 w-full">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="flex-1">{currentDatasetName}</span>
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 text-xs">
                  Unsaved
                </Badge>
              </div>
            </SelectItem>
          )}
          
          {/* Show saved datasets */}
          {datasets.map((dataset) => (
            <SelectItem key={dataset.id} value={dataset.id} className="flex items-center gap-2">
              <div className="flex items-center gap-2 w-full">
                <Database className="h-4 w-4 text-success" />
                <span className="flex-1">{dataset.name}</span>
                <div className="flex items-center gap-1">
                  {showRowCounts && (
                    <Badge variant="outline" className="text-xs">
                      {dataset.row_count.toLocaleString()} rows
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">
                    Saved
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
          
          {/* Show message if no datasets available */}
          {datasets.length === 0 && !hasUnsavedData && (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              No datasets available. Please upload and save data first.
            </div>
          )}
        </SelectContent>
      </Select>
      
      {/* Help text */}
      {hasUnsavedData && (
        <div className="flex items-center gap-2 text-sm text-warning">
          <AlertCircle className="h-4 w-4" />
          <span>Your current data is not saved. Save it to use with agents reliably.</span>
        </div>
      )}
    </div>
  );
};