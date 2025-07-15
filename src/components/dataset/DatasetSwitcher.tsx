import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Database, FileText, X } from 'lucide-react';
import { DatasetInfo } from '@/contexts/AppStateContext';

interface DatasetSwitcherProps {
  datasets: DatasetInfo[];
  activeDatasetId: string;
  onDatasetSelect: (datasetId: string) => void;
  onDatasetRemove: (datasetId: string) => void;
}

export const DatasetSwitcher: React.FC<DatasetSwitcherProps> = ({
  datasets,
  activeDatasetId,
  onDatasetSelect,
  onDatasetRemove
}) => {
  const activeDataset = datasets.find(d => d.id === activeDatasetId);

  if (datasets.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-muted rounded-full"></div>
        <span className="text-sm text-muted-foreground">No datasets loaded</span>
      </div>
    );
  }

  if (datasets.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Dataset Active</span>
        <Badge variant="secondary" className="ml-2">
          {activeDataset?.name || 'Unknown'}
        </Badge>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Dataset Active</span>
            <Badge variant="secondary" className="ml-2">
              {activeDataset?.name || 'Unknown'}
            </Badge>
            <ChevronDown className="h-3 w-3 ml-1" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Loaded Datasets ({datasets.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {datasets.map((dataset) => (
          <DropdownMenuItem
            key={dataset.id}
            className={`flex items-center justify-between p-3 ${
              dataset.id === activeDatasetId ? 'bg-accent' : ''
            }`}
            onSelect={() => onDatasetSelect(dataset.id)}
          >
            <div className="flex items-center gap-3 flex-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{dataset.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {dataset.fileName}
                  {dataset.worksheetName && ` - ${dataset.worksheetName}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dataset.rowCount.toLocaleString()} rows • {dataset.columnCount} columns
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dataset.id === activeDatasetId && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
              {dataset.isSaved && (
                <Database className="h-3 w-3 text-success" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDatasetRemove(dataset.id);
                }}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};