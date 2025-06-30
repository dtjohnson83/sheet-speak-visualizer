
export const chartTypeInfo = {
  bar: {
    name: 'Bar Chart',
    description: 'Compare values across different categories with vertical bars',
    requiredColumns: ['x', 'y'],
    optionalColumns: ['series'],
    category: 'comparison',
    icon: 'bar-chart',
    configurable: {
      aggregation: true,
      sorting: true,
      stacking: true,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'categorical or date' },
      yAxis: { label: 'Y-axis', type: 'numeric' }
    },
    minDataPoints: 1,
    bestFor: ['Comparing values across categories', 'Showing rankings', 'Displaying survey results'],
    examples: ['Sales by region', 'Product ratings', 'Monthly revenue'],
    commonMistakes: ['Using too many categories without proper sorting', 'Not aggregating duplicate categories']
  },
  line: {
    name: 'Line Chart',
    description: 'Show trends over time or continuous data with a connected line',
    requiredColumns: ['x', 'y'],
    optionalColumns: ['series'],
    category: 'trend',
    icon: 'line-chart',
    configurable: {
      aggregation: true,
      sorting: true,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'date or numeric' },
      yAxis: { label: 'Y-axis', type: 'numeric' }
    },
    minDataPoints: 2,
    bestFor: ['Showing trends over time', 'Displaying continuous data', 'Tracking changes'],
    examples: ['Stock prices over time', 'Website traffic', 'Temperature changes'],
    commonMistakes: ['Using categorical data on X-axis', 'Not sorting time series data']
  },
  area: {
    name: 'Area Chart',
    description: 'Highlight the magnitude of changes over time with filled areas',
    requiredColumns: ['x', 'y'],
    optionalColumns: ['series'],
    category: 'trend',
    icon: 'area-chart',
    configurable: {
      aggregation: true,
      sorting: true,
      stacking: true,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'date or numeric' },
      yAxis: { label: 'Y-axis', type: 'numeric' }
    },
    minDataPoints: 2,
    bestFor: ['Showing cumulative values', 'Displaying stacked data over time', 'Emphasizing magnitude'],
    examples: ['Revenue by product line over time', 'Website traffic sources', 'Budget allocation'],
    commonMistakes: ['Overlapping areas without stacking', 'Using too many series']
  },
  pie: {
    name: 'Pie Chart',
    description: 'Show proportions of a whole with a circular chart',
    requiredColumns: ['x', 'y'],
    optionalColumns: [],
    category: 'distribution',
    icon: 'pie-chart',
    configurable: {
      aggregation: true,
      sorting: true,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Categories', type: 'categorical' },
      yAxis: { label: 'Values', type: 'numeric' }
    },
    minDataPoints: 2,
    bestFor: ['Showing parts of a whole', 'Displaying percentages', 'Market share analysis'],
    examples: ['Market share by company', 'Expense breakdown', 'Survey responses'],
    commonMistakes: ['Using too many categories', 'Negative values', 'Time series data']
  },
  scatter: {
    name: 'Scatter Plot',
    description: 'Display the relationship between two variables with points',
    requiredColumns: ['x', 'y'],
    optionalColumns: ['series'],
    category: 'relationship',
    icon: 'scatter-chart',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: false,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'numeric' },
      yAxis: { label: 'Y-axis', type: 'numeric' }
    },
    minDataPoints: 3,
    bestFor: ['Showing correlations', 'Identifying outliers', 'Exploring relationships'],
    examples: ['Height vs weight', 'Price vs quality rating', 'Age vs income'],
    commonMistakes: ['Using categorical data', 'Too many overlapping points']
  },
  heatmap: {
    name: 'Heatmap',
    description: 'Visualize the magnitude of a phenomenon as color in two dimensions',
    requiredColumns: ['x', 'y', 'value'],
    optionalColumns: [],
    category: 'distribution',
    icon: 'heatmap',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: false,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'categorical' },
      yAxis: { label: 'Y-axis', type: 'categorical' },
      additional: [{ label: 'Value', type: 'numeric' }]
    },
    minDataPoints: 4,
    bestFor: ['Showing patterns in 2D data', 'Correlation matrices', 'Geographic data'],
    examples: ['Sales by region and month', 'User activity by hour and day', 'Correlation matrix'],
    commonMistakes: ['Too many categories', 'Missing data points']
  },
  histogram: {
    name: 'Histogram',
    description: 'Show the distribution of numerical data',
    requiredColumns: ['x'],
    optionalColumns: [],
    category: 'distribution',
    icon: 'histogram',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: false,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Values', type: 'numeric' }
    },
    minDataPoints: 10,
    bestFor: ['Showing data distribution', 'Identifying patterns', 'Quality control'],
    examples: ['Age distribution', 'Test scores', 'Response times'],
    commonMistakes: ['Too few data points', 'Wrong bin size']
  },
  sankey: {
    name: 'Sankey Diagram',
    description: 'Visualize flow from one set of values to another',
    requiredColumns: ['source', 'target', 'value'],
    optionalColumns: [],
    category: 'relationship',
    icon: 'sankey',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: false,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Source', type: 'categorical' },
      yAxis: { label: 'Target', type: 'categorical' },
      additional: [{ label: 'Value', type: 'numeric' }]
    },
    minDataPoints: 3,
    bestFor: ['Showing flow between categories', 'Process visualization', 'Budget allocation'],
    examples: ['Energy flow', 'Budget allocation', 'User journey'],
    commonMistakes: ['Circular flows', 'Too many small flows']
  },
  treemap: {
    name: 'Treemap',
    description: 'Display hierarchical data as a set of nested rectangles',
    requiredColumns: ['name', 'value'],
    optionalColumns: [],
    category: 'distribution',
    icon: 'treemap',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: false,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Category', type: 'categorical' },
      yAxis: { label: 'Value', type: 'numeric' }
    },
    minDataPoints: 3,
    bestFor: ['Hierarchical data', 'Proportional representation', 'Space-efficient display'],
    examples: ['Disk usage by folder', 'Portfolio allocation', 'Company structure'],
    commonMistakes: ['Too many small values', 'Deep hierarchies']
  },
  topX: {
    name: 'Top X',
    description: 'Show the top X values for a given category',
    requiredColumns: ['x', 'y'],
    optionalColumns: [],
    category: 'comparison',
    icon: 'list',
    configurable: {
      aggregation: true,
      sorting: true,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Categories', type: 'categorical' },
      yAxis: { label: 'Values', type: 'numeric' }
    },
    minDataPoints: 3,
    bestFor: ['Showing rankings', 'Highlighting top performers', 'Focus on best/worst'],
    examples: ['Top 10 products', 'Best performing regions', 'Highest scores'],
    commonMistakes: ['Not setting appropriate limit', 'Wrong sort direction']
  },
  kpi: {
    name: 'KPI Card',
    description: 'Display key performance indicators as summary cards',
    requiredColumns: ['value'],
    optionalColumns: ['label', 'target', 'previous'],
    category: 'summary',
    icon: 'square',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: false,
      colors: true
    },
    requirements: {
      yAxis: { label: 'Value', type: 'numeric' }
    },
    minDataPoints: 1,
    bestFor: ['Executive dashboards', 'Key metrics summary', 'Performance monitoring'],
    examples: ['Revenue this month', 'User growth rate', 'Conversion rate'],
    commonMistakes: ['Too many KPIs', 'Missing context']
  }
};

export type ChartTypeInfo = typeof chartTypeInfo[keyof typeof chartTypeInfo];

export const getChartTypeInfo = (chartType: string): ChartTypeInfo | null => {
  return chartTypeInfo[chartType as keyof typeof chartTypeInfo] || null;
};

export const validateChartRequirements = (chartType: string, xColumn: string, yColumn: string, columns: any[], dataLength: number) => {
  const info = getChartTypeInfo(chartType);
  if (!info) return { isValid: false, issues: ['Unknown chart type'], suggestions: [] };

  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check minimum data points
  if (dataLength < info.minDataPoints) {
    issues.push(`This chart type requires at least ${info.minDataPoints} data points (you have ${dataLength})`);
  }

  // Check required columns
  if (info.requirements.xAxis && !xColumn) {
    issues.push(`X-axis column is required for ${info.name}`);
    suggestions.push(`Select a ${info.requirements.xAxis.type} column for the X-axis`);
  }

  if (info.requirements.yAxis && !yColumn && chartType !== 'histogram') {
    issues.push(`Y-axis column is required for ${info.name}`);
    suggestions.push(`Select a ${info.requirements.yAxis.type} column for the Y-axis`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
};
