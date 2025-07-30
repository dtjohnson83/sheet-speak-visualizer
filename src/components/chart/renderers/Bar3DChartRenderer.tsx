import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { animated, useSpring } from '@react-spring/three';

interface Bar3DChartRendererProps {
  data: any[];
  xColumn: string;
  yColumn: string;
  zColumn?: string;
  chartColors: string[];
  showDataLabels?: boolean;
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
  isSelected 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Animated spring for smooth transitions
  const springs = useSpring({
    scaleX: hovered ? scale[0] * 1.1 : scale[0],
    scaleY: hovered ? scale[1] * 1.1 : scale[1], 
    scaleZ: hovered ? scale[2] * 1.1 : scale[2],
    rotY: hovered ? Math.PI / 12 : 0,
    metalness: hovered ? 0.3 : 0.1,
    roughness: hovered ? 0.2 : 0.4,
    config: { tension: 300, friction: 10 }
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

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(
        springs.scaleX.get(),
        springs.scaleY.get(), 
        springs.scaleZ.get()
      );
      meshRef.current.rotation.y = springs.rotY.get();
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        scale={scale}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color}
          metalness={hovered ? 0.3 : 0.1}
          roughness={hovered ? 0.2 : 0.4}
          emissive={isSelected ? '#4f46e5' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[position[0], position[1] + scale[1] / 2 + 1, position[2]]}>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg pointer-events-none">
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">Value: {value}</div>
          </div>
        </Html>
      )}
      
      {showLabel && label && !hovered && (
        <Text
          position={[position[0], position[1] + scale[1] / 2 + 0.5, position[2]]}
          fontSize={0.3}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          {label}: {value}
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
  showDataLabels = false
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
    const spacing = 2;
    
    return data.map((item, index) => {
      const value = Number(item[yColumn]) || 0;
      const normalizedHeight = (value / maxValue) * 3; // Max height of 3 units
      
      const x = (index % Math.ceil(Math.sqrt(data.length))) * spacing - (Math.ceil(Math.sqrt(data.length)) * spacing) / 2;
      const z = Math.floor(index / Math.ceil(Math.sqrt(data.length))) * spacing - (Math.ceil(Math.sqrt(data.length)) * spacing) / 2;
      
      return {
        position: [x, normalizedHeight / 2, z] as [number, number, number],
        scale: [0.8, normalizedHeight, 0.8] as [number, number, number],
        color: chartColors[index % chartColors.length],
        label: String(item[xColumn]),
        value: value,
        key: `bar-${index}`
      };
    });
  }, [data, xColumn, yColumn, chartColors]);

  return (
    <>
      {/* Grid floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshPhongMaterial color="#f0f0f0" transparent opacity={0.3} />
      </mesh>
      
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
          />
        );
      })}
      
      {/* Axes */}
      <group>
        {/* X Axis */}
        <mesh position={[0, 0, -5]}>
          <cylinderGeometry args={[0.02, 0.02, 10]} />
          <meshBasicMaterial color="#666" />
        </mesh>
        
        {/* Y Axis */}
        <mesh position={[-5, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 4]} />
          <meshBasicMaterial color="#666" />
        </mesh>
        
        {/* Z Axis */}
        <mesh position={[-5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 10]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      </group>
    </>
  );
};