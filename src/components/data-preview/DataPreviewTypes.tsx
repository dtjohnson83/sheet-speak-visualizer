import { Badge } from '@/components/ui/badge';
import { ColumnInfo } from '@/pages/Index';

interface DataPreviewTypesProps {
  columns: ColumnInfo[];
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'numeric': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'date': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'categorical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export const DataPreviewTypes = ({ columns }: DataPreviewTypesProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {columns.map((column) => (
        <Badge key={column.name} className={getTypeColor(column.type)}>
          {column.name} ({column.type})
        </Badge>
      ))}
    </div>
  );
};