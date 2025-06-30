
import React from 'react';
import { formatTooltipValue } from '@/lib/numberUtils';
import { ChartRenderersProps } from '@/types';

interface SankeyChartRendererProps extends Pick<ChartRenderersProps, 'data' | 'chartColors'> {}

interface SankeyData {
  nodes: Array<{ id: string; name: string }>;
  links: Array<{ source: string; target: string; value: number }>;
}

export const SankeyChartRenderer = ({ 
  data, 
  chartColors 
}: SankeyChartRendererProps) => {
  const sankeyData = data as SankeyData;
  
  if (!sankeyData.nodes || !sankeyData.links || sankeyData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No sankey data available
      </div>
    );
  }

  // Simple visualization - for a full Sankey diagram, you'd typically use D3.js
  // This is a simplified representation showing the flow relationships
  const { nodes, links } = sankeyData;
  
  // Group nodes by their position (source vs target)
  const sourceNodes = [...new Set(links.map(l => l.source))];
  const targetNodes = [...new Set(links.map(l => l.target))];
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-start">
          {/* Source nodes */}
          <div className="flex flex-col gap-4 w-1/3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Sources</h4>
            {sourceNodes.map((nodeId, index) => {
              const node = nodes.find(n => n.id === nodeId);
              const totalValue = links
                .filter(l => l.source === nodeId)
                .reduce((sum, l) => sum + l.value, 0);
              
              return (
                <div
                  key={nodeId}
                  className="p-3 rounded-lg border text-center"
                  style={{ 
                    backgroundColor: chartColors[index % chartColors.length],
                    color: 'white'
                  }}
                >
                  <div className="font-medium">{node?.name || nodeId}</div>
                  <div className="text-sm opacity-90">{formatTooltipValue(totalValue)}</div>
                </div>
              );
            })}
          </div>

          {/* Flow connections */}
          <div className="flex flex-col gap-2 w-1/3 px-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Flows</h4>
            {links.map((link, index) => (
              <div
                key={`${link.source}-${link.target}`}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-center text-sm"
              >
                <div className="font-medium">{formatTooltipValue(link.value)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {link.source} → {link.target}
                </div>
              </div>
            ))}
          </div>

          {/* Target nodes */}
          <div className="flex flex-col gap-4 w-1/3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Targets</h4>
            {targetNodes.map((nodeId, index) => {
              const node = nodes.find(n => n.id === nodeId);
              const totalValue = links
                .filter(l => l.target === nodeId)
                .reduce((sum, l) => sum + l.value, 0);
              
              return (
                <div
                  key={nodeId}
                  className="p-3 rounded-lg border text-center"
                  style={{ 
                    backgroundColor: chartColors[(index + sourceNodes.length) % chartColors.length],
                    color: 'white'
                  }}
                >
                  <div className="font-medium">{node?.name || nodeId}</div>
                  <div className="text-sm opacity-90">{formatTooltipValue(totalValue)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
