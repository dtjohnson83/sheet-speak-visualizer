
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit3, Check, X } from 'lucide-react';
import { ColumnInfo } from '@/pages/Index';

interface ColumnTypeOverrideProps {
  columns: ColumnInfo[];
  onColumnTypeChange: (columnName: string, newType: 'numeric' | 'date' | 'categorical' | 'text') => void;
}

export const ColumnTypeOverride = ({ columns, onColumnTypeChange }: ColumnTypeOverrideProps) => {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [tempType, setTempType] = useState<'numeric' | 'date' | 'categorical' | 'text'>('text');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numeric': return 'bg-green-100 text-green-800';
      case 'date': return 'bg-blue-100 text-blue-800';
      case 'categorical': return 'bg-purple-100 text-purple-800';
      case 'text': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditStart = (columnName: string, currentType: 'numeric' | 'date' | 'categorical' | 'text') => {
    setEditingColumn(columnName);
    setTempType(currentType);
  };

  const handleEditConfirm = () => {
    if (editingColumn) {
      onColumnTypeChange(editingColumn, tempType);
      setEditingColumn(null);
    }
  };

  const handleEditCancel = () => {
    setEditingColumn(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Column Types</h4>
        <p className="text-sm text-gray-600">
          Click the edit button to manually override column types
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column.name} className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" title={column.name}>
                {column.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {editingColumn === column.name ? (
                  <div className="flex items-center gap-2">
                    <Select value={tempType} onValueChange={(value: any) => setTempType(value)}>
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numeric">Numeric</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="categorical">Categorical</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" onClick={handleEditConfirm} className="h-7 w-7 p-0">
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleEditCancel} className="h-7 w-7 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className={`${getTypeColor(column.type)} text-xs`}>
                      {column.type}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditStart(column.name, column.type)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
