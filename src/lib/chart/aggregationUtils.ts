
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';

export const applyAggregation = (values: number[], method: AggregationMethod): number => {
  if (values.length === 0) return 0;
  
  switch (method) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'average':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'count':
      return values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.reduce((sum, val) => sum + val, 0);
  }
};
