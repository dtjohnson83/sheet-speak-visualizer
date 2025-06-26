
import { DataRow } from '@/pages/Index';
import { FilterCondition } from '@/components/dashboard/DashboardFilters';

export const applyFilters = (data: DataRow[], filters: FilterCondition[]): DataRow[] => {
  if (filters.length === 0) return data;

  return data.filter(row => {
    return filters.every(filter => {
      const value = row[filter.column];
      const filterValue = filter.value;

      if (value === null || value === undefined) return false;
      if (filterValue === '') return true;

      const stringValue = String(value).toLowerCase();
      const stringFilterValue = String(filterValue).toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return stringValue === stringFilterValue;
        case 'not_equals':
          return stringValue !== stringFilterValue;
        case 'contains':
          return stringValue.includes(stringFilterValue);
        case 'greater_than':
          const numValue = Number(value);
          const numFilterValue = Number(filterValue);
          return !isNaN(numValue) && !isNaN(numFilterValue) && numValue > numFilterValue;
        case 'less_than':
          const numValue2 = Number(value);
          const numFilterValue2 = Number(filterValue);
          return !isNaN(numValue2) && !isNaN(numFilterValue2) && numValue2 < numFilterValue2;
        default:
          return true;
      }
    });
  });
};
