interface ChartStats {
  dataPoints: number;
  maxValue: number;
  minValue: number;
  averageValue: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export const generateChartDescription = async (
  chartType: string,
  chartTitle: string,
  chartData: any,
  platform: string,
  template?: string
): Promise<string> => {
  try {
    // Analyze chart data to extract key insights
    const stats = analyzeChartData(chartData, chartType);
    
    // Generate description based on platform and template
    switch (platform) {
      case 'twitter':
        return generateTwitterDescription(chartType, chartTitle, stats);
      case 'linkedin':
        return generateLinkedInDescription(chartType, chartTitle, stats);
      case 'facebook':
        return generateFacebookDescription(chartType, chartTitle, stats);
      case 'instagram':
        return generateInstagramDescription(chartType, chartTitle, stats);
      case 'email':
        return generateEmailDescription(chartType, chartTitle, stats, template);
      default:
        return generateGenericDescription(chartType, chartTitle, stats);
    }
  } catch (error) {
    console.error('Error generating chart description:', error);
    return generateFallbackDescription(chartType, chartTitle);
  }
};

const analyzeChartData = (data: any, chartType: string): ChartStats => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      dataPoints: 0,
      maxValue: 0,
      minValue: 0,
      averageValue: 0
    };
  }

  // Extract numeric values from data based on chart type
  let values: number[] = [];
  
  if (chartType === 'bar' || chartType === 'line' || chartType === 'area') {
    values = data.map(item => {
      const yKey = Object.keys(item).find(key => typeof item[key] === 'number' && key !== 'x');
      return yKey ? item[yKey] : 0;
    }).filter(val => !isNaN(val));
  } else if (chartType === 'pie' || chartType === 'treemap') {
    values = data.map(item => item.value || item.size || 0).filter(val => !isNaN(val));
  } else if (chartType === 'scatter' || chartType === 'scatter-3d') {
    values = data.map(item => item.y || 0).filter(val => !isNaN(val));
  }

  if (values.length === 0) {
    return { dataPoints: data.length, maxValue: 0, minValue: 0, averageValue: 0 };
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Determine trend for time-series data
  let trend: 'increasing' | 'decreasing' | 'stable' | undefined;
  if (values.length > 2) {
    const firstThird = values.slice(0, Math.floor(values.length / 3));
    const lastThird = values.slice(-Math.floor(values.length / 3));
    const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;
    
    const changePercent = ((lastAvg - firstAvg) / firstAvg) * 100;
    if (Math.abs(changePercent) < 5) {
      trend = 'stable';
    } else if (changePercent > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }
  }

  return {
    dataPoints: data.length,
    maxValue,
    minValue,
    averageValue,
    trend
  };
};

const generateTwitterDescription = (chartType: string, title: string, stats: ChartStats): string => {
  const trendEmoji = stats.trend === 'increasing' ? '📈' : stats.trend === 'decreasing' ? '📉' : '📊';
  const chartEmoji = getChartEmoji(chartType);
  
  return `${chartEmoji} ${title}\n\n` +
    `📊 ${stats.dataPoints} data points\n` +
    `${trendEmoji} ${getTrendDescription(stats.trend)}\n` +
    `💡 Key insight: ${generateKeyInsight(stats, chartType)}\n\n` +
    `#DataVisualization #Analytics #Charts`;
};

const generateLinkedInDescription = (chartType: string, title: string, stats: ChartStats): string => {
  return `📊 Data Insight: ${title}\n\n` +
    `I've created this ${chartType} visualization to highlight key trends in our data. ` +
    `The analysis covers ${stats.dataPoints} data points and reveals ${getTrendDescription(stats.trend)} patterns.\n\n` +
    `🔍 Key Findings:\n` +
    `• ${generateKeyInsight(stats, chartType)}\n` +
    `• Range: ${stats.minValue.toFixed(1)} to ${stats.maxValue.toFixed(1)}\n` +
    `• Average: ${stats.averageValue.toFixed(1)}\n\n` +
    `What insights do you see in this data? Share your thoughts below!\n\n` +
    `#DataAnalytics #BusinessIntelligence #DataVisualization #Insights`;
};

const generateFacebookDescription = (chartType: string, title: string, stats: ChartStats): string => {
  return `📈 Sharing some interesting data insights!\n\n` +
    `${title}\n\n` +
    `This ${chartType} chart shows ${getTrendDescription(stats.trend)} trends across ${stats.dataPoints} data points. ` +
    `${generateKeyInsight(stats, chartType)}\n\n` +
    `Data tells a story - what story do you see here? 🤔\n\n` +
    `#Data #Analytics #Visualization #Insights`;
};

const generateInstagramDescription = (chartType: string, title: string, stats: ChartStats): string => {
  return `📊✨ ${title}\n\n` +
    `${generateKeyInsight(stats, chartType)} ${getChartEmoji(chartType)}\n\n` +
    `💡 The numbers don't lie: ${stats.dataPoints} data points tell a ${getTrendDescription(stats.trend)} story\n\n` +
    `Swipe to see the full analysis! What patterns do you notice? 👀\n\n` +
    `#DataVisualization #Analytics #Charts #DataStory #BusinessInsights #TechLife #DataScience`;
};

const generateEmailDescription = (chartType: string, title: string, stats: ChartStats, template?: string): string => {
  const baseDescription = `Please find attached the ${chartType} chart titled "${title}". ` +
    `This visualization presents ${stats.dataPoints} data points and shows ${getTrendDescription(stats.trend)} trends.\n\n` +
    `Key highlights:\n` +
    `• ${generateKeyInsight(stats, chartType)}\n` +
    `• Data range: ${stats.minValue.toFixed(2)} to ${stats.maxValue.toFixed(2)}\n` +
    `• Average value: ${stats.averageValue.toFixed(2)}\n\n`;

  switch (template) {
    case 'executive':
      return `Executive Summary:\n\n${baseDescription}` +
        `This analysis supports strategic decision-making by providing clear visibility into current performance metrics. ` +
        `I recommend reviewing these findings in our next planning session.\n\n` +
        `Please let me know if you need additional analysis or have questions about the methodology.`;
    
    case 'casual':
      return `Hey! 👋\n\nI put together this chart and thought you'd find it interesting:\n\n${baseDescription}` +
        `Pretty cool patterns emerging from the data! Let me know what you think or if you'd like me to dig deeper into any specific areas.`;
    
    default: // professional
      return baseDescription +
        `This analysis provides valuable insights that can inform our decision-making process. ` +
        `The visualization clearly demonstrates the relationships within our dataset and highlights areas for potential focus.\n\n` +
        `I'm available to discuss these findings further or provide additional analysis as needed.`;
  }
};

const generateGenericDescription = (chartType: string, title: string, stats: ChartStats): string => {
  return `${title}\n\n` +
    `This ${chartType} visualization shows ${getTrendDescription(stats.trend)} trends across ${stats.dataPoints} data points. ` +
    `${generateKeyInsight(stats, chartType)}`;
};

const generateFallbackDescription = (chartType: string, title: string): string => {
  return `${title} - A ${chartType} chart visualization showing data insights and trends.`;
};

const getChartEmoji = (chartType: string): string => {
  const emojiMap: Record<string, string> = {
    'bar': '📊',
    'line': '📈',
    'pie': '🥧',
    'scatter': '🔵',
    'area': '🏔️',
    'heatmap': '🌡️',
    'treemap': '🗺️',
    'bar-3d': '📊',
    'scatter-3d': '🔮'
  };
  return emojiMap[chartType] || '📊';
};

const getTrendDescription = (trend?: string): string => {
  switch (trend) {
    case 'increasing': return 'upward';
    case 'decreasing': return 'downward';
    case 'stable': return 'stable';
    default: return 'varied';
  }
};

const generateKeyInsight = (stats: ChartStats, chartType: string): string => {
  if (stats.dataPoints === 0) return 'No data available for analysis';
  
  const range = stats.maxValue - stats.minValue;
  const coefficient = range / stats.averageValue;
  
  if (coefficient > 2) {
    return `High variability detected with values ranging significantly from ${stats.minValue.toFixed(1)} to ${stats.maxValue.toFixed(1)}`;
  } else if (coefficient < 0.5) {
    return `Values are closely clustered around the average of ${stats.averageValue.toFixed(1)}`;
  } else {
    return `Moderate spread in values with peak at ${stats.maxValue.toFixed(1)} and average of ${stats.averageValue.toFixed(1)}`;
  }
};