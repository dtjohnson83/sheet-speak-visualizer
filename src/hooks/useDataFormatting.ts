
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

export const useDataFormatting = () => {
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

  const getSortIcon = (columnName: string, sortConfig: { key: string; direction: 'asc' | 'desc' } | null) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return ArrowUpDown;
    }
    
    return sortConfig.direction === 'asc' ? ArrowUp : ArrowDown;
  };

  return {
    getTypeColor,
    formatValue,
    getSortIcon
  };
};
