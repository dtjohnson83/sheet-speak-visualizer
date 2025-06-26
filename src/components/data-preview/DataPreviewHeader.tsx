
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Network } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/types/data';

interface DataPreviewHeaderProps {
  fileName: string;
  data: DataRow[];
  columns: ColumnInfo[];
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  hierarchiesCount: number;
  showHierarchies: boolean;
  onToggleHierarchies: () => void;
  showKnowledgeGraph: boolean;
  onToggleKnowledgeGraph: () => void;
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
}

export const DataPreviewHeader = ({
  fileName,
  data,
  columns,
  sortConfig,
  hierarchiesCount,
  showHierarchies,
  onToggleHierarchies,
  showKnowledgeGraph,
  onToggleKnowledgeGraph,
  rowsPerPage,
  onRowsPerPageChange
}: DataPreviewHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-semibold">Data Preview</h3>
        <p className="text-gray-600">
          {fileName} • {data.length} rows • {columns.length} columns
          {sortConfig && (
            <span className="ml-2 text-sm text-blue-600">
              (sorted by {sortConfig.key} {sortConfig.direction === 'asc' ? '↑' : '↓'})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant={showKnowledgeGraph ? "default" : "outline"}
          size="sm"
          onClick={onToggleKnowledgeGraph}
        >
          <Network className="h-4 w-4 mr-2" />
          Knowledge Graph
        </Button>
        {hierarchiesCount > 0 && (
          <Button
            variant={showHierarchies ? "default" : "outline"}
            size="sm"
            onClick={onToggleHierarchies}
          >
            <TreePine className="h-4 w-4 mr-2" />
            Hierarchies ({hierarchiesCount})
          </Button>
        )}
        <Select value={rowsPerPage.toString()} onValueChange={(value) => onRowsPerPageChange(Number(value))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">rows per page</span>
      </div>
    </div>
  );
};
