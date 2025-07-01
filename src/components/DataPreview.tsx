
import { DataRow, ColumnInfo } from '@/pages/Index';
import { DataPreviewContainer } from './data-preview/DataPreviewContainer';

interface DataPreviewProps {
  data: DataRow[];
  columns: ColumnInfo[];
  fileName: string;
}

export const DataPreview = ({ data, columns, fileName }: DataPreviewProps) => {
  return <DataPreviewContainer data={data} columns={columns} fileName={fileName} />;
};
