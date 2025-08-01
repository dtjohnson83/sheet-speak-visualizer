import { useState, useCallback } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { AggregationMethod } from '@/components/chart/AggregationConfiguration';
import { chartTypeInfo, getChartTypeInfo } from '@/lib/chartTypeInfo';

export interface AIChartSuggestion {
  chartType: string;
  xColumn: string;
  yColumn: string;
  stackColumn?: string;
  valueColumn?: string;
  aggregationMethod: AggregationMethod;
  series: SeriesConfig[];
  title: string;
  reasoning: string;
  confidence: number;
}

export interface ChartAnalysis {
  dataTypes: Record<string, 'numeric' | 'categorical' | 'date' | 'text'>;
  patterns: string[];
  recommendations: string[];
  bestChartTypes: string[];
}

export const useAIChartGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<AIChartSuggestion | null>(null);

  // Valid chart types list including network visualizations
  const VALID_CHART_TYPES = ['bar', 'line', 'area', 'pie', 'scatter', 'heatmap', 'treemap', 'histogram', 'kpi', 'bar3d', 'scatter3d', 'surface3d', 'network', 'network3d', 'entity-relationship'] as const;
  
  // Chart types that support series  
  const MULTI_SERIES_TYPES = ['line', 'area', 'bar', 'scatter', 'bar3d', 'scatter3d'] as const;
  
  // Chart type to aggregation mapping
  const getDefaultAggregation = (chartType: string): AggregationMethod => {
    switch (chartType) {
      case 'scatter': 
      case 'scatter3d':
      case 'surface3d': return 'average'; // 3D charts typically show raw relationships
      case 'count': 
      case 'histogram': return 'count';
      case 'pie':
      case 'treemap': return 'sum'; // Part-of-whole charts
      case 'network':
      case 'network3d':
      case 'entity-relationship': return 'count'; // Graph visualizations
      default: return 'sum';
    }
  };

  // Validate data before analysis
  const validateData = (data: DataRow[], columns: ColumnInfo[]): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (!data || data.length === 0) {
      issues.push('No data available for analysis');
    }
    
    if (!columns || columns.length === 0) {
      issues.push('No columns defined');
    }
    
    if (data.length < 2) {
      issues.push('Insufficient data points (minimum 2 required)');
    }
    
    return { isValid: issues.length === 0, issues };
  };

  // Analyze data characteristics with improved intelligence
  const analyzeData = useCallback((data: DataRow[], columns: ColumnInfo[]): ChartAnalysis => {
    const dataTypes: Record<string, 'numeric' | 'categorical' | 'date' | 'text'> = {};
    const patterns: string[] = [];
    const recommendations: string[] = [];
    const bestChartTypes: string[] = [];

    // Validate data first
    const validation = validateData(data, columns);
    if (!validation.isValid) {
      return { dataTypes, patterns, recommendations: validation.issues, bestChartTypes };
    }

    // Analyze column types and data patterns
    columns.forEach(col => {
      dataTypes[col.name] = col.type;
      
      // Calculate unique values and variability
      const uniqueValues = new Set(data.map(row => row[col.name]).filter(val => val != null)).size;
      const totalRows = data.length;
      const uniqueRatio = uniqueValues / totalRows;

      if (col.type === 'numeric') {
        if (uniqueRatio > 0.8) {
          patterns.push(`${col.name} has high variability (continuous data)`);
        } else if (uniqueRatio < 0.1) {
          patterns.push(`${col.name} has low variability (discrete values)`);
        }
        
        // Check for distribution analysis
        if (uniqueValues >= 10) {
          patterns.push(`${col.name} suitable for distribution analysis`);
        }
      } else if (col.type === 'categorical') {
        if (uniqueValues <= 6) {
          patterns.push(`${col.name} has few categories (${uniqueValues}) - ideal for pie charts`);
        } else if (uniqueValues <= 20) {
          patterns.push(`${col.name} has manageable categories (${uniqueValues}) - good for bar charts`);
        } else {
          patterns.push(`${col.name} has many categories (${uniqueValues}) - consider grouping or treemap`);
        }
      } else if (col.type === 'date') {
        patterns.push(`${col.name} is temporal data - excellent for trend analysis`);
      }
    });

    // Intelligent chart type recommendations
    const numericCols = columns.filter(c => c.type === 'numeric');
    const categoricalCols = columns.filter(c => c.type === 'categorical');
    const dateCols = columns.filter(c => c.type === 'date');

    // Time series analysis (highest priority)
    if (dateCols.length > 0 && numericCols.length > 0) {
      bestChartTypes.push('line', 'area');
      recommendations.push('Time series data detected - line/area charts show trends effectively');
      
      if (numericCols.length >= 2) {
        recommendations.push('Multiple metrics over time - consider multi-series line chart');
      }
    }

    // Categorical analysis
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      const categoryCount = new Set(data.map(row => row[categoricalCols[0].name])).size;
      
      if (categoryCount <= 6) {
        bestChartTypes.push('pie');
        recommendations.push(`${categoryCount} categories - pie chart shows proportions clearly`);
      }
      
      if (categoryCount <= 20) {
        bestChartTypes.push('bar');
        recommendations.push(`${categoryCount} categories - bar chart enables easy comparison`);
      }
      
      if (categoryCount > 20) {
        bestChartTypes.push('treemap');
        recommendations.push('Many categories - treemap provides hierarchical view');
      }
    }

    // Correlation analysis
    if (numericCols.length >= 2) {
      bestChartTypes.push('scatter');
      recommendations.push('Multiple numeric columns - scatter plot reveals correlations and outliers');
    }

    // Distribution analysis
    if (numericCols.length >= 1) {
      const numericCol = numericCols[0];
      const uniqueValues = new Set(data.map(row => row[numericCol.name])).size;
      if (uniqueValues >= 10) {
        bestChartTypes.push('histogram');
        recommendations.push(`${numericCol.name} has ${uniqueValues} unique values - histogram shows distribution`);
      }
    }

    // Multi-dimensional analysis
    if (categoricalCols.length >= 2 && numericCols.length >= 1) {
      bestChartTypes.push('heatmap');
      recommendations.push('Multiple categorical dimensions - heatmap shows patterns across categories');
    }

    return { dataTypes, patterns, recommendations, bestChartTypes };
  }, []);

  // Smart column selection with improved intelligence
  const selectBestColumns = (
    chartType: string, 
    columns: ColumnInfo[], 
    data: DataRow[], 
    query?: string
  ): { xColumn: string; yColumn: string; valueColumn: string } => {
    const numericCols = columns.filter(c => c.type === 'numeric');
    const categoricalCols = columns.filter(c => c.type === 'categorical');
    const dateCols = columns.filter(c => c.type === 'date');
    
    let xColumn = '';
    let yColumn = '';
    let valueColumn = '';

    // Query-based column selection
    if (query) {
      const lowerQuery = query.toLowerCase();
      columns.forEach(col => {
        const colNameLower = col.name.toLowerCase();
        if (lowerQuery.includes(colNameLower)) {
          if ((col.type === 'categorical' || col.type === 'date') && !xColumn) {
            xColumn = col.name;
          } else if (col.type === 'numeric' && !yColumn) {
            yColumn = col.name;
          }
        }
      });
    }

    // Chart-specific intelligent defaults
    const chartInfo = getChartTypeInfo(chartType);
    if (chartInfo) {
      const requirements = chartInfo.requirements;

      // X-axis selection
      if (!xColumn && 'xAxis' in requirements) {
        const axisType = requirements.xAxis.type;
        if (axisType.includes('date') && dateCols.length > 0) {
          xColumn = dateCols[0].name;
        } else if (axisType.includes('categorical') && categoricalCols.length > 0) {
          // Pick categorical column with reasonable number of categories
          const goodCategorical = categoricalCols.find(col => {
            const uniqueValues = new Set(data.map(row => row[col.name])).size;
            return uniqueValues >= 2 && uniqueValues <= 20;
          });
          xColumn = goodCategorical?.name || categoricalCols[0]?.name || '';
        } else if (axisType.includes('numeric') && numericCols.length > 0) {
          xColumn = numericCols[0].name;
        }
      }

      // Y-axis selection  
      if (!yColumn && 'yAxis' in requirements) {
        const axisType = requirements.yAxis.type;
        if (axisType.includes('numeric') && numericCols.length > 0) {
          // For scatter plots, use different numeric column than X
          if (chartType === 'scatter' && xColumn) {
            const differentNumeric = numericCols.find(col => col.name !== xColumn);
            yColumn = differentNumeric?.name || numericCols[0]?.name || '';
          } else {
            yColumn = numericCols[0]?.name || '';
          }
        } else if (axisType.includes('categorical') && categoricalCols.length > 0) {
          const differentCategorical = categoricalCols.find(col => col.name !== xColumn);
          yColumn = differentCategorical?.name || categoricalCols[0]?.name || '';
        }
      }
    }

    // Fallback column selection
    if (!xColumn) {
      xColumn = dateCols[0]?.name || categoricalCols[0]?.name || columns[0]?.name || '';
    }
    
    if (!yColumn) {
      yColumn = numericCols[0]?.name || '';
    }

    // Set value column for specific chart types
    if (['heatmap', 'treemap', 'pie'].includes(chartType)) {
      valueColumn = yColumn;
    }

    return { xColumn, yColumn, valueColumn };
  };

  // Generate AI chart suggestion based on natural language query
  const generateChartFromQuery = useCallback(async (
    query: string,
    data: DataRow[],
    columns: ColumnInfo[]
  ): Promise<AIChartSuggestion> => {
    setIsGenerating(true);

    try {
      // Validate data first
      const validation = validateData(data, columns);
      if (!validation.isValid) {
        throw new Error(`Data validation failed: ${validation.issues.join(', ')}`);
      }

      const analysis = analyzeData(data, columns);
      
      // Parse natural language query for intent
      const lowerQuery = query.toLowerCase();
      let suggestedChartType = 'bar';
      let confidence = 0.7;

      // Enhanced chart type detection with validation
      if (lowerQuery.includes('trend') || lowerQuery.includes('over time') || lowerQuery.includes('timeline')) {
        suggestedChartType = 'line';
        confidence = 0.9;
      } else if (lowerQuery.includes('compare') || lowerQuery.includes('comparison')) {
        suggestedChartType = 'bar';
        confidence = 0.85;
      } else if (lowerQuery.includes('distribution') || lowerQuery.includes('spread')) {
        suggestedChartType = 'histogram';
        confidence = 0.8;
      } else if (lowerQuery.includes('relationship') || lowerQuery.includes('correlation')) {
        suggestedChartType = 'scatter';
        confidence = 0.85;
      } else if (lowerQuery.includes('proportion') || lowerQuery.includes('percentage') || lowerQuery.includes('share')) {
        suggestedChartType = 'pie';
        confidence = 0.8;
      } else if (lowerQuery.includes('pattern') || lowerQuery.includes('heatmap')) {
        suggestedChartType = 'heatmap';
        confidence = 0.75;
      } else if (lowerQuery.includes('hierarchy') || lowerQuery.includes('treemap')) {
        suggestedChartType = 'treemap';
        confidence = 0.8;
      } else if (lowerQuery.includes('network') || lowerQuery.includes('graph') || lowerQuery.includes('connections')) {
        suggestedChartType = 'network';
        confidence = 0.85;
      } else if (lowerQuery.includes('entity') || lowerQuery.includes('relationships') || lowerQuery.includes('knowledge')) {
        suggestedChartType = 'entity-relationship';
        confidence = 0.8;
      }

      // Validate chart type compatibility
      if (!VALID_CHART_TYPES.includes(suggestedChartType as any)) {
        suggestedChartType = 'bar';
        confidence = 0.6;
      }

      // Smart column selection
      const { xColumn, yColumn, valueColumn } = selectBestColumns(suggestedChartType, columns, data, query);

      // Generate appropriate aggregation method
      let aggregationMethod: AggregationMethod = getDefaultAggregation(suggestedChartType);
      
      if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
        aggregationMethod = 'average';
      } else if (lowerQuery.includes('count')) {
        aggregationMethod = 'count';
      } else if (lowerQuery.includes('max') || lowerQuery.includes('maximum')) {
        aggregationMethod = 'max';
      } else if (lowerQuery.includes('min') || lowerQuery.includes('minimum')) {
        aggregationMethod = 'min';
      } else if (lowerQuery.includes('sum') || lowerQuery.includes('total')) {
        aggregationMethod = 'sum';
      }

      // Generate series configuration for multi-series charts only
      const series: SeriesConfig[] = [];
      if (MULTI_SERIES_TYPES.includes(suggestedChartType as any) && yColumn) {
        const validSeriesType = ['bar', 'line', 'area'].includes(suggestedChartType) ? 
          suggestedChartType as 'bar' | 'line' | 'area' : 'bar';
        
        series.push({
          id: '1',
          column: yColumn,
          color: '#3b82f6',
          type: validSeriesType,
          aggregationMethod
        });
      }

      const suggestion: AIChartSuggestion = {
        chartType: suggestedChartType,
        xColumn,
        yColumn,
        valueColumn: valueColumn || yColumn,
        aggregationMethod,
        series,
        title: `${suggestedChartType.charAt(0).toUpperCase() + suggestedChartType.slice(1)} Chart: ${xColumn}${yColumn ? ` vs ${yColumn}` : ''}`,
        reasoning: `Based on your query "${query}", I detected intent for ${suggestedChartType} visualization. Selected ${xColumn}${yColumn ? ` for x-axis and ${yColumn} for y-axis` : ''} with ${aggregationMethod} aggregation.`,
        confidence
      };

      setLastSuggestion(suggestion);
      return suggestion;

    } catch (error) {
      console.error('Failed to generate AI chart suggestion:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [analyzeData]);

  // Auto-select best chart type based on data characteristics
  const suggestOptimalChart = useCallback((data: DataRow[], columns: ColumnInfo[]): AIChartSuggestion => {
    // Validate data first
    const validation = validateData(data, columns);
    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.issues.join(', ')}`);
    }

    const analysis = analyzeData(data, columns);
    
    let chartType = 'bar';
    let confidence = 0.6;
    let reasoning = 'Default bar chart selected - suitable for most data types';

    // Select best chart type from analysis
    if (analysis.bestChartTypes.length > 0) {
      chartType = analysis.bestChartTypes[0];
      confidence = 0.85;
      reasoning = `Recommended ${chartType} chart based on data analysis: ${analysis.recommendations[0] || 'Best fit for your data structure'}`;
    }

    // Validate selected chart type
    if (!VALID_CHART_TYPES.includes(chartType as any)) {
      chartType = 'bar';
      confidence = 0.6;
      reasoning = 'Fallback to bar chart due to compatibility';
    }

    // Smart column selection using the improved logic
    const { xColumn, yColumn, valueColumn } = selectBestColumns(chartType, columns, data);

    // Get appropriate aggregation method for chart type
    const aggregationMethod = getDefaultAggregation(chartType);

    // Generate series configuration only for supported chart types
    const series: SeriesConfig[] = [];
    if (MULTI_SERIES_TYPES.includes(chartType as any) && yColumn) {
      const validSeriesType = ['bar', 'line', 'area'].includes(chartType) ? 
        chartType as 'bar' | 'line' | 'area' : 'bar';
      
      series.push({
        id: '1',
        column: yColumn,
        color: '#3b82f6',
        type: validSeriesType,
        aggregationMethod
      });
    }

    const suggestion: AIChartSuggestion = {
      chartType,
      xColumn,
      yColumn,
      valueColumn: valueColumn || yColumn,
      aggregationMethod,
      series,
      title: `Recommended ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      reasoning,
      confidence
    };

    setLastSuggestion(suggestion);
    return suggestion;
  }, [analyzeData]);

  return {
    isGenerating,
    lastSuggestion,
    generateChartFromQuery,
    suggestOptimalChart,
    analyzeData
  };
};