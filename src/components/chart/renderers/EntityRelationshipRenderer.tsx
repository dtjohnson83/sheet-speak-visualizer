import React, { useEffect, useRef, useMemo } from 'react';
import { DataRow, ColumnInfo } from '@/pages/Index';
import * as d3 from 'd3';

interface EntityRelationshipRendererProps {
  data: DataRow[];
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  chartColors: string[];
  showDataLabels?: boolean;
}

interface Entity {
  id: string;
  label: string;
  type: string;
  attributes: string[];
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  strength: number;
}

export const EntityRelationshipRenderer = ({
  data,
  columns,
  xColumn,
  yColumn,
  chartColors,
  showDataLabels = true
}: EntityRelationshipRendererProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Transform data into entity-relationship format
  const erData = useMemo(() => {
    const entities = new Map<string, Entity>();
    const relationships: Relationship[] = [];
    const relationshipCounts = new Map<string, number>();

    // Identify entity types based on column characteristics
    const sourceColumn = columns.find(col => col.name === xColumn);
    const targetColumn = columns.find(col => col.name === yColumn);

    data.forEach(row => {
      const sourceId = String(row[xColumn] || '');
      const targetId = String(row[yColumn] || '');
      
      if (!sourceId || !targetId) return;

      // Create entities
      if (!entities.has(sourceId)) {
        entities.set(sourceId, {
          id: sourceId,
          label: sourceId,
          type: sourceColumn?.name || 'Entity',
          attributes: Object.keys(row).filter(key => row[key] && key !== xColumn && key !== yColumn).slice(0, 3)
        });
      }
      
      if (!entities.has(targetId)) {
        entities.set(targetId, {
          id: targetId,
          label: targetId,
          type: targetColumn?.name || 'Entity',
          attributes: Object.keys(row).filter(key => row[key] && key !== xColumn && key !== yColumn).slice(0, 3)
        });
      }

      // Count relationships
      const relKey = `${sourceId}-${targetId}`;
      relationshipCounts.set(relKey, (relationshipCounts.get(relKey) || 0) + 1);
    });

    // Create relationships
    relationshipCounts.forEach((count, relKey) => {
      const [source, target] = relKey.split('-');
      relationships.push({
        source,
        target,
        type: 'RELATED_TO',
        strength: count
      });
    });

    return {
      entities: Array.from(entities.values()),
      relationships
    };
  }, [data, xColumn, yColumn, columns]);

  useEffect(() => {
    if (!svgRef.current || erData.entities.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 900;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.attr('width', width).attr('height', height);

    const container = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create force simulation for ER diagram
    const simulation = d3.forceSimulation(erData.entities as any)
      .force('link', d3.forceLink(erData.relationships)
        .id((d: any) => d.id)
        .distance(150)
        .strength(0.2))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(
        (width - margin.left - margin.right) / 2,
        (height - margin.top - margin.bottom) / 2
      ))
      .force('collision', d3.forceCollide().radius(60));

    // Color scale for entity types
    const entityTypes = [...new Set(erData.entities.map(e => e.type))];
    const colorScale = d3.scaleOrdinal()
      .domain(entityTypes)
      .range(chartColors);

    // Draw relationships
    const relationships = container.append('g')
      .selectAll('line')
      .data(erData.relationships)
      .enter()
      .append('line')
      .attr('stroke', 'hsl(var(--muted-foreground))')
      .attr('stroke-width', (d: any) => Math.max(2, d.strength * 2))
      .attr('stroke-opacity', 0.7)
      .attr('marker-end', 'url(#arrowhead)');

    // Define arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .style('stroke', 'none');

    // Draw entities as rectangles
    const entityGroups = container.append('g')
      .selectAll('g')
      .data(erData.entities)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>()
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

    // Entity rectangles
    entityGroups.append('rect')
      .attr('width', 120)
      .attr('height', (d: any) => 40 + (d.attributes.length * 15))
      .attr('x', -60)
      .attr('y', (d: any) => -(20 + (d.attributes.length * 7.5)))
      .attr('fill', (d: any) => colorScale(d.type) as string)
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 2)
      .attr('rx', 5);

    // Entity labels
    if (showDataLabels) {
      entityGroups.append('text')
        .text((d: any) => d.label.length > 12 ? d.label.substring(0, 12) + '...' : d.label)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'var(--font-sans)')
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .attr('dy', '-5px');

      // Entity type
      entityGroups.append('text')
        .text((d: any) => d.type)
        .attr('font-size', '10px')
        .attr('font-family', 'var(--font-sans)')
        .attr('fill', 'rgba(255, 255, 255, 0.8)')
        .attr('text-anchor', 'middle')
        .attr('dy', '10px');

      // Entity attributes
      entityGroups.selectAll('.attribute')
        .data((d: any) => d.attributes)
        .enter()
        .append('text')
        .attr('class', 'attribute')
        .text((attr: string) => attr.length > 10 ? attr.substring(0, 10) + '...' : attr)
        .attr('font-size', '9px')
        .attr('font-family', 'var(--font-sans)')
        .attr('fill', 'rgba(255, 255, 255, 0.7)')
        .attr('text-anchor', 'middle')
        .attr('dy', (d: any, i: number) => 25 + (i * 12));
    }

    // Relationship labels
    if (showDataLabels) {
      const relationshipLabels = container.append('g')
        .selectAll('text')
        .data(erData.relationships)
        .enter()
        .append('text')
        .text((d: any) => d.strength > 1 ? `${d.type} (${d.strength})` : d.type)
        .attr('font-size', '10px')
        .attr('font-family', 'var(--font-sans)')
        .attr('fill', 'hsl(var(--foreground))')
        .attr('text-anchor', 'middle')
        .style('pointer-events', 'none');

      simulation.on('tick', () => {
        relationships
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        entityGroups
          .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

        relationshipLabels
          .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
          .attr('y', (d: any) => (d.source.y + d.target.y) / 2);
      });
    } else {
      simulation.on('tick', () => {
        relationships
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        entityGroups
          .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
      });
    }

    // Add hover effects
    entityGroups
      .on('mouseover', function(event, d: any) {
        d3.select(this).select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', 4);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this).select('rect')
          .transition()
          .duration(200)
          .attr('stroke-width', 2);
      });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [erData, chartColors, showDataLabels]);

  if (erData.entities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No entity data</p>
          <p className="text-sm">Select columns representing entities to create an ER diagram</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="mb-4 text-sm text-muted-foreground">
        Entity-Relationship Diagram: {erData.entities.length} entities, {erData.relationships.length} relationships
      </div>
      <svg ref={svgRef} className="w-full h-auto border border-border rounded-lg" />
    </div>
  );
};