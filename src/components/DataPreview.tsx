
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DataPreviewContainer } from './data-preview/DataPreviewContainer';

interface DataPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
}

export const DataPreview = ({ data, columns, fileName, onColumnTypeChange }: DataPreviewProps) => {
  return <DataPreviewContainer data={data} columns={columns} fileName={fileName} onColumnTypeChange={onColumnTypeChange} />;
};
