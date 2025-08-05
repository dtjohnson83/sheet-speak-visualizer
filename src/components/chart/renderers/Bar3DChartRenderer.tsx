import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { StandardAxes3D } from '../utils/StandardAxes3D';
import { formatNumber } from '@/lib/numberUtils';

interface Bar3DChartRendererProps {
  data: any[];
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  chartColors: string[];
  showDataLabels?: boolean;
  tileMode?: boolean;
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
}

interface BarProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  label?: string;
  value?: number;
  showLabel?: boolean;
  onHover?: (hovered: boolean, data?: any) => void;
  onClick?: (data?: any) => void;
  isSelected?: boolean;
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
}

const Bar3D: React.FC<BarProps> = ({ 
  position, 
  scale, 
  color, 
  label, 
  value, 
  showLabel, 
  onHover, 
  onClick, 
  isSelected,
  isTemporalAnimated = false,
  animationSpeed = 1000
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Target values for animation
  const targetScale = useRef(new THREE.Vector3(...scale));
  const currentScale = useRef(new THREE.Vector3(...scale));
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const targetMaterial = useRef({ metalness: 0.1, roughness: 0.4 });
  const currentMaterial = useRef({ metalness: 0.1, roughness: 0.4 });
  
  // Update targets when props change
  React.useEffect(() => {
    targetScale.current.set(...scale);
  }, [scale]);
  
  // Update targets when hover state changes
  React.useEffect(() => {
    if (hovered) {
      targetScale.current.set(scale[0] * 1.1, scale[1] * 1.1, scale[2] * 1.1);
      targetRotation.current = Math.PI / 12;
      targetMaterial.current = { metalness: 0.3, roughness: 0.2 };
    } else {
      targetScale.current.set(...scale);
      targetRotation.current = 0;
      targetMaterial.current = { metalness: 0.1, roughness: 0.4 };
    }
  }, [hovered, scale]);
  
  // Manual animation using useFrame
  useFrame((state, delta) => {
    if (meshRef.current && materialRef.current) {
      const speed = isTemporalAnimated ? delta * (1000 / animationSpeed) : delta * 8;
      
      // Animate scale
      currentScale.current.lerp(targetScale.current, speed);
      meshRef.current.scale.copy(currentScale.current);
      
      // Animate rotation
      currentRotation.current = THREE.MathUtils.lerp(currentRotation.current, targetRotation.current, speed);
      meshRef.current.rotation.y = currentRotation.current;
      
      // Animate material properties
      currentMaterial.current.metalness = THREE.MathUtils.lerp(
        currentMaterial.current.metalness, 
        targetMaterial.current.metalness, 
        speed
      );
      currentMaterial.current.roughness = THREE.MathUtils.lerp(
        currentMaterial.current.roughness, 
        targetMaterial.current.roughness, 
        speed
      );
      
      materialRef.current.metalness = currentMaterial.current.metalness;
      materialRef.current.roughness = currentMaterial.current.roughness;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true, { label, value, position });
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    setClicked(!clicked);
    onClick?.({ label, value, position });
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={hovered ? '#ffffff' : color}
          emissive={isSelected ? '#4f46e5' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[position[0], position[1] + scale[1] / 2 + 1, position[2]]}>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg pointer-events-none">
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">Value: {formatNumber(value || 0)}</div>
          </div>
        </Html>
      )}
      
      {showLabel && label && !hovered && (
        <Text
          position={[position[0], position[1] + scale[1] / 2 + 0.5, position[2]]}
          fontSize={0.4}
          color="hsl(var(--foreground))"
          anchorX="center"
          anchorY="middle"
        >
          {label}: {formatNumber(value || 0)}
        </Text>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[position[0], -0.05, position[2]]}>
          <cylinderGeometry args={[0.6, 0.6, 0.05]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

export const Bar3DChartRenderer: React.FC<Bar3DChartRendererProps> = ({
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
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [selectedBars, setSelectedBars] = useState<Set<string>>(new Set());

  const handleBarHover = (hovered: boolean, data?: any) => {
    if (hovered && data) {
      setHoveredBar(`${data.label}-${data.value}`);
    } else {
      setHoveredBar(null);
    }
  };

  const handleBarClick = (data?: any) => {
    if (data) {
      const barId = `${data.label}-${data.value}`;
      setSelectedBars(prev => {
        const newSet = new Set(prev);
        if (newSet.has(barId)) {
          newSet.delete(barId);
        } else {
          newSet.add(barId);
        }
        return newSet;
      });
    }
  };
  const bars = useMemo(() => {
    if (!data || data.length === 0) return [];

    const maxValue = Math.max(...data.map(d => Number(d[yColumn]) || 0));
    const gridSize = Math.ceil(Math.sqrt(data.length));
    const spacing = 3.5 / gridSize; // Fit within axis bounds
    
    // Adjust bar width for tile mode - increased for better visibility
    const barWidth = tileMode ? Math.min(1.2, 2.0 / gridSize) : 0.6;
    
    return data.map((item, index) => {
      const value = Number(item[yColumn]) || 0;
      const normalizedHeight = (value / maxValue) * 4; // Max height of 4 units for better vertical space usage
      
      // Position bars relative to origin (0,0,0)
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = (col - (gridSize - 1) / 2) * spacing;
      const z = (row - (gridSize - 1) / 2) * spacing;
      
      return {
        position: [x, normalizedHeight / 2, z] as [number, number, number],
        scale: [barWidth, Math.max(0.1, normalizedHeight), barWidth] as [number, number, number],
        color: chartColors[index % chartColors.length],
        label: String(item[xColumn]),
        value: value,
        key: `bar-${index}`
      };
    });
  }, [data, xColumn, yColumn, chartColors]);

  return (
    <>
      {/* Standard 3D Axes with origin at (0,0,0) */}
      <StandardAxes3D 
        xLabel={xColumn}
        yLabel={yColumn}
        zLabel={zColumn || "Category"}
        axisLength={4}
        showGrid={true}
        showOrigin={true}
        showZAxis={zColumn && zColumn !== yColumn}
      />
      
      {/* 3D Bars */}
      {bars.map((bar) => {
        const barId = `${bar.label}-${bar.value}`;
        return (
          <Bar3D
            key={bar.key}
            position={bar.position}
            scale={bar.scale}
            color={bar.color}
            label={bar.label}
            value={bar.value}
            showLabel={showDataLabels}
            onHover={handleBarHover}
            onClick={handleBarClick}
            isSelected={selectedBars.has(barId)}
            isTemporalAnimated={isTemporalAnimated}
            animationSpeed={animationSpeed}
          />
        );
      })}
    </>
  );
};