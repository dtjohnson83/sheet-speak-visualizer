
import { useState } from 'react';
import { detectHierarchies } from '@/lib/hierarchyDetection';
import { sortData } from '@/lib/chartDataUtils';
import { DataPreviewHeader } from './data-preview/DataPreviewHeader';
import { DataTable } from './data-preview/DataTable';
import { HierarchyDisplay } from './data-preview/HierarchyDisplay';
import { ColumnBadges } from './data-preview/ColumnBadges';
import { DataPagination } from './data-preview/DataPagination';
import { useDataFormatting } from '@/hooks/useDataFormatting';
import { DataRow, ColumnInfo } from '@/pages/Index';

interface DataPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const DataPreview = ({ data, columns, fileName }: DataPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [showHierarchies, setShowHierarchies] = useState(false);

  const { getTypeColor, formatValue, getSortIcon } = useDataFormatting();

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

  return (
    <div className="space-y-6">
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

      {/* Hierarchy Detection Results */}
      {showHierarchies && hierarchies.length > 0 && (
        <HierarchyDisplay hierarchies={hierarchies} data={data} />
      )}

      <div className="space-y-4">
        <ColumnBadges columns={columns} getTypeColor={getTypeColor} />

        <DataTable
          data={currentData}
          columns={columns}
          onSort={handleSort}
          getSortIcon={getSortIcon}
          getTypeColor={getTypeColor}
          formatValue={formatValue}
        />

        <DataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRows={sortedData.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
