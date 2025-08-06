import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring } from '@react-spring/three';
import { StandardAxes3D } from '../utils/StandardAxes3D';
import { formatNumber } from '@/lib/numberUtils';

interface Scatter3DChartRendererProps {
  data: any[];
  xColumn: string;
  yColumn: string;
  zColumn: string;
  chartColors: string[];
  showDataLabels?: boolean;
  tileMode?: boolean;
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
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
    scale: hovered ? size * 3 : size,
    emissive: hovered ? 0.4 : isSelected ? 0.3 : 0.1,
    config: { tension: 300, friction: 10 }
  });
  
  useFrame((state) => {
    if (meshRef.current) {
      // Set base position from data, then add gentle floating animation as offset
      meshRef.current.position.set(
        position[0],
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.02,
        position[2]
      );
      
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
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color}
          metalness={hovered ? 0.6 : 0.2}
          roughness={hovered ? 0.05 : 0.2}
          emissive={isSelected ? '#4f46e5' : hovered ? '#06b6d4' : color}
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
                    <span className="font-medium">{key}:</span> {typeof value === 'number' ? formatNumber(value) : String(value)}
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
          fontSize={0.12}
          color="hsl(var(--foreground))"
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
  showDataLabels = false,
  tileMode = false,
  isTemporalAnimated = false,
  animationSpeed = 1000
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
    
    // Debug logging for data ranges
    console.log(`3D Scatter Debug - Data ranges:`, {
      x: { min: xMin, max: xMax, column: xColumn },
      y: { min: yMin, max: yMax, column: yColumn },
      z: { min: zMin, max: zMax, column: zColumn },
      sameZY: zColumn === yColumn
    });
    
    const scale = 4; // Use full 4-unit axis range for better space utilization
    
    // Calculate appropriate dot size based on data density
    const dataCount = data.length;
    const baseDotSize = Math.max(0.2, Math.min(0.3, 0.6 / Math.sqrt(dataCount)));
    
    // Increase size for tile mode to improve visibility
    const adjustedDotSize = tileMode ? baseDotSize * 4.0 : baseDotSize;
    
    console.log(`3D Scatter: Rendering ${dataCount} points with size ${adjustedDotSize} (tileMode: ${tileMode})`);
    
    return data.map((item, index) => {
      // Normalize all axes to centered range (-scale/2 to +scale/2) to match axis positioning
      const x = ((Number(item[xColumn]) || 0) - xMin) / (xMax - xMin || 1) * scale - scale / 2;
      const y = ((Number(item[yColumn]) || 0) - yMin) / (yMax - yMin || 1) * scale - scale / 2;
      
      // Always use actual Z-column data for proper 3D plotting
      const z = ((Number(item[zColumn]) || 0) - zMin) / (zMax - zMin || 1) * scale - scale / 2;
      
      return {
        position: [x, y, z] as [number, number, number],
        color: chartColors[index % chartColors.length],
        size: adjustedDotSize,
        label: `${item[xColumn]}, ${item[yColumn]}, ${item[zColumn]}`,
        key: `point-${index}`,
        originalData: item
      };
    });
  }, [data, xColumn, yColumn, zColumn, chartColors, tileMode]);

  return (
    <>
      {/* Standard 3D Axes with origin at (0,0,0) */}
      <StandardAxes3D 
        xLabel={xColumn}
        yLabel={yColumn}
        zLabel={zColumn}
        axisLength={4}
        showGrid={true}
        showOrigin={true}
        showZAxis={true}
      />
      
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
    </>
  );
};