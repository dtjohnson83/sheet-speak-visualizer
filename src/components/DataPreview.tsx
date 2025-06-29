
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, TreePine } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { detectHierarchies, buildHierarchyTree } from '@/lib/hierarchyDetection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { sortData } from '@/lib/chartDataUtils';
import { DataPreviewHeader } from './data-preview/DataPreviewHeader';
import { DataTable } from './data-preview/DataTable';
import { HierarchyTreeNode } from './data-preview/HierarchyTreeNode';
import { ColumnFormatting, ColumnFormat } from './data-preview/ColumnFormatting';

interface DataPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const formatDateValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    
    // Format as YYYY-MM-DD for consistency
    return date.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
  } catch {
    return String(value);
  }
};

export const DataPreview = ({ data, columns, fileName }: DataPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [showHierarchies, setShowHierarchies] = useState(false);
  const [columnFormats, setColumnFormats] = useState<ColumnFormat[]>([]);

  // Detect hierarchies when data changes
  const hierarchies = detectHierarchies(data, columns);

  const handleSort = (columnName: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnName, direction });
    setCurrentPage(0);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(0);
  };

  // Use the improved sorting logic from chartDataUtils
  const sortedData = sortConfig 
    ? sortData(data, sortConfig.key, sortConfig.direction)
    : data;

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, sortedData.length);
  const currentData = sortedData.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numeric': return 'bg-blue-100 text-blue-800';
      case 'date': return 'bg-green-100 text-green-800';
      case 'categorical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'numeric':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        return formatDateValue(value);
      default:
        return value.toString();
    }
  };

  const getSortIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DataPreviewHeader
          fileName={fileName}
          data={data}
          columns={columns}
          sortConfig={sortConfig}
          hierarchiesCount={hierarchies.length}
          showHierarchies={showHierarchies}
          onToggleHierarchies={() => setShowHierarchies(!showHierarchies)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
        
        <ColumnFormatting
          columns={columns}
          formats={columnFormats}
          onFormatsChange={setColumnFormats}
        />
      </div>

      {/* Hierarchy Detection Results */}
      {showHierarchies && hierarchies.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <TreePine className="h-5 w-5 mr-2 text-green-600" />
            Detected Hierarchies
          </h4>
          <div className="space-y-4">
            {hierarchies.map((hierarchy, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${hierarchy.confidence > 0.7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {(hierarchy.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <span className="font-medium">{hierarchy.parentColumn} → {hierarchy.childColumn}</span>
                    <Badge variant="outline" className="text-xs">
                      {hierarchy.type}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-3 bg-white border rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">{hierarchy.description}</p>
                    <div className="max-h-60 overflow-y-auto">
                      {buildHierarchyTree(data, hierarchy.parentColumn, hierarchy.childColumn !== hierarchy.parentColumn + '_levels' ? hierarchy.childColumn : undefined).map((node, nodeIndex) => (
                        <HierarchyTreeNode key={nodeIndex} node={node} />
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {columns.map((column) => (
            <Badge key={column.name} className={getTypeColor(column.type)}>
              {column.name} ({column.type})
            </Badge>
          ))}
        </div>

        <DataTable
          data={currentData}
          columns={columns}
          onSort={handleSort}
          getSortIcon={getSortIcon}
          getTypeColor={getTypeColor}
          formatValue={formatValue}
          columnFormats={columnFormats}
        />

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {endIndex} of {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
