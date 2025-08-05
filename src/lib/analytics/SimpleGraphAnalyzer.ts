import { DataRow, ColumnInfo } from '@/pages/Index';

export interface SimpleGraphInsight {
  type: 'connections' | 'patterns' | 'groups' | 'outliers';
  title: string;
  description: string;
  examples: string[];
  confidence: number;
}

export class SimpleGraphAnalyzer {
  
  analyzeForConnections(data: DataRow[], columns: ColumnInfo[]): SimpleGraphInsight[] {
    const insights: SimpleGraphInsight[] = [];
    
    // Find potential connection patterns
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    if (categoricalColumns.length >= 2) {
      const col1 = categoricalColumns[0];
      const col2 = categoricalColumns[1];
      
      // Find items that appear together frequently
      const pairs = new Map<string, number>();
      data.forEach(row => {
        const val1 = String(row[col1.name] || 'Unknown');
        const val2 = String(row[col2.name] || 'Unknown');
        const pairKey = `${val1} -> ${val2}`;
        pairs.set(pairKey, (pairs.get(pairKey) || 0) + 1);
      });
      
      const topPairs = Array.from(pairs.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (topPairs.length > 0) {
        insights.push({
          type: 'connections',
          title: `Strong connections found between ${col1.name} and ${col2.name}`,
          description: `I found several items that are frequently connected in your data.`,
          examples: topPairs.map(([pair, count]) => `${pair} (appears ${count} times)`),
          confidence: 0.8
        });
      }
    }
    
    return insights;
  }
  
  analyzeForPatterns(data: DataRow[], columns: ColumnInfo[]): SimpleGraphInsight[] {
    const insights: SimpleGraphInsight[] = [];
    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    if (numericColumns.length > 0) {
      const column = numericColumns[0];
      const values = data
        .map(row => this.parseNumber(row[column.name]))
        .filter(val => val !== null) as number[];
      
      if (values.length > 10) {
        // Look for patterns in the data
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        
        // Check for potential patterns
        const highValues = values.filter(v => v > q3).length;
        const lowValues = values.filter(v => v < q1).length;
        const normalValues = values.length - highValues - lowValues;
        
        if (highValues < values.length * 0.1) {
          insights.push({
            type: 'patterns',
            title: `Most ${column.name} values follow a consistent pattern`,
            description: `${normalValues} out of ${values.length} values are in the normal range, with only ${highValues} high values.`,
            examples: [
              `Normal range: ${q1.toFixed(1)} - ${q3.toFixed(1)}`,
              `Median value: ${median.toFixed(1)}`,
              `${((normalValues / values.length) * 100).toFixed(1)}% of data follows the main pattern`
            ],
            confidence: 0.7
          });
        }
      }
    }
    
    return insights;
  }
  
  analyzeForGroups(data: DataRow[], columns: ColumnInfo[]): SimpleGraphInsight[] {
    const insights: SimpleGraphInsight[] = [];
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    
    if (categoricalColumns.length > 0) {
      const column = categoricalColumns[0];
      const groups = new Map<string, number>();
      
      data.forEach(row => {
        const value = String(row[column.name] || 'Unknown');
        groups.set(value, (groups.get(value) || 0) + 1);
      });
      
      const sortedGroups = Array.from(groups.entries()).sort((a, b) => b[1] - a[1]);
      
      if (sortedGroups.length > 1) {
        const totalItems = data.length;
        const largestGroup = sortedGroups[0];
        const largestPercentage = ((largestGroup[1] / totalItems) * 100).toFixed(1);
        
        insights.push({
          type: 'groups',
          title: `Found ${sortedGroups.length} distinct groups in ${column.name}`,
          description: `Your data naturally separates into ${sortedGroups.length} different groups.`,
          examples: sortedGroups.slice(0, 3).map(([name, count]) => 
            `${name}: ${count} items (${((count / totalItems) * 100).toFixed(1)}%)`
          ),
          confidence: 0.9
        });
      }
    }
    
    return insights;
  }
  
  analyzeForOutliers(data: DataRow[], columns: ColumnInfo[]): SimpleGraphInsight[] {
    const insights: SimpleGraphInsight[] = [];
    const numericColumns = columns.filter(col => col.type === 'numeric');
    
    if (numericColumns.length > 0) {
      const column = numericColumns[0];
      const values = data
        .map(row => this.parseNumber(row[column.name]))
        .filter(val => val !== null) as number[];
      
      if (values.length > 5) {
        const sorted = [...values].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        const outliers = values.filter(v => v < lowerBound || v > upperBound);
        
        if (outliers.length > 0 && outliers.length < values.length * 0.1) {
          insights.push({
            type: 'outliers',
            title: `Found ${outliers.length} unusual values in ${column.name}`,
            description: `These values are significantly different from the rest of your data and might need attention.`,
            examples: outliers.slice(0, 3).map(val => 
              `${val} (${val > upperBound ? 'much higher' : 'much lower'} than normal)`
            ),
            confidence: 0.8
          });
        }
      }
    }
    
    return insights;
  }
  
  private parseNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }
}