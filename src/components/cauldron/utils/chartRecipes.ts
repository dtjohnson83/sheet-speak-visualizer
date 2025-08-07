import { ChartRecipe } from './recipeEngine';

/**
 * Chart Recipe Definitions
 * 
 * This file contains all chart recipe configurations used by the Recipe Engine.
 * Each recipe defines the requirements and characteristics for specific chart types.
 */
export const CHART_RECIPES: ChartRecipe[] = [
  // === TEMPORAL ESSENCE RECIPES ===
  {
    id: 'temporal-essence-line',
    name: 'Temporal Essence Line Potion',
    chartType: 'line',
    confidence: 0.95,
    reasoning: 'Time-based data flows naturally through line visualizations, revealing trends and patterns',
    requiredIngredients: {
      primary: ['temporal'],
      secondary: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Shows trends over time', 'Reveals seasonal patterns', 'Highlights growth cycles']
  },
  {
    id: 'multi-dimensional-area',
    name: 'Multi-dimensional Area Brew',
    chartType: 'area',
    confidence: 0.8,
    reasoning: 'Stacked areas show how parts contribute to the whole over time',
    requiredIngredients: {
      primary: ['temporal'],
      secondary: ['numeric'],
      optional: ['categorical']
    },
    optimalColumns: {},
    magicalEffects: ['Shows cumulative effects', 'Reveals composition changes', 'Stacks contributions']
  },

  // === CATEGORICAL POWER RECIPES ===
  {
    id: 'categorical-power-bar',
    name: 'Categorical Power Bar Elixir',
    chartType: 'bar',
    confidence: 0.9,
    reasoning: 'Categories naturally separate into distinct bars, perfect for comparisons',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Compares categories clearly', 'Ranks performance', 'Shows distribution']
  },
  {
    id: 'proportional-pie-spell',
    name: 'Proportional Pie Spell',
    chartType: 'pie',
    confidence: 0.85,
    reasoning: 'When categories form a complete whole, pie charts reveal proportional relationships',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Shows parts of whole', 'Reveals proportions', 'Highlights dominance']
  },
  {
    id: 'hierarchy-treemap-potion',
    name: 'Hierarchy Treemap Potion',
    chartType: 'treemap',
    confidence: 0.82,
    reasoning: 'Nested categorical data forms natural hierarchies perfect for treemap visualization',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['numeric'],
      optional: ['categorical']
    },
    optimalColumns: {},
    magicalEffects: ['Shows hierarchical structure', 'Reveals size relationships', 'Nested proportions']
  },

  // === FREQUENCY & DISTRIBUTION RECIPES ===
  {
    id: 'histogram-transmutation',
    name: 'Histogram Transmutation Brew',
    chartType: 'histogram',
    confidence: 0.87, // Confidence chosen based on strong single-variable distribution visualization capability
    reasoning: 'Single numeric column reveals its distribution through frequency binning',
    requiredIngredients: {
      primary: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Shows data distribution', 'Reveals frequency patterns', 'Identifies data clusters']
  },

  // === CORRELATION & SCATTER RECIPES ===
  {
    id: 'correlation-scatter-matrix',
    name: 'Correlation Scatter Matrix',
    chartType: 'scatter',
    confidence: 0.88,
    reasoning: 'Two numeric dimensions create perfect correlation landscapes',
    requiredIngredients: {
      primary: ['numeric'],
      secondary: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Reveals correlations', 'Shows clusters', 'Identifies outliers']
  },
  {
    id: 'heatmap-intensity-fusion',
    name: 'Heatmap Intensity Fusion',
    chartType: 'heatmap',
    confidence: 0.84,
    reasoning: 'Two categorical dimensions with numeric intensity create perfect heatmap matrices',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['categorical', 'numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Shows intensity patterns', 'Reveals correlation matrices', 'Heat distribution']
  },

  // === GEOGRAPHIC ENCHANTMENTS ===
  {
    id: 'geographic-map-enchantment',
    name: 'Geographic Map Enchantment',
    chartType: 'map',
    confidence: 0.92,
    reasoning: 'Geographic coordinates unlock the power of spatial visualization',
    requiredIngredients: {
      primary: ['geographic'],
      secondary: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Shows spatial patterns', 'Reveals geographic trends', 'Maps distributions']
  },
  {
    id: 'geographic-3d-elevation',
    name: 'Geographic 3D Elevation Spell',
    chartType: 'map3d',
    confidence: 0.89,
    reasoning: 'Geographic data with elevation values creates immersive 3D terrain',
    requiredIngredients: {
      primary: ['geographic'],
      secondary: ['numeric'],
      optional: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['3D spatial visualization', 'Elevation mapping', 'Terrain analysis']
  },

  // === 3D DIMENSIONAL SPELLS ===
  {
    id: 'bar-3d-crystal-formation',
    name: '3D Bar Crystal Formation',
    chartType: 'bar3d',
    confidence: 0.86,
    reasoning: 'Three-dimensional bar charts add depth and perspective to categorical comparisons',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['numeric'],
      optional: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['3D categorical comparison', 'Multi-dimensional bars', 'Depth perception']
  },
  {
    id: 'scatter-3d-constellation',
    name: '3D Scatter Constellation',
    chartType: 'scatter3d',
    confidence: 0.91,
    reasoning: 'Three numeric dimensions create perfect 3D scatter constellation patterns',
    requiredIngredients: {
      primary: ['numeric'],
      secondary: ['numeric', 'numeric']
    },
    optimalColumns: {},
    magicalEffects: ['3D correlation patterns', 'Multi-dimensional clusters', 'Space visualization']
  },
  {
    id: 'surface-3d-reality-weaving',
    name: '3D Surface Reality Weaving',
    chartType: 'surface3d',
    confidence: 0.85,
    reasoning: 'Three numeric dimensions weave together to form continuous 3D surfaces',
    requiredIngredients: {
      primary: ['numeric'],
      secondary: ['numeric', 'numeric']
    },
    optimalColumns: {},
    magicalEffects: ['3D surface modeling', 'Continuous landscapes', 'Mathematical surfaces']
  },

  // === NETWORK & GRAPH SPELLS ===
  {
    id: 'network-connection-elixir',
    name: 'Network Connection Elixir',
    chartType: 'network',
    confidence: 0.83,
    reasoning: 'Categorical relationships form natural network connections and hierarchies',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['categorical'],
      optional: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Shows relationships', 'Network topology', 'Connection strength']
  },
  {
    id: 'network-3d-constellation',
    name: '3D Network Constellation',
    chartType: 'network3d',
    confidence: 0.87, // Confidence reflects strong multi-dimensional relationship visualization capability
    reasoning: 'Multi-dimensional categorical relationships create immersive 3D network galaxies',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['categorical'],
      optional: ['numeric']
    },
    optimalColumns: {},
    magicalEffects: ['3D network visualization', 'Spatial relationships', 'Network galaxies']
  },

  // === PERFORMANCE & KPI CRYSTALS ===
  {
    id: 'kpi-crystal-formation',
    name: 'KPI Crystal Formation',
    chartType: 'kpi',
    confidence: 0.79,
    reasoning: 'Key numeric indicators crystallize into powerful performance visualizations',
    requiredIngredients: {
      primary: ['numeric'],
      optional: ['categorical']
    },
    optimalColumns: {},
    magicalEffects: ['Key metric display', 'Performance indicators', 'Status crystals']
  },

  // === ADVANCED COMBINATIONS ===
  {
    id: 'stacked-bar-amplification',
    name: 'Stacked Bar Amplification',
    chartType: 'stackedbar',
    confidence: 0.88,
    reasoning: 'Multiple categorical dimensions with numeric values create powerful stacked comparisons',
    requiredIngredients: {
      primary: ['categorical'],
      secondary: ['categorical', 'numeric']
    },
    optimalColumns: {},
    magicalEffects: ['Stacked comparisons', 'Multi-dimensional analysis', 'Category breakdowns']
  }
];