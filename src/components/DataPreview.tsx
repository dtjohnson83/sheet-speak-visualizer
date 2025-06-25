import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, TreePine, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { detectHierarchies, buildHierarchyTree, HierarchyNode } from '@/lib/hierarchyDetection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { isValidNumber, sortData } from '@/lib/chartDataUtils';

interface DataPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface ColumnStats {
  count: number;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  mean?: number;
  median?: number;
  min?: any;
  max?: any;
  cardinality: number;
  hasAnomalies: boolean;
  anomalies: string[];
}

const HierarchyTreeNode = ({ node, level = 0 }: { node: HierarchyNode; level?: number }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  
  return (
    <div className="border-l border-gray-200 ml-4">
      <div className="flex items-center space-x-2 py-1 pl-4">
        {node.children.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </Button>
        )}
        <TreePine className="h-4 w-4 text-green-600" />
        <span className="text-sm">{node.name}</span>
        <Badge variant="outline" className="text-xs">
          {node.count}
        </Badge>
      </div>
      {isOpen && node.children.length > 0 && (
        <div className="ml-2">
          {node.children.map((child, index) => (
            <HierarchyTreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DataPreview = ({ data, columns, fileName }: DataPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [showHierarchies, setShowHierarchies] = useState(false);

  // Detect hierarchies when data changes
  const hierarchies = detectHierarchies(data, columns);

  const isValidDate = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    
    const dateValue = new Date(value);
    if (isNaN(dateValue.getTime())) return false;
    
    // Check if the string looks like a date (has date-like patterns)
    const str = String(value);
    const datePatterns = [
      /^\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
      /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY or DD/MM/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}/, // MM-DD-YYYY or DD-MM-YYYY
      /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD
      /^\w{3}\s+\d{1,2},?\s+\d{4}/, // Mon DD, YYYY
      /^\d{1,2}\s+\w{3}\s+\d{4}/, // DD Mon YYYY
    ];
    
    return datePatterns.some(pattern => pattern.test(str));
  };

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

  const calculateColumnStats = (columnName: string, columnType: string): ColumnStats => {
    const values = data.map(row => row[columnName]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const nullCount = values.length - nonNullValues.length;
    const nullPercentage = (nullCount / values.length) * 100;
    const uniqueValues = new Set(nonNullValues);
    const uniqueCount = uniqueValues.size;
    const cardinality = uniqueCount / nonNullValues.length;

    let stats: ColumnStats = {
      count: values.length,
      nullCount,
      nullPercentage,
      uniqueCount,
      cardinality,
      hasAnomalies: false,
      anomalies: []
    };

    // Calculate stats based on column type
    if (columnType === 'numeric') {
      const numericValues = nonNullValues
        .map(v => Number(v))
        .filter(v => !isNaN(v) && isFinite(v));
      
      if (numericValues.length > 0) {
        const sorted = [...numericValues].sort((a, b) => a - b);
        stats.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        stats.median = sorted.length % 2 === 0 
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        stats.min = Math.min(...numericValues);
        stats.max = Math.max(...numericValues);
      }
    } else if (columnType === 'date') {
      // For date columns, find min/max dates
      const dateValues = nonNullValues
        .map(v => new Date(v))
        .filter(d => !isNaN(d.getTime()));
      
      if (dateValues.length > 0) {
        const sortedDates = [...dateValues].sort((a, b) => a.getTime() - b.getTime());
        stats.min = formatDateValue(sortedDates[0]);
        stats.max = formatDateValue(sortedDates[sortedDates.length - 1]);
      }
    } else {
      // For non-numeric columns, min/max are first/last when sorted
      if (nonNullValues.length > 0) {
        const sorted = [...nonNullValues].map(v => String(v)).sort();
        stats.min = sorted[0];
        stats.max = sorted[sorted.length - 1];
      }
    }

    // Detect anomalies
    const anomalies: string[] = [];

    // High null percentage
    if (nullPercentage > 50) {
      anomalies.push(`High nulls (${nullPercentage.toFixed(1)}%)`);
    }

    // High cardinality for categorical data
    if (columnType === 'categorical' && uniqueCount > Math.min(100, data.length * 0.8)) {
      anomalies.push('High cardinality');
    }

    // Low cardinality for numeric data
    if (columnType === 'numeric' && uniqueCount < 5 && data.length > 20) {
      anomalies.push('Low variance');
    }

    // Check for inconsistent data types in non-numeric columns
    if (columnType !== 'numeric') {
      const typePatterns = nonNullValues.map(v => {
        const str = String(v);
        if (/^\d+$/.test(str)) return 'integer';
        if (/^\d*\.\d+$/.test(str)) return 'decimal';
        if (isValidDate(v)) return 'date';
        if (str.length > 100) return 'long_text';
        return 'text';
      });
      
      const uniqueTypes = new Set(typePatterns);
      if (uniqueTypes.size > 2) {
        anomalies.push('Mixed data types');
      }
    }

    // Date-specific anomalies
    if (columnType === 'date') {
      const invalidDates = nonNullValues.filter(v => !isValidDate(v));
      if (invalidDates.length > nonNullValues.length * 0.1) {
        anomalies.push('Invalid date formats');
      }
    }

    stats.hasAnomalies = anomalies.length > 0;
    stats.anomalies = anomalies;

    return stats;
  };

  const handleSort = (columnName: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnName, direction });
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

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return 'N/A';
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
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
          {hierarchies.length > 0 && (
            <Button
              variant={showHierarchies ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHierarchies(!showHierarchies)}
            >
              <TreePine className="h-4 w-4 mr-2" />
              Hierarchies ({hierarchies.length})
            </Button>
          )}
          <Select value={rowsPerPage.toString()} onValueChange={(value) => {
            setRowsPerPage(Number(value));
            setCurrentPage(0);
          }}>
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

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column) => {
                  const stats = calculateColumnStats(column.name, column.type);
                  return (
                    <th 
                      key={column.name}
                      className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700 min-w-[180px]"
                    >
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleSort(column.name)}
                          className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                        >
                          <span className="font-semibold">{column.name}</span>
                          {getSortIcon(column.name)}
                          {stats.hasAnomalies && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </button>
                        
                        <div className="space-y-1">
                          <Badge className={`${getTypeColor(column.type)} text-xs w-fit`}>
                            {column.type}
                          </Badge>
                          
                          {/* Stats display */}
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div>Count: {stats.count.toLocaleString()}</div>
                            <div>Unique: {stats.uniqueCount.toLocaleString()}</div>
                            <div>Nulls: {stats.nullCount} ({stats.nullPercentage.toFixed(1)}%)</div>
                            
                            {column.type === 'numeric' && stats.mean !== undefined && (
                              <>
                                <div>Mean: {formatNumber(stats.mean)}</div>
                                <div>Median: {formatNumber(stats.median)}</div>
                              </>
                            )}
                            
                            {stats.min !== undefined && stats.max !== undefined && (
                              <div>Range: {String(stats.min).substring(0, 20)}{String(stats.min).length > 20 ? '...' : ''} → {String(stats.max).substring(0, 20)}{String(stats.max).length > 20 ? '...' : ''}</div>
                            )}
                          </div>
                          
                          {/* Anomalies */}
                          {stats.hasAnomalies && (
                            <div className="space-y-1">
                              {stats.anomalies.map((anomaly, index) => (
                                <Badge 
                                  key={index} 
                                  className="bg-orange-100 text-orange-800 text-xs w-fit"
                                >
                                  ⚠ {anomaly}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td 
                      key={column.name}
                      className="border border-gray-200 px-4 py-3 text-sm"
                    >
                      {formatValue(row[column.name], column.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
