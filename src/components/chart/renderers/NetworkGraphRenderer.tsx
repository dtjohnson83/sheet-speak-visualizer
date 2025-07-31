import React, { useEffect, useRef, useMemo } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import * as d3 from 'd3';

interface NetworkGraphRendererProps {
  data: DataRow[];
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  chartColors: string[];
  showDataLabels?: boolean;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: string;
  value: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export const NetworkGraphRenderer = ({
  data,
  columns,
  xColumn,
  yColumn,
  chartColors,
  showDataLabels = true
}: NetworkGraphRendererProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Transform data into network format
  const networkData = useMemo(() => {
    const nodes = new Map<string, GraphNode>();
    const links: GraphLink[] = [];
    const linkCounts = new Map<string, number>();

    data.forEach(row => {
      const sourceId = String(row[xColumn] || '');
      const targetId = String(row[yColumn] || '');
      
      if (!sourceId || !targetId || sourceId === targetId) return;

      // Add nodes
      if (!nodes.has(sourceId)) {
        nodes.set(sourceId, {
          id: sourceId,
          label: sourceId,
          group: 'source',
          value: 1
        });
      }
      
      if (!nodes.has(targetId)) {
        nodes.set(targetId, {
          id: targetId,
          label: targetId,
          group: 'target',
          value: 1
        });
      }

      // Count connections
      const linkKey = `${sourceId}-${targetId}`;
      linkCounts.set(linkKey, (linkCounts.get(linkKey) || 0) + 1);
    });

    // Create links
    linkCounts.forEach((count, linkKey) => {
      const [source, target] = linkKey.split('-');
      links.push({ source, target, value: count });
    });

    return {
      nodes: Array.from(nodes.values()),
      links
    };
  }, [data, xColumn, yColumn]);

  useEffect(() => {
    if (!svgRef.current || networkData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr('width', width).attr('height', height);

    const container = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create force simulation with proper typing
    const simulation = d3.forceSimulation<GraphNode>(networkData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(networkData.links)
        .id(d => d.id)
        .distance(100)
        .strength(0.1))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(
        (width - margin.left - margin.right) / 2,
        (height - margin.top - margin.bottom) / 2
      ))
      .force('collision', d3.forceCollide().radius(20));

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(networkData.nodes.map(d => d.group))
      .range(chartColors);

    // Draw links
    const links = container.append('g')
      .selectAll('line')
      .data(networkData.links)
      .enter()
      .append('line')
      .attr('stroke', 'hsl(var(--muted-foreground))')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value) * 2);

    // Draw nodes
    const nodes = container.append('g')
      .selectAll('circle')
      .data(networkData.nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => Math.max(8, Math.sqrt(d.value) * 5))
      .attr('fill', (d: any) => colorScale(d.group) as string)
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add labels if enabled
    if (showDataLabels) {
      const labels = container.append('g')
        .selectAll('text')
        .data(networkData.nodes)
        .enter()
        .append('text')
        .text((d: any) => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
        .attr('font-size', '12px')
        .attr('font-family', 'var(--font-sans)')
        .attr('fill', 'hsl(var(--foreground))')
        .attr('text-anchor', 'middle')
        .attr('dy', -15)
        .style('pointer-events', 'none');

      simulation.on('tick', () => {
        links
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        nodes
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);

        labels
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y);
      });
    } else {
      simulation.on('tick', () => {
        links
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        nodes
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
      });
    }

    // Add hover effects
    nodes
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', Math.max(12, Math.sqrt(d.value) * 6));
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', Math.max(8, Math.sqrt(d.value) * 5));
      });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [networkData, chartColors, showDataLabels]);

  if (networkData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No network data</p>
          <p className="text-sm">Select columns with related entities to create a network visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="mb-4 text-sm text-muted-foreground">
        Network: {networkData.nodes.length} nodes, {networkData.links.length} connections
      </div>
      <svg ref={svgRef} className="w-full h-auto border border-border rounded-lg" />
    </div>
  );
};