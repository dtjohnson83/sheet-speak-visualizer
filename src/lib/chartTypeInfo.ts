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
  'treemap3d': {
    name: '3D Treemap',
    description: 'Display hierarchical data with 3D boxes sized by value and depth representing magnitude',
    requiredColumns: ['name', 'value'],
    optionalColumns: [],
    category: '3d',
    icon: 'box',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Category', type: 'categorical' },
      yAxis: { label: 'Value', type: 'numeric' }
    },
    minDataPoints: 3,
    bestFor: ['3D visualization of hierarchical data', 'Interactive exploration of proportions', 'Modern visual presentations'],
    examples: ['3D market share visualization', '3D budget allocation', '3D portfolio breakdown'],
    commonMistakes: ['Using with too few categories', 'Overusing animation', 'Not considering viewing angles']
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
  },
  bar3d: {
    name: '3D Bar Chart',
    description: 'Compare values with immersive 3D vertical bars',
    requiredColumns: ['x', 'y'],
    optionalColumns: ['z'],
    category: '3d',
    icon: 'bar-chart',
    configurable: {
      aggregation: true,
      sorting: true,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'categorical' },
      yAxis: { label: 'Y-axis (Height)', type: 'numeric' }
    },
    minDataPoints: 1,
    bestFor: ['3D data visualization', 'Interactive presentations', 'Immersive analytics'],
    examples: ['3D sales by region', '3D product performance', '3D survey results'],
    commonMistakes: ['Too many categories for 3D space', 'Not considering viewing angles']
  },
  scatter3d: {
    name: '3D Scatter Plot',
    description: 'Explore relationships between three variables in 3D space',
    requiredColumns: ['x', 'y', 'z'],
    optionalColumns: [],
    category: '3d',
    icon: 'scatter-chart',
    configurable: {
      aggregation: false,
      sorting: false,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'numeric' },
      yAxis: { label: 'Y-axis', type: 'numeric' },
      additional: [{ label: 'Z-axis', type: 'numeric' }]
    },
    minDataPoints: 3,
    bestFor: ['Multi-dimensional correlations', '3D data exploration', 'Scientific visualization'],
    examples: ['Height vs weight vs age', '3D clustering analysis', 'Multi-factor relationships'],
    commonMistakes: ['Too many overlapping points', 'Not all three axes being numeric']
  },
  surface3d: {
    name: '3D Surface Plot',
    description: 'Visualize continuous data as a 3D surface',
    requiredColumns: ['x', 'y', 'z'],
    optionalColumns: [],
    category: '3d',
    icon: 'heatmap',
    configurable: {
      aggregation: false,
      sorting: false,
      stacking: false,
      dataLabels: false,
      colors: true
    },
    requirements: {
      xAxis: { label: 'X-axis', type: 'numeric' },
      yAxis: { label: 'Y-axis', type: 'numeric' },
      additional: [{ label: 'Z-axis (Height)', type: 'numeric' }]
    },
    minDataPoints: 9,
    bestFor: ['3D continuous data', 'Surface modeling', 'Topographic visualization'],
    examples: ['Elevation maps', '3D response surfaces', 'Temperature distributions'],
    commonMistakes: ['Insufficient data points', 'Non-continuous data']
  },
  network: {
    name: 'Network Graph',
    description: 'Visualize relationships and connections between entities',
    requiredColumns: ['source', 'target'],
    optionalColumns: ['weight'],
    category: 'graph',
    icon: 'network',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Source Entity', type: 'categorical' },
      yAxis: { label: 'Target Entity', type: 'categorical' }
    },
    minDataPoints: 3,
    bestFor: ['Network analysis', 'Relationship mapping', 'Social network visualization'],
    examples: ['Social connections', 'Organization charts', 'Workflow dependencies'],
    commonMistakes: ['Too many isolated nodes', 'Unclear entity relationships']
  },
  network3d: {
    name: '3D Network Graph',
    description: 'Interactive 3D visualization of network relationships',
    requiredColumns: ['source', 'target'],
    optionalColumns: ['weight'],
    category: 'graph',
    icon: 'network',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Source Entity', type: 'categorical' },
      yAxis: { label: 'Target Entity', type: 'categorical' }
    },
    minDataPoints: 5,
    bestFor: ['Complex network exploration', '3D relationship analysis', 'Immersive network visualization'],
    examples: ['3D social networks', 'System architecture', 'Knowledge graphs'],
    commonMistakes: ['Overcrowded 3D space', 'Poor camera positioning']
  },
  'entity-relationship': {
    name: 'Entity-Relationship Diagram',
    description: 'Structured diagram showing entities and their relationships',
    requiredColumns: ['entity1', 'entity2'],
    optionalColumns: ['relationship_type'],
    category: 'graph',
    icon: 'database',
    configurable: {
      aggregation: true,
      sorting: false,
      stacking: false,
      dataLabels: true,
      colors: true
    },
    requirements: {
      xAxis: { label: 'Primary Entity', type: 'categorical' },
      yAxis: { label: 'Related Entity', type: 'categorical' }
    },
    minDataPoints: 2,
    bestFor: ['Database design', 'System modeling', 'Knowledge representation'],
    examples: ['Database schemas', 'Business process models', 'Ontology visualization'],
    commonMistakes: ['Too many attributes per entity', 'Unclear relationship types']
  },
  map2d: {
    name: '2D Map',
    description: 'Interactive 2D geographic visualization with point plotting and choropleth mapping',
    requiredColumns: ['x', 'y'],
    optionalColumns: ['series', 'value'],
    category: 'geospatial',
    icon: 'map-pin',
    configurable: {
      aggregation: false,
      series: true,
      temporal: true,
      colors: true,
      dataLabels: false
    },
    requirements: {
      xAxis: { label: 'Longitude', type: 'numeric' },
      yAxis: { label: 'Latitude', type: 'numeric' }
    },
    minDataPoints: 1,
    bestFor: ['Geographic data analysis', 'Location-based insights', 'Regional comparisons'],
    examples: ['Store locations', 'Sales by region', 'Population distribution'],
    commonMistakes: ['Invalid coordinate ranges', 'Missing geographic context']
  },
  map3d: {
    name: '3D Map',
    description: 'Immersive 3D geographic visualization with terrain and elevation mapping',
    requiredColumns: ['x', 'y'],
    optionalColumns: ['z', 'series', 'value'],
    category: 'geospatial',
    icon: 'mountain',
    configurable: {
      aggregation: false,
      series: true,
      temporal: true,
      colors: true,
      dataLabels: false
    },
    requirements: {
      xAxis: { label: 'Longitude', type: 'numeric' },
      yAxis: { label: 'Latitude', type: 'numeric' },
      additional: [{ label: 'Elevation/Value', type: 'numeric' }]
    },
    minDataPoints: 1,
    bestFor: ['3D geographic analysis', 'Elevation data', 'Multi-dimensional location data'],
    examples: ['Elevation maps', 'Building heights', '3D population density'],
    commonMistakes: ['Invalid coordinate ranges', 'Poor elevation scaling', 'Overwhelming 3D effects']
  },
  
  'timeseries3d': {
    name: '3D Time Series Cube',
    description: 'Interactive 3D visualization showing time series data as connected cubes in space',
    requiredColumns: ['time', 'value'],
    optionalColumns: ['series'],
    category: '3d',
    icon: 'box',
    configurable: {
      aggregation: true,
      animation: true,
      dataLabels: true,
      colors: true,
      temporal: true
    },
    requirements: {
      xAxis: { label: 'Time', type: 'date' },
      yAxis: { label: 'Value', type: 'numeric' },
      additional: []
    },
    minDataPoints: 3,
    bestFor: ['Time series trends', 'Temporal patterns', 'Value progression over time'],
    examples: ['Stock prices over time', 'Temperature trends', 'Sales progression'],
    commonMistakes: ['Non-temporal x-axis', 'Too many data points causing clutter', 'Poor time sorting']
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

  // Check required columns - handle different requirement structures
  const requirements = info.requirements;
  
  if ('xAxis' in requirements && !xColumn) {
    issues.push(`X-axis column is required for ${info.name}`);
    suggestions.push(`Select a ${requirements.xAxis.type} column for the X-axis`);
  }

  if ('yAxis' in requirements && !yColumn && chartType !== 'histogram') {
    issues.push(`Y-axis column is required for ${info.name}`);
    suggestions.push(`Select a ${requirements.yAxis.type} column for the Y-axis`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
};
