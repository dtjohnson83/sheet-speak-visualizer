import { Badge } from '@/components/ui/badge';
import { ColumnInfo } from '@/types/data';

interface ColumnBadgesProps {
  columns: ColumnInfo[];
  getTypeColor: (type: string) => string;
}

export const ColumnBadges = ({ columns, getTypeColor }: ColumnBadgesProps) => {
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

