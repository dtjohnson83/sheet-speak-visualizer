
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Database } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { ColumnTypeConverter } from './ColumnTypeConverter';

interface DataPreviewHeaderProps {
  fileName: string;
  data: DataRow[];
  columns: ColumnInfo[];
  sortConfig: any;
  hierarchiesCount: number;
  showHierarchies: boolean;
  onToggleHierarchies: () => void;
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
  onDataUpdated?: (newData: DataRow[], newColumns: ColumnInfo[]) => void;
}

export const DataPreviewHeader = ({
  fileName,
  data,
  columns,
  sortConfig,
  hierarchiesCount,
  showHierarchies,
  onToggleHierarchies,
  rowsPerPage,
  onRowsPerPageChange,
  onDataUpdated
}: DataPreviewHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          {fileName}
        </h3>
        <div className="flex items-center space-x-4 mt-2">
          <Badge variant="outline">
            {data.length.toLocaleString()} rows
          </Badge>
          <Badge variant="outline">
            {columns.length} columns
          </Badge>
          {sortConfig && (
            <Badge variant="secondary">
              Sorted by {sortConfig.key} ({sortConfig.direction})
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {onDataUpdated && (
          <ColumnTypeConverter
            columns={columns}
            data={data}
            onDataUpdated={onDataUpdated}
          />
        )}
        
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
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
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
        </div>
      </div>
    </div>
  );
};
