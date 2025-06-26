
import { ArrowUpDown } from 'lucide-react';

export const useDataFormatting = () => {
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'numeric': return 'bg-blue-500';
      case 'date': return 'bg-green-500';
      case 'categorical': return 'bg-purple-500';
      case 'text': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'numeric':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return String(value);
      default:
        return String(value);
    }
  };

  const getSortIcon = (columnName: string): JSX.Element => {
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return {
    getTypeColor,
    formatValue,
    getSortIcon
  };
};
