import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

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
}

const Bar3D: React.FC<BarProps> = ({ position, scale, color, label, value, showLabel }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle hover animation
      const hovered = false; // TODO: Add hover detection
      meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
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
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial color={color} />
      </mesh>
      
      {showLabel && label && (
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
      {bars.map((bar) => (
        <Bar3D
          key={bar.key}
          position={bar.position}
          scale={bar.scale}
          color={bar.color}
          label={bar.label}
          value={bar.value}
          showLabel={showDataLabels}
        />
      ))}
      
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