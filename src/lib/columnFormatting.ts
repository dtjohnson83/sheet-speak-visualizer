
import { ColumnFormat } from '@/components/data-preview/ColumnFormatting';

export const formatCellValue = (value: any, columnFormat: ColumnFormat): string => {
  if (value === null || value === undefined || value === '') return '';

  try {
    switch (columnFormat.type) {
      case 'numeric': {
        const numValue = Number(value);
        if (isNaN(numValue)) return String(value);
        
        let formatted = numValue.toFixed(columnFormat.decimals || 2);
        
        if (columnFormat.showThousandsSeparator) {
          const parts = formatted.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          formatted = parts.join('.');
        }
        
        const prefix = columnFormat.prefix || '';
        const suffix = columnFormat.suffix || '';
        
        return `${prefix}${formatted}${suffix}`;
      }
      
      case 'date': {
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        
        const format = columnFormat.dateFormat || 'YYYY-MM-DD';
        
        switch (format) {
          case 'MM/DD/YYYY':
            return date.toLocaleDateString('en-US');
          case 'DD/MM/YYYY':
            return date.toLocaleDateString('en-GB');
          case 'MMM DD, YYYY':
            return date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          case 'MMMM DD, YYYY':
            return date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          case 'DD MMM YYYY':
            return date.toLocaleDateString('en-GB', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          case 'YYYY-MM-DD':
          default:
            return date.toLocaleDateString('en-CA'); // ISO format
        }
      }
      
      default:
        return String(value);
    }
  } catch {
    return String(value);
  }
};

export const getDefaultColumnFormat = (columnName: string, columnType: string): ColumnFormat => {
  return {
    columnName,
    type: columnType as any,
    format: 'default',
    decimals: 2,
    showThousandsSeparator: true,
    dateFormat: 'YYYY-MM-DD'
  };
};
