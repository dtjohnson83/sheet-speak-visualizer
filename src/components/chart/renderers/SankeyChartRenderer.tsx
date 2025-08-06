import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { SankeyData } from '@/lib/chartDataUtils';

interface SankeyChartRendererProps {
  data: SankeyData;
  chartColors: string[];
  showDataLabels?: boolean;
}

interface SankeyNode {
  id?: string;
  name?: string;
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  value?: number;
}

interface SankeyLink {
  source: any;
  target: any;
  value: number;
  width?: number;
}

export const SankeyChartRenderer = React.memo(({ 
  data, 
  chartColors,
  showDataLabels = true
}: SankeyChartRendererProps) => {
  const { nodes, links, sankeyGenerator } = useMemo(() => {
    if (!data.nodes.length || !data.links.length) {
      return { nodes: [], links: [], sankeyGenerator: null };
    }

    const width = 800;
    const height = 400;
    const nodeWidth = 15;
    const nodePadding = 10;

    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId((d: any) => d.id)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([[1, 1], [width - 1, height - 6]]);

    // Transform data for d3-sankey
    const sankeyData = {
      nodes: data.nodes.map(node => ({ ...node })),
      links: data.links.map(link => ({ ...link }))
    };

    const { nodes, links } = sankeyGenerator(sankeyData);

    return { nodes, links, sankeyGenerator };
  }, [data]);

  if (!nodes.length || !links.length) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">No Sankey data available</p>
          <p className="text-sm">Please ensure you have valid source, target, and value columns selected.</p>
        </div>
      </div>
    );
  }

  const colorScale = d3.scaleOrdinal(chartColors);

  return (
    <div className="w-full h-96 flex justify-center">
      <svg width={800} height={400} viewBox="0 0 800 400" className="max-w-full h-full">
        {/* Links */}
        <g>
          {links.map((link, index) => {
            const linkPath = sankeyLinkHorizontal()(link);
            return (
              <path
                key={index}
                d={linkPath || ''}
                fill="none"
                stroke={colorScale(link.source.name || '')}
                strokeWidth={Math.max(1, link.width || 0)}
                strokeOpacity={0.6}
                className="hover:stroke-opacity-80 transition-all duration-200"
              >
                <title>
                  {`${link.source.name} → ${link.target.name}: ${link.value}`}
                </title>
              </path>
            );
          })}
        </g>
        
        {/* Nodes */}
        <g>
          {nodes.map((node, index) => (
            <g key={index}>
              <rect
                x={node.x0}
                y={node.y0}
                width={node.x1! - node.x0!}
                height={node.y1! - node.y0!}
                fill={colorScale(node.name || '')}
                stroke="#000"
                strokeWidth={0.5}
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <title>{`${node.name}: ${node.value}`}</title>
              </rect>
              
              {showDataLabels && (
                <text
                  x={node.x0! < 400 ? node.x1! + 6 : node.x0! - 6}
                  y={(node.y1! + node.y0!) / 2}
                  dy="0.35em"
                  textAnchor={node.x0! < 400 ? "start" : "end"}
                  fontSize="12"
                  fill="currentColor"
                  className="pointer-events-none"
                >
                  {node.name}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
});