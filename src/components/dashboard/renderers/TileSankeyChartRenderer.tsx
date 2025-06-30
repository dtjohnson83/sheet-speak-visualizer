
import React from 'react';
import { DataRow } from '@/pages/Index';
import { SeriesConfig } from '@/hooks/useChartState';
import { formatTooltipValue } from '@/lib/numberUtils';

interface TileSankeyChartRendererProps {
  data: DataRow[];
  xColumn: string;
  sankeyTargetColumn?: string;
  valueColumn?: string;
  effectiveSeries: SeriesConfig[];
  chartColors: string[];
}

export const TileSankeyChartRenderer = ({ 
  data, 
  xColumn, 
  sankeyTargetColumn, 
  valueColumn,
  chartColors 
}: TileSankeyChartRendererProps) => {
  if (!sankeyTargetColumn) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
        Sankey target column not configured
      </div>
    );
  }

  // Process sankey data
  const sankeyData = data.reduce((acc, row) => {
    const source = row[xColumn]?.toString() || 'Unknown';
    const target = row[sankeyTargetColumn]?.toString() || 'Unknown';
    const key = `${source}_${target}`;
    
    let value = 1;
    if (valueColumn) {
      const numValue = Number(row[valueColumn]);
      if (!isNaN(numValue) && isFinite(numValue)) {
        value = numValue;
      }
    }
    
    if (!acc[key]) acc[key] = 0;
    acc[key] += value;
    return acc;
  }, {} as Record<string, number>);

  const links = Object.entries(sankeyData).map(([key, value]) => {
    const [source, target] = key.split('_');
    return { source, target, value };
  }).filter(link => link.value > 0);

  const nodes = new Set<string>();
  links.forEach(link => {
    nodes.add(link.source);
    nodes.add(link.target);
  });

  const sourceNodes = [...new Set(links.map(l => l.source))];
  const targetNodes = [...new Set(links.map(l => l.target))];

  return (
    <div className="h-full p-2 overflow-auto">
      <div className="flex justify-between items-start h-full text-xs">
        {/* Sources */}
        <div className="flex flex-col gap-1 w-1/3 max-h-full overflow-y-auto">
          <div className="font-medium text-gray-700 dark:text-gray-300 text-center mb-1">Sources</div>
          {sourceNodes.map((nodeId, index) => {
            const totalValue = links
              .filter(l => l.source === nodeId)
              .reduce((sum, l) => sum + l.value, 0);
            
            return (
              <div
                key={nodeId}
                className="p-1 rounded text-center text-white text-xs"
                style={{ 
                  backgroundColor: chartColors[index % chartColors.length]
                }}
              >
                <div className="font-medium truncate">{nodeId}</div>
                <div className="opacity-90">{formatTooltipValue(totalValue)}</div>
              </div>
            );
          })}
        </div>

        {/* Flow connections */}
        <div className="flex flex-col gap-1 w-1/3 px-1 max-h-full overflow-y-auto">
          <div className="font-medium text-gray-700 dark:text-gray-300 text-center mb-1">Flows</div>
          {links.slice(0, 10).map((link, index) => (
            <div
              key={`${link.source}-${link.target}`}
              className="p-1 bg-gray-100 dark:bg-gray-800 rounded text-center"
            >
              <div className="font-medium">{formatTooltipValue(link.value)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {link.source} → {link.target}
              </div>
            </div>
          ))}
          {links.length > 10 && (
            <div className="text-xs text-gray-500 text-center">
              +{links.length - 10} more flows
            </div>
          )}
        </div>

        {/* Targets */}
        <div className="flex flex-col gap-1 w-1/3 max-h-full overflow-y-auto">
          <div className="font-medium text-gray-700 dark:text-gray-300 text-center mb-1">Targets</div>
          {targetNodes.map((nodeId, index) => {
            const totalValue = links
              .filter(l => l.target === nodeId)
              .reduce((sum, l) => sum + l.value, 0);
            
            return (
              <div
                key={nodeId}
                className="p-1 rounded text-center text-white text-xs"
                style={{ 
                  backgroundColor: chartColors[(index + sourceNodes.length) % chartColors.length]
                }}
              >
                <div className="font-medium truncate">{nodeId}</div>
                <div className="opacity-90">{formatTooltipValue(totalValue)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
