
import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { DataRow, ColumnInfo } from '@/types/data';

interface KnowledgeGraphProps {
  data: DataRow[];
  columns: ColumnInfo[];
}

interface EntityNodeData {
  label: string;
  type: string;
  count?: number;
}

// Custom node component for entities
const EntityNode = ({ data }: NodeProps<EntityNodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs text-gray-500">{data.type}</div>
      {data.count && <div className="text-xs text-blue-600">{data.count} records</div>}
    </div>
  );
};

const nodeTypes = {
  entity: EntityNode,
};

export const KnowledgeGraph = ({ data, columns }: KnowledgeGraphProps) => {
  // Generate nodes and edges from the data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const entityMap = new Map<string, { count: number; type: string; relatedEntities: Set<string> }>();
    
    // Identify potential entities (categorical columns with reasonable cardinality)
    const entityColumns = columns.filter(col => 
      col.type === 'categorical' && 
      new Set(data.map(row => row[col.name])).size < Math.min(50, data.length * 0.5)
    );

    // Build entity relationships
    data.forEach((row, rowIndex) => {
      const rowEntities: string[] = [];
      
      entityColumns.forEach(col => {
        const value = row[col.name];
        if (value != null && value !== '') {
          const entityId = `${col.name}:${value}`;
          const entityKey = `${col.name}:${value}`;
          
          if (!entityMap.has(entityKey)) {
            entityMap.set(entityKey, {
              count: 0,
              type: col.name,
              relatedEntities: new Set()
            });
          }
          
          const entity = entityMap.get(entityKey)!;
          entity.count++;
          rowEntities.push(entityKey);
        }
      });
      
      // Create relationships between entities in the same row
      for (let i = 0; i < rowEntities.length; i++) {
        for (let j = i + 1; j < rowEntities.length; j++) {
          const entity1 = entityMap.get(rowEntities[i])!;
          const entity2 = entityMap.get(rowEntities[j])!;
          
          entity1.relatedEntities.add(rowEntities[j]);
          entity2.relatedEntities.add(rowEntities[i]);
        }
      }
    });

    // Create nodes
    let nodeIndex = 0;
    entityMap.forEach((entityData, entityKey) => {
      const [type, value] = entityKey.split(':');
      const x = (nodeIndex % 8) * 200;
      const y = Math.floor(nodeIndex / 8) * 150;
      
      nodes.push({
        id: entityKey,
        type: 'entity',
        position: { x, y },
        data: {
          label: value,
          type: type,
          count: entityData.count,
        },
      });
      nodeIndex++;
    });

    // Create edges based on relationships
    const edgeMap = new Map<string, number>();
    entityMap.forEach((entityData, entityKey) => {
      entityData.relatedEntities.forEach(relatedEntity => {
        const edgeKey = [entityKey, relatedEntity].sort().join('->');
        edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1);
      });
    });

    edgeMap.forEach((weight, edgeKey) => {
      const [source, target] = edgeKey.split('->');
      if (weight > 1) { // Only show edges with multiple connections
        edges.push({
          id: edgeKey,
          source,
          target,
          label: `${weight} connections`,
          style: { 
            strokeWidth: Math.min(weight / 2, 5),
            stroke: '#6366f1'
          },
          labelStyle: { fontSize: 10, fill: '#6366f1' },
        });
      }
    });

    return { nodes, edges };
  }, [data, columns]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (initialNodes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">No Knowledge Graph Available</p>
          <p className="text-sm">
            Knowledge graphs require categorical data with identifiable entities and relationships.
            Your dataset may not contain suitable categorical columns for graph visualization.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">Knowledge Graph</h4>
        <p className="text-sm text-gray-600">
          Visualizing relationships between entities in your data. 
          Nodes represent unique values, edges show co-occurrence patterns.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          {nodes.length} entities • {edges.length} relationships
        </div>
      </div>
      
      <div style={{ width: '100%', height: '500px' }} className="border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>💡 Drag nodes to rearrange • Use mouse wheel to zoom • Click and drag to pan</p>
      </div>
    </Card>
  );
};
