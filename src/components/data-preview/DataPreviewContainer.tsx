import { useState } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { detectHierarchies } from '@/lib/hierarchyDetection';
import { sortData } from '@/lib/chartDataUtils';
import { DataPreviewHeader } from './DataPreviewHeader';
import { DataTable } from './DataTable';
import { HierarchySection } from './HierarchySection';
import { ColumnFormatting, ColumnFormat } from './ColumnFormatting';
import { DataExportButton } from './DataExportButton';
import { DataPreviewPagination } from './DataPreviewPagination';
import { DataPreviewTypes } from './DataPreviewTypes';
import { ColumnTypeOverride } from './ColumnTypeOverride';

interface DataPreviewContainerProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export const DataPreviewContainer = ({ data, columns, fileName }: DataPreviewContainerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [showHierarchies, setShowHierarchies] = useState(false);
  const [columnFormats, setColumnFormats] = useState<ColumnFormat[]>([]);
  const [columnsInfo, setColumnsInfo] = useState<ColumnInfo[]>(columns);

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

  const handleColumnTypeChange = (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => {
    const updatedColumns = columnsInfo.map(col => 
      col.name === columnName ? { ...col, type: newType } : col
    );
    setColumnsInfo(updatedColumns);
    
    // If changing to date type, we might need to reprocess the data values
    // This is especially important for Excel date serials that were detected as numeric
    if (newType === 'date') {
      console.log(`Manual column type change: ${columnName} -> date`);
      // The actual data reprocessing would happen in the parent component that manages the data
      // For now, the column type change will be reflected in the display formatting
    }
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
      <div className="flex items-center justify-between">
        <DataPreviewHeader
          fileName={fileName}
          data={data}
          columns={columnsInfo}
          sortConfig={sortConfig}
          hierarchiesCount={hierarchies.length}
          showHierarchies={showHierarchies}
          onToggleHierarchies={() => setShowHierarchies(!showHierarchies)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
        
        <div className="flex items-center gap-2">
          <ColumnFormatting
            columns={columnsInfo}
            formats={columnFormats}
            onFormatsChange={setColumnFormats}
          />
          <DataExportButton
            data={sortedData}
            columns={columnsInfo}
            fileName={fileName}
          />
        </div>
      </div>

      <HierarchySection 
        hierarchies={hierarchies}
        showHierarchies={showHierarchies}
        data={data}
      />

      <div className="space-y-4">
        <ColumnTypeOverride 
          columns={columnsInfo}
          onColumnTypeChange={handleColumnTypeChange}
        />
        
        <DataPreviewTypes columns={columnsInfo} />

        <DataTable
          data={currentData}
          columns={columnsInfo}
          onSort={handleSort}
          sortConfig={sortConfig}
          columnFormats={columnFormats}
        />

        <DataPreviewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalEntries={sortedData.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};