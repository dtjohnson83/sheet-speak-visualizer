import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring } from '@react-spring/three';

interface Scatter3DChartRendererProps {
  data: any[];
  xColumn: string;
  yColumn: string;
  zColumn: string;
  chartColors: string[];
  showDataLabels?: boolean;
}

interface PointProps {
  position: [number, number, number];
  color: string;
  size: number;
  label?: string;
  showLabel?: boolean;
  onHover?: (hovered: boolean, data?: any) => void;
  onClick?: (data?: any) => void;
  isSelected?: boolean;
  originalData?: any;
}

const Point3D: React.FC<PointProps> = ({ 
  position, 
  color, 
  size, 
  label, 
  showLabel, 
  onHover, 
  onClick, 
  isSelected,
  originalData 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const springs = useSpring({
    scale: hovered ? size * 2 : size,
    emissive: hovered ? 0.3 : isSelected ? 0.2 : 0,
    config: { tension: 300, friction: 10 }
  });
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.02;
      
      // Apply spring animations
      meshRef.current.scale.setScalar(springs.scale.get());
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true, { label, originalData, position });
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.({ label, originalData, position });
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        castShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color}
          metalness={hovered ? 0.4 : 0.1}
          roughness={hovered ? 0.1 : 0.3}
          emissive={isSelected ? '#4f46e5' : hovered ? '#06b6d4' : '#000000'}
          emissiveIntensity={springs.emissive.get()}
        />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[position[0], position[1] + size + 0.5, position[2]]}>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg pointer-events-none">
            <div className="text-sm font-medium text-foreground">{label}</div>
            {originalData && (
              <div className="text-xs text-muted-foreground space-y-1">
                {Object.entries(originalData).slice(0, 3).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Html>
      )}
      
      {showLabel && label && !hovered && (
        <Text
          position={[position[0], position[1] + size + 0.3, position[2]]}
          fontSize={0.2}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.5, size * 1.8, 16]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
};

export const Scatter3DChartRenderer: React.FC<Scatter3DChartRendererProps> = ({
  data,
  xColumn,
  yColumn,
  zColumn,
  chartColors,
  showDataLabels = false
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<Set<string>>(new Set());

  const handlePointHover = (hovered: boolean, data?: any) => {
    if (hovered && data) {
      setHoveredPoint(`${data.label}`);
    } else {
      setHoveredPoint(null);
    }
  };

  const handlePointClick = (data?: any) => {
    if (data) {
      const pointId = `${data.label}`;
      setSelectedPoints(prev => {
        const newSet = new Set(prev);
        if (newSet.has(pointId)) {
          newSet.delete(pointId);
        } else {
          newSet.add(pointId);
        }
        return newSet;
      });
    }
  };
  const points = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get min/max values for normalization
    const xValues = data.map(d => Number(d[xColumn]) || 0);
    const yValues = data.map(d => Number(d[yColumn]) || 0);
    const zValues = data.map(d => Number(d[zColumn]) || 0);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);
    
    const scale = 4; // Spread points across 8x8x8 space
    
    return data.map((item, index) => {
      const x = ((Number(item[xColumn]) || 0) - xMin) / (xMax - xMin || 1) * scale - scale / 2;
      const y = ((Number(item[yColumn]) || 0) - yMin) / (yMax - yMin || 1) * scale - scale / 2;
      const z = ((Number(item[zColumn]) || 0) - zMin) / (zMax - zMin || 1) * scale - scale / 2;
      
      return {
        position: [x, y, z] as [number, number, number],
        color: chartColors[index % chartColors.length],
        size: 0.1,
        label: `${item[xColumn]}, ${item[yColumn]}, ${item[zColumn]}`,
        key: `point-${index}`
      };
    });
  }, [data, xColumn, yColumn, zColumn, chartColors]);

  return (
    <>
      {/* Reference grid */}
      <group>
        {/* Grid lines */}
        {Array.from({ length: 9 }, (_, i) => {
          const pos = (i - 4) * 0.5;
          return (
            <group key={`grid-${i}`}>
              {/* X-direction lines */}
              <mesh position={[0, -2, pos]}>
                <cylinderGeometry args={[0.005, 0.005, 4]} />
                <meshBasicMaterial color="#ddd" transparent opacity={0.3} />
              </mesh>
              {/* Z-direction lines */}
              <mesh position={[pos, -2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.005, 0.005, 4]} />
                <meshBasicMaterial color="#ddd" transparent opacity={0.3} />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* 3D Points */}
      {points.map((point, index) => {
        const pointId = point.label;
        return (
          <Point3D
            key={point.key}
            position={point.position}
            color={point.color}
            size={point.size}
            label={point.label}
            showLabel={showDataLabels}
            onHover={handlePointHover}
            onClick={handlePointClick}
            isSelected={selectedPoints.has(pointId)}
            originalData={data[index]}
          />
        );
      })}
      
      {/* Axes with labels */}
      <group>
        {/* X Axis */}
        <mesh position={[0, -2.5, -2.5]}>
          <cylinderGeometry args={[0.02, 0.02, 4]} />
          <meshBasicMaterial color="#e74c3c" />
        </mesh>
        <Text position={[2.5, -2.5, -2.5]} fontSize={0.3} color="#e74c3c">
          {xColumn}
        </Text>
        
        {/* Y Axis */}
        <mesh position={[-2.5, 0, -2.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 4]} />
          <meshBasicMaterial color="#2ecc71" />
        </mesh>
        <Text position={[-2.5, 2.5, -2.5]} fontSize={0.3} color="#2ecc71">
          {yColumn}
        </Text>
        
        {/* Z Axis */}
        <mesh position={[-2.5, -2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 4]} />
          <meshBasicMaterial color="#3498db" />
        </mesh>
        <Text position={[-2.5, -2.5, 2.5]} fontSize={0.3} color="#3498db">
          {zColumn}
        </Text>
      </group>
    </>
  );
};