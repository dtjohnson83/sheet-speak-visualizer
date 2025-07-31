import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { DataRow, ColumnInfo } from '@/pages/Index';
import { StandardAxes3D } from '../utils/StandardAxes3D';

interface Network3DGraphRendererProps {
  data: DataRow[];
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  chartColors: string[];
  showDataLabels?: boolean;
}

interface GraphNode3D {
  id: string;
  label: string;
  position: [number, number, number];
  connections: number;
}

interface GraphLink3D {
  source: [number, number, number];
  target: [number, number, number];
  strength: number;
}

// 3D Network visualization component
const Network3D = ({ networkData, chartColors, showDataLabels }: {
  networkData: { nodes: GraphNode3D[]; links: GraphLink3D[] };
  chartColors: string[];
  showDataLabels: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const nodeColor = chartColors[0] || '#3b82f6';
  const linkColor = '#6b7280';

  return (
    <group ref={groupRef}>
      {/* Standard 3D Axes */}
      <StandardAxes3D 
        xLabel="Network X"
        yLabel="Network Y"
        zLabel="Network Z"
        axisLength={4}
        showGrid={true}
        showOrigin={true}
      />

      {/* Render links */}
      {networkData.links.map((link, index) => (
        <Line
          key={`link-${index}`}
          points={[link.source, link.target]}
          color={linkColor}
          lineWidth={Math.max(1, link.strength)}
          opacity={0.6}
        />
      ))}

      {/* Render nodes */}
      {networkData.nodes.map((node, index) => (
        <group key={`node-${node.id}`} position={node.position}>
          <Sphere args={[Math.max(0.1, node.connections * 0.05), 16, 16]}>
            <meshStandardMaterial 
              color={nodeColor} 
              opacity={0.8} 
              transparent={true} 
            />
          </Sphere>
          {showDataLabels && (
            <Text
              position={[0, node.connections * 0.05 + 0.2, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {node.label.length > 10 ? node.label.substring(0, 10) + '...' : node.label}
            </Text>
          )}
        </group>
      ))}
    </group>
  );
};

export const Network3DGraphRenderer = ({
  data,
  columns,
  xColumn,
  yColumn,
  chartColors,
  showDataLabels = true
}: Network3DGraphRendererProps) => {
  // Transform data into 3D network format
  const networkData = useMemo(() => {
    const nodes = new Map<string, { id: string; label: string; connections: number }>();
    const links: Array<{ source: string; target: string; strength: number }> = [];
    const linkCounts = new Map<string, number>();

    // Process data to extract nodes and links
    data.forEach(row => {
      const sourceId = String(row[xColumn] || '');
      const targetId = String(row[yColumn] || '');
      
      if (!sourceId || !targetId || sourceId === targetId) return;

      // Add nodes
      if (!nodes.has(sourceId)) {
        nodes.set(sourceId, { id: sourceId, label: sourceId, connections: 0 });
      }
      if (!nodes.has(targetId)) {
        nodes.set(targetId, { id: targetId, label: targetId, connections: 0 });
      }

      // Count connections
      const linkKey = `${sourceId}-${targetId}`;
      linkCounts.set(linkKey, (linkCounts.get(linkKey) || 0) + 1);
    });

    // Create links and update connection counts
    linkCounts.forEach((count, linkKey) => {
      const [source, target] = linkKey.split('-');
      links.push({ source, target, strength: count });
      
      if (nodes.has(source)) {
        nodes.get(source)!.connections += count;
      }
      if (nodes.has(target)) {
        nodes.get(target)!.connections += count;
      }
    });

    // Position nodes in 3D space using force-directed layout centered around origin
    const nodeArray = Array.from(nodes.values());
    const positionedNodes: GraphNode3D[] = nodeArray.map((node, index) => {
      const angle = (index / nodeArray.length) * Math.PI * 2;
      const radius = Math.min(1.5, nodeArray.length * 0.1); // Fit within axis bounds
      const height = (Math.random() - 0.5) * 1.5; // Limit height to axis bounds
      
      return {
        ...node,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number]
      };
    });

    // Create 3D links
    const positionedLinks: GraphLink3D[] = links.map(link => {
      const sourceNode = positionedNodes.find(n => n.id === link.source);
      const targetNode = positionedNodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode) {
        return { source: [0, 0, 0] as [number, number, number], target: [0, 0, 0] as [number, number, number], strength: 0 };
      }
      
      return {
        source: sourceNode.position,
        target: targetNode.position,
        strength: link.strength
      };
    }).filter(link => link.strength > 0);

    return {
      nodes: positionedNodes,
      links: positionedLinks
    };
  }, [data, xColumn, yColumn]);

  if (networkData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No 3D network data</p>
          <p className="text-sm">Select columns with related entities to create a 3D network visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <div className="mb-4 text-sm text-muted-foreground">
        3D Network: {networkData.nodes.length} nodes, {networkData.links.length} connections
      </div>
      <Canvas camera={{ position: [10, 10, 10], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <Network3D 
          networkData={networkData} 
          chartColors={chartColors} 
          showDataLabels={showDataLabels} 
        />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};