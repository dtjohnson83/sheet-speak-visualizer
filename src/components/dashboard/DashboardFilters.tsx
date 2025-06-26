
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Plus } from 'lucide-react';
import { DataRow, ColumnInfo } from '@/pages/Index';

export interface FilterCondition {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
  value: string;
}

interface DashboardFiltersProps {
  columns: ColumnInfo[];
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
}

export const DashboardFilters = ({ columns, filters, onFiltersChange }: DashboardFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      column: columns[0]?.name || '',
      operator: 'equals',
      value: ''
    };
    onFiltersChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onFiltersChange(filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    ));
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(filter => filter.id !== id));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const getOperatorOptions = (columnType: string) => {
    const baseOptions = [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not equals' },
      { value: 'contains', label: 'Contains' }
    ];

    if (columnType === 'numeric') {
      baseOptions.push(
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' }
      );
    }

    return baseOptions;
  };

  if (filters.length === 0 && !isExpanded) {
    return (
      <Card className="p-3 mb-4">
        <Button variant="outline" onClick={() => setIsExpanded(true)} className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Add Filters
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Dashboard Filters
        </h3>
        <div className="flex space-x-2">
          {filters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={addFilter}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="space-y-3">
          {filters.map((filter) => {
            const column = columns.find(col => col.name === filter.column);
            const operatorOptions = getOperatorOptions(column?.type || 'text');

            return (
              <div key={filter.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <Select
                  value={filter.column}
                  onValueChange={(value) => updateFilter(filter.id, { column: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.name} value={col.name}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(value: any) => updateFilter(filter.id, { operator: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  placeholder="Filter value..."
                  className="flex-1"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2 mt-3">
            {filters.map((filter) => (
              <Badge key={filter.id} variant="secondary" className="text-xs">
                {filter.column} {filter.operator.replace('_', ' ')} "{filter.value}"
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
