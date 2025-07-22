
import { DataRow, ColumnInfo } from '@/pages/Index';

export function detectCorrelationPatterns(data: DataRow[], columns: ColumnInfo[]): any[] {
  const patterns: any[] = [];
  
  // Find columns that tend to be null together
  const nullPatterns = new Map<string, number>();
  
  data.forEach(row => {
    const nullCols = columns
      .filter(col => row[col.name] == null || row[col.name] === '')
      .map(col => col.name)
      .sort()
      .join(',');
    
    if (nullCols && nullCols.includes(',')) {
      nullPatterns.set(nullCols, (nullPatterns.get(nullCols) || 0) + 1);
    }
  });
  
  nullPatterns.forEach((count, pattern) => {
    if (count > data.length * 0.1) {
      patterns.push({
        type: 'Correlation',
        description: `Columns [${pattern}] are frequently null together in ${count} rows`,
        confidence: count / data.length,
        columns: pattern.split(',')
      });
    }
  });
  
  return patterns;
}

export function detectTemporalPatterns(data: DataRow[], columns: ColumnInfo[]): any[] {
  const patterns: any[] = [];
  
  // Look for date columns and analyze temporal patterns
  const dateColumns = columns.filter(col => 
    col.type === 'date' || 
    col.name.toLowerCase().includes('date') ||
    col.name.toLowerCase().includes('time')
  );
  
  dateColumns.forEach(col => {
    const dates = data
      .map(row => row[col.name])
      .filter(date => date != null)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));
    
    if (dates.length > 10) {
      // Check for clustering around specific periods
      const dayOfWeek = new Map<number, number>();
      dates.forEach(date => {
        const day = date.getDay();
        dayOfWeek.set(day, (dayOfWeek.get(day) || 0) + 1);
      });
      
      const maxDayCount = Math.max(...dayOfWeek.values());
      if (maxDayCount > dates.length * 0.4) {
        patterns.push({
          type: 'Temporal',
          description: `${col.name} shows clustering on specific days of the week`,
          confidence: maxDayCount / dates.length,
          columns: [col.name]
        });
      }
    }
  });
  
  return patterns;
}

export function detectCategoricalPatterns(data: DataRow[], columns: ColumnInfo[]): any[] {
  const patterns: any[] = [];
  
  const categoricalColumns = columns.filter(col => col.type === 'text');
  
  categoricalColumns.forEach(col => {
    const values = data.map(row => row[col.name]).filter(val => val != null && val !== '');
    const uniqueValues = new Set(values);
    
    // High cardinality check
    if (uniqueValues.size > values.length * 0.8 && values.length > 50) {
      patterns.push({
        type: 'High Cardinality',
        description: `${col.name} has very high cardinality (${uniqueValues.size}/${values.length} unique values)`,
        confidence: uniqueValues.size / values.length,
        columns: [col.name]
      });
    }
    
    // Dominant value pattern
    const valueCounts = new Map<string, number>();
    values.forEach(val => {
      valueCounts.set(String(val), (valueCounts.get(String(val)) || 0) + 1);
    });
    
    const maxCount = Math.max(...valueCounts.values());
    if (maxCount > values.length * 0.7) {
      patterns.push({
        type: 'Dominant Value',
        description: `${col.name} is dominated by a single value (${(maxCount / values.length * 100).toFixed(1)}%)`,
        confidence: maxCount / values.length,
        columns: [col.name]
      });
    }
  });
  
  return patterns;
}

// Main export function that combines all pattern discovery methods
export function discoverPatterns(data: DataRow[], columns: ColumnInfo[]): { patterns: any[] } {
  const allPatterns: any[] = [];
  
  // Combine all pattern detection methods
  allPatterns.push(...detectCorrelationPatterns(data, columns));
  allPatterns.push(...detectTemporalPatterns(data, columns));
  allPatterns.push(...detectCategoricalPatterns(data, columns));
  
  return { patterns: allPatterns };
}
