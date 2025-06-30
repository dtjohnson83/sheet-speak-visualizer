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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  }
};
