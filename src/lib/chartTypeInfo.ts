
export interface ChartTypeRequirement {
  type: 'categorical' | 'numeric' | 'date';
  label: string;
  required: boolean;
}

export interface ChartTypeInfo {
  id: string;
  name: string;
  description: string;
  requirements: {
    xAxis?: ChartTypeRequirement;
    yAxis?: ChartTypeRequirement;
    additional?: ChartTypeRequirement[];
  };
  bestFor: string[];
  examples: string[];
  commonMistakes: string[];
  minDataPoints: number;
}

export const CHART_TYPE_INFO: Record<string, ChartTypeInfo> = {
  bar: {
    id: 'bar',
    name: 'Bar Chart',
    description: 'Compare quantities across different categories using rectangular bars.',
    requirements: {
      xAxis: { type: 'categorical', label: 'Categories (X-axis)', required: true },
      yAxis: { type: 'numeric', label: 'Values (Y-axis)', required: true }
    },
    bestFor: [
      'Comparing quantities across categories',
      'Ranking items by value',
      'Showing discrete data'
    ],
    examples: [
      'Sales by Product Category',
      'Revenue by Month',
      'Employee Count by Department',
      'Customer Satisfaction Scores by Region'
    ],
    commonMistakes: [
      'Using too many categories (makes chart cluttered)',
      'Using continuous data instead of categories on X-axis'
    ],
    minDataPoints: 2
  },
  line: {
    id: 'line',
    name: 'Line Chart',
    description: 'Show trends and changes over time or continuous data.',
    requirements: {
      xAxis: { type: 'date', label: 'Time/Sequence (X-axis)', required: true },
      yAxis: { type: 'numeric', label: 'Values (Y-axis)', required: true }
    },
    bestFor: [
      'Showing trends over time',
      'Displaying continuous data',
      'Comparing multiple series'
    ],
    examples: [
      'Website Visitors Over Months',
      'Stock Price Changes',
      'Temperature Variations',
      'Sales Growth Over Time'
    ],
    commonMistakes: [
      'Using categorical data instead of time series',
      'Too many lines making chart unreadable'
    ],
    minDataPoints: 3
  },
  pie: {
    id: 'pie',
    name: 'Pie Chart',
    description: 'Show parts of a whole as percentages or proportions.',
    requirements: {
      xAxis: { type: 'categorical', label: 'Categories', required: true },
      yAxis: { type: 'numeric', label: 'Values', required: true }
    },
    bestFor: [
      'Showing parts of a whole',
      'Displaying percentages',
      'Simple composition analysis'
    ],
    examples: [
      'Market Share by Company',
      'Budget Allocation by Category',
      'Survey Response Distribution',
      'Traffic Sources'
    ],
    commonMistakes: [
      'Using too many slices (>7 categories)',
      'Using negative values',
      'Using for time series data'
    ],
    minDataPoints: 2
  },
  scatter: {
    id: 'scatter',
    name: 'Scatter Plot',
    description: 'Explore relationships and correlations between two numeric variables.',
    requirements: {
      xAxis: { type: 'numeric', label: 'First Variable (X-axis)', required: true },
      yAxis: { type: 'numeric', label: 'Second Variable (Y-axis)', required: true }
    },
    bestFor: [
      'Finding correlations between variables',
      'Identifying outliers',
      'Exploring data relationships'
    ],
    examples: [
      'Height vs Weight',
      'Advertising Spend vs Sales',
      'Experience vs Salary',
      'Temperature vs Ice Cream Sales'
    ],
    commonMistakes: [
      'Using categorical data',
      'Not having enough data points for meaningful analysis'
    ],
    minDataPoints: 10
  },
  histogram: {
    id: 'histogram',
    name: 'Histogram',
    description: 'Show the distribution and frequency of a single numeric variable.',
    requirements: {
      xAxis: { type: 'numeric', label: 'Numeric Variable', required: true }
    },
    bestFor: [
      'Understanding data distribution',
      'Identifying patterns in numeric data',
      'Finding data skewness'
    ],
    examples: [
      'Age Distribution of Customers',
      'Salary Ranges in Company',
      'Test Score Distribution',
      'Product Prices'
    ],
    commonMistakes: [
      'Using categorical data',
      'Having too few or too many bins'
    ],
    minDataPoints: 20
  },
  heatmap: {
    id: 'heatmap',
    name: 'Heatmap',
    description: 'Show intensity or density across two categorical dimensions.',
    requirements: {
      xAxis: { type: 'categorical', label: 'First Dimension (X-axis)', required: true },
      yAxis: { type: 'categorical', label: 'Second Dimension (Y-axis)', required: true },
      additional: [{ type: 'numeric', label: 'Intensity Values', required: true }]
    },
    bestFor: [
      'Showing patterns across two dimensions',
      'Identifying hotspots or correlations',
      'Comparing intensities'
    ],
    examples: [
      'Sales by Region and Month',
      'Website Clicks by Day and Hour',
      'Customer Activity by Age Group and Product',
      'Error Rates by System and Time'
    ],
    commonMistakes: [
      'Using continuous data for dimensions',
      'Too many categories making it unreadable'
    ],
    minDataPoints: 9
  },
  treemap: {
    id: 'treemap',
    name: 'Tree Map',
    description: 'Display hierarchical data with proportional rectangular sizes.',
    requirements: {
      xAxis: { type: 'categorical', label: 'Categories', required: true },
      yAxis: { type: 'numeric', label: 'Size Values', required: true }
    },
    bestFor: [
      'Showing hierarchical data',
      'Comparing proportional sizes',
      'Space-efficient visualization'
    ],
    examples: [
      'Company Departments by Headcount',
      'Product Categories by Revenue',
      'File Sizes in Folders',
      'Budget Allocation'
    ],
    commonMistakes: [
      'Using negative values',
      'Too many small categories'
    ],
    minDataPoints: 3
  },
  sankey: {
    id: 'sankey',
    name: 'Sankey Diagram',
    description: 'Visualize flow and connections between different stages or categories.',
    requirements: {
      xAxis: { type: 'categorical', label: 'Source Categories', required: true },
      additional: [
        { type: 'categorical', label: 'Target Categories', required: true },
        { type: 'numeric', label: 'Flow Values', required: true }
      ]
    },
    bestFor: [
      'Showing flow between categories',
      'Visualizing process stages',
      'Tracking conversions'
    ],
    examples: [
      'Customer Journey Paths',
      'Budget Flow Between Departments',
      'Energy Flow Diagrams',
      'Website Navigation Paths'
    ],
    commonMistakes: [
      'Circular flows (source = target)',
      'Too complex with many nodes'
    ],
    minDataPoints: 3
  },
  'stacked-bar': {
    id: 'stacked-bar',
    name: 'Stacked Bar Chart',
    description: 'Compare totals while showing the composition of each category.',
    requirements: {
      xAxis: { type: 'categorical', label: 'Main Categories (X-axis)', required: true },
      yAxis: { type: 'numeric', label: 'Values (Y-axis)', required: true },
      additional: [{ type: 'categorical', label: 'Stack Categories', required: true }]
    },
    bestFor: [
      'Comparing totals and their composition',
      'Showing part-to-whole relationships over categories',
      'Multi-dimensional comparisons'
    ],
    examples: [
      'Sales by Quarter, Split by Product Type',
      'Population by City, Split by Age Group',
      'Revenue by Region, Split by Channel',
      'Expenses by Month, Split by Category'
    ],
    commonMistakes: [
      'Too many stack categories making it confusing',
      'Using for time series without proper ordering'
    ],
    minDataPoints: 4
  }
};

export const getChartTypeInfo = (chartType: string): ChartTypeInfo | null => {
  return CHART_TYPE_INFO[chartType] || null;
};

export const validateChartRequirements = (
  chartType: string,
  xColumn: string,
  yColumn: string,
  columns: Array<{ name: string; type: 'numeric' | 'categorical' | 'date' | 'text' }>,
  dataLength: number
): { isValid: boolean; issues: string[]; suggestions: string[] } => {
  const info = getChartTypeInfo(chartType);
  if (!info) return { isValid: false, issues: ['Unknown chart type'], suggestions: [] };

  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check minimum data points
  if (dataLength < info.minDataPoints) {
    issues.push(`This chart type needs at least ${info.minDataPoints} data points. You have ${dataLength}.`);
  }

  // Find column types
  const xColumnInfo = columns.find(col => col.name === xColumn);
  const yColumnInfo = columns.find(col => col.name === yColumn);

  // Validate X-axis requirements
  if (info.requirements.xAxis && xColumn) {
    if (!xColumnInfo) {
      issues.push('Selected X-axis column not found');
    } else {
      const requiredType = info.requirements.xAxis.type;
      const actualType = xColumnInfo.type === 'text' ? 'categorical' : xColumnInfo.type;
      
      if (requiredType !== actualType) {
        issues.push(`X-axis needs ${requiredType} data, but "${xColumn}" is ${actualType}`);
        
        // Suggest alternative columns
        const compatibleColumns = columns.filter(col => {
          const colType = col.type === 'text' ? 'categorical' : col.type;
          return colType === requiredType;
        });
        
        if (compatibleColumns.length > 0) {
          suggestions.push(`Try using: ${compatibleColumns.map(c => c.name).join(', ')} for X-axis`);
        }
      }
    }
  }

  // Validate Y-axis requirements
  if (info.requirements.yAxis && yColumn) {
    if (!yColumnInfo) {
      issues.push('Selected Y-axis column not found');
    } else {
      const requiredType = info.requirements.yAxis.type;
      const actualType = yColumnInfo.type === 'text' ? 'categorical' : yColumnInfo.type;
      
      if (requiredType !== actualType) {
        issues.push(`Y-axis needs ${requiredType} data, but "${yColumn}" is ${actualType}`);
        
        // Suggest alternative columns
        const compatibleColumns = columns.filter(col => {
          const colType = col.type === 'text' ? 'categorical' : col.type;
          return colType === requiredType;
        });
        
        if (compatibleColumns.length > 0) {
          suggestions.push(`Try using: ${compatibleColumns.map(c => c.name).join(', ')} for Y-axis`);
        }
      }
    }
  }

  // Missing required selections
  if (info.requirements.xAxis?.required && !xColumn) {
    issues.push(`Please select a ${info.requirements.xAxis.label}`);
  }
  
  if (info.requirements.yAxis?.required && !yColumn) {
    issues.push(`Please select a ${info.requirements.yAxis.label}`);
  }

  return {
    isValid: issues.length === 0 && dataLength >= info.minDataPoints,
    issues,
    suggestions
  };
};
