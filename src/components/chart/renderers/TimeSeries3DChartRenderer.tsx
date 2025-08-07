import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { StandardAxes3D } from '../utils/StandardAxes3D';
import { formatNumber } from '@/lib/numberUtils';

interface TimeSeries3DChartRendererProps {
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

interface CubeProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  label?: string;
  value?: number;
  timeIndex?: number;
  showLabel?: boolean;
  onHover?: (hovered: boolean, data?: any) => void;
  onClick?: (data?: any) => void;
  isSelected?: boolean;
  isTemporalAnimated?: boolean;
  animationSpeed?: number;
}

const TimeCube: React.FC<CubeProps> = ({ 
  position, 
  scale, 
  color, 
  label, 
  value, 
  timeIndex,
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
  
  // Animation targets
  const targetScale = useRef(new THREE.Vector3(...scale));
  const currentScale = useRef(new THREE.Vector3(...scale));
  const targetPosition = useRef(new THREE.Vector3(...position));
  const currentPosition = useRef(new THREE.Vector3(...position));
  const targetMaterial = useRef({ metalness: 0.1, roughness: 0.4, opacity: 0.8 });
  const currentMaterial = useRef({ metalness: 0.1, roughness: 0.4, opacity: 0.8 });
  
  // Update targets when props change
  useEffect(() => {
    targetScale.current.set(...scale);
    targetPosition.current.set(...position);
  }, [scale, position]);
  
  // Update targets when hover state changes
  useEffect(() => {
    if (hovered) {
      targetScale.current.set(scale[0] * 1.15, scale[1] * 1.15, scale[2] * 1.15);
      targetMaterial.current = { metalness: 0.4, roughness: 0.1, opacity: 0.95 };
    } else {
      targetScale.current.set(...scale);
      targetMaterial.current = { metalness: 0.1, roughness: 0.4, opacity: 0.8 };
    }
  }, [hovered, scale]);
  
  // Smooth animation using useFrame
  useFrame((state, delta) => {
    if (meshRef.current && materialRef.current) {
      const speed = isTemporalAnimated ? delta * (1000 / animationSpeed) : delta * 6;
      
      // Animate scale
      currentScale.current.lerp(targetScale.current, speed);
      meshRef.current.scale.copy(currentScale.current);
      
      // Animate position
      currentPosition.current.lerp(targetPosition.current, speed);
      meshRef.current.position.copy(currentPosition.current);
      
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
      currentMaterial.current.opacity = THREE.MathUtils.lerp(
        currentMaterial.current.opacity, 
        targetMaterial.current.opacity, 
        speed
      );
      
      materialRef.current.metalness = currentMaterial.current.metalness;
      materialRef.current.roughness = currentMaterial.current.roughness;
      materialRef.current.opacity = currentMaterial.current.opacity;
      
      // Time-based glow effect and wave animation
      if (isTemporalAnimated && timeIndex !== undefined) {
        const waveOffset = (timeIndex || 0) * 0.5; // Stagger the wave
        const waveIntensity = Math.sin(state.clock.elapsedTime * 3 - waveOffset) * 0.2 + 0.3;
        const pulseIntensity = Math.sin(state.clock.elapsedTime * 2 + waveOffset) * 0.1 + 0.1;
        
        materialRef.current.emissiveIntensity = Math.max(waveIntensity, pulseIntensity);
        
        // Progressive highlight effect
        const timeProgress = (timeIndex || 0) / 10; // Assuming max 10 time points for demo
        const highlightPhase = (state.clock.elapsedTime * 0.5) % 2; // 2-second cycle
        if (highlightPhase > timeProgress && highlightPhase < timeProgress + 0.2) {
          materialRef.current.emissiveIntensity = 0.8; // Strong highlight when wave passes
        }
      }
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true, { label, value, timeIndex, position });
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.({ label, value, timeIndex, position });
  };

  return (
    <group>
      <mesh
        ref={meshRef}
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
          emissive={isSelected ? '#4f46e5' : color}
          emissiveIntensity={isSelected ? 0.3 : 0.05}
          transparent
        />
      </mesh>

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[currentPosition.current.x, currentPosition.current.y + currentScale.current.y / 2 + 1, currentPosition.current.z]}>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg pointer-events-none">
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">Value: {formatNumber(value || 0)}</div>
            {timeIndex !== undefined && (
              <div className="text-xs text-muted-foreground">Time Index: {timeIndex}</div>
            )}
          </div>
        </Html>
      )}
      
      {showLabel && label && !hovered && (
        <Text
          position={[currentPosition.current.x, currentPosition.current.y + currentScale.current.y / 2 + 0.5, currentPosition.current.z]}
          fontSize={0.2}
          color="hsl(var(--foreground))"
          anchorX="center"
          anchorY="middle"
        >
          {String(value ? formatNumber(value) : label)}
        </Text>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[currentPosition.current.x, -0.05, currentPosition.current.z]}>
          <cylinderGeometry args={[0.7, 0.7, 0.05]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

export const TimeSeries3DChartRenderer: React.FC<TimeSeries3DChartRendererProps> = ({
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
  const [hoveredCube, setHoveredCube] = useState<string | null>(null);
  const [selectedCubes, setSelectedCubes] = useState<Set<string>>(new Set());

  const handleCubeHover = (hovered: boolean, data?: any) => {
    if (hovered && data) {
      setHoveredCube(`${data.label}-${data.timeIndex}`);
    } else {
      setHoveredCube(null);
    }
  };

  const handleCubeClick = (data?: any) => {
    if (data) {
      const cubeId = `${data.label}-${data.timeIndex}`;
      setSelectedCubes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cubeId)) {
          newSet.delete(cubeId);
        } else {
          newSet.add(cubeId);
        }
        return newSet;
      });
    }
  };

  const { cubes, connections } = useMemo(() => {
    if (!data || data.length === 0) return { cubes: [], connections: [] };

    // Ensure we have valid column names and data
    if (!xColumn || !yColumn) {
      console.warn('TimeSeries3DChartRenderer: Missing required columns', { xColumn, yColumn });
      return { cubes: [], connections: [] };
    }

    // Filter and sort data by time
    const validData = data.filter(item => 
      item && 
      item[xColumn] !== undefined && 
      item[yColumn] !== undefined &&
      !isNaN(Number(item[yColumn]))
    ).sort((a, b) => {
      // Try to sort by date if xColumn contains dates
      const aTime = new Date(a[xColumn]).getTime();
      const bTime = new Date(b[xColumn]).getTime();
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return aTime - bTime;
      }
      // Fallback to string comparison
      return String(a[xColumn]).localeCompare(String(b[xColumn]));
    });

    if (validData.length === 0) {
      console.warn('TimeSeries3DChartRenderer: No valid data after filtering', { data, xColumn, yColumn });
      return { cubes: [], connections: [] };
    }

    const maxValue = Math.max(...validData.map(d => Number(d[yColumn]) || 0));
    const minValue = Math.min(...validData.map(d => Number(d[yColumn]) || 0));
    const valueRange = maxValue - minValue || 1;
    
    // Create a 3D time series cube layout
    const timeSteps = validData.length;
    const cubeSize = tileMode ? Math.min(0.8, 3.0 / timeSteps) : 0.4;
    const spacing = tileMode ? Math.min(1.0, 4.0 / timeSteps) : 0.6;
    
    const cubeList = validData.map((item, index) => {
      const value = Number(item[yColumn]) || 0;
      const normalizedValue = (value - minValue) / valueRange;
      const cubeHeight = Math.max(0.3, normalizedValue * 4); // Height based on value
      
      // Linear time progression along X-axis (left to right = past to future)
      const timeSpacing = tileMode ? Math.min(1.2, 6.0 / timeSteps) : 1.0;
      const totalWidth = (timeSteps - 1) * timeSpacing;
      const x = -totalWidth / 2 + index * timeSpacing; // Center the timeline
      const y = cubeHeight / 2; // Height based on value
      const z = zColumn ? Number(item[zColumn]) || 0 : 0; // Series depth if z-column exists
      
      // Time-based color gradient (cool to warm, past to future)
      const timeProgress = index / (timeSteps - 1);
      const hue = 240 - (timeProgress * 120); // Blue (240) to Red (120)
      const timeColor = `hsl(${hue}, 70%, 60%)`;
      
      return {
        position: [x, y, z] as [number, number, number],
        scale: [cubeSize * 0.8, cubeHeight, cubeSize * 0.8] as [number, number, number], // More rectangular for time series
        color: chartColors.length > 0 ? chartColors[index % chartColors.length] : timeColor,
        label: String(item[xColumn] || `Time ${index + 1}`),
        value: value,
        timeIndex: index,
        key: `timecube-${index}`
      };
    });

    // Create connections between consecutive time points
    const connectionsList = [];
    for (let i = 0; i < cubeList.length - 1; i++) {
      const start = cubeList[i].position;
      const end = cubeList[i + 1].position;
      connectionsList.push({
        start: [start[0], start[1], start[2]] as [number, number, number],
        end: [end[0], end[1], end[2]] as [number, number, number],
        key: `connection-${i}`
      });
    }

    return { cubes: cubeList, connections: connectionsList };
  }, [data, xColumn, yColumn, chartColors, tileMode]);

  // Early return if no cubes to render
  if (cubes.length === 0) {
    return (
      <group>
        <StandardAxes3D 
          xLabel="Time"
          yLabel={yColumn || "Value"}
          zLabel="Series"
          axisLength={4}
          showGrid={true}
          showOrigin={true}
          showZAxis={true}
        />
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }

  return (
    <>
      {/* Standard 3D Axes */}
      <StandardAxes3D 
        xLabel="Time →"
        yLabel={yColumn}
        zLabel={zColumn ? "Series" : ""}
        axisLength={6}
        showGrid={true}
        showOrigin={true}
        showZAxis={!!zColumn}
      />
      
      {/* Time axis markers and labels */}
      {cubes.map((cube, index) => {
        if (index % Math.max(1, Math.floor(cubes.length / 5)) === 0) { // Show every nth label
          return (
            <group key={`time-marker-${index}`}>
              {/* Time marker on ground */}
              <mesh position={[cube.position[0], -0.1, cube.position[2]]}>
                <cylinderGeometry args={[0.05, 0.05, 0.1]} />
                <meshBasicMaterial color="hsl(var(--muted-foreground))" />
              </mesh>
              {/* Time label */}
              <Text
                position={[cube.position[0], -0.5, cube.position[2]]}
                fontSize={0.15}
                color="hsl(var(--muted-foreground))"
                anchorX="center"
                anchorY="middle"
                rotation={[-Math.PI/2, 0, 0]}
              >
                {cube.label}
              </Text>
            </group>
          );
        }
        return null;
      })}
      
      {/* Time series connections - Enhanced visibility */}
      {connections.map((connection, index) => (
        <Line
          key={connection.key}
          points={[connection.start, connection.end]}
          color="hsl(var(--primary))"
          lineWidth={4}
          transparent
          opacity={0.8}
        />
      ))}
      
      {/* Time progression flow effect */}
      {connections.map((connection, index) => (
        <Line
          key={`glow-${connection.key}`}
          points={[connection.start, connection.end]}
          color="hsl(var(--primary))"
          lineWidth={8}
          transparent
          opacity={0.2}
        />
      ))}
      
      {/* Animated wave effect along timeline */}
      {isTemporalAnimated && connections.length > 0 && (
        <group>
          {connections.map((connection, index) => {
            const wavePhase = (index / connections.length) * Math.PI * 2;
            return (
              <Line
                key={`wave-${connection.key}`}
                points={[connection.start, connection.end]}
                color="hsl(var(--accent))"
                lineWidth={6}
                transparent
                opacity={0.4 + Math.sin(wavePhase) * 0.2}
              />
            );
          })}
        </group>
      )}
      
      {/* 3D Time Cubes */}
      {cubes.map((cube) => {
        const cubeId = `${cube.label}-${cube.timeIndex}`;
        return (
          <TimeCube
            key={cube.key}
            position={cube.position}
            scale={cube.scale}
            color={cube.color}
            label={cube.label}
            value={cube.value}
            timeIndex={cube.timeIndex}
            showLabel={showDataLabels}
            onHover={handleCubeHover}
            onClick={handleCubeClick}
            isSelected={selectedCubes.has(cubeId)}
            isTemporalAnimated={isTemporalAnimated}
            animationSpeed={animationSpeed}
          />
        );
      })}
      
      {/* Timeline base indicator */}
      {cubes.length > 0 && (
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[(cubes.length - 1) * 1.0 + 1, 0.02, 0.1]} />
          <meshBasicMaterial color="hsl(var(--border))" transparent opacity={0.5} />
        </mesh>
      )}
    </>
  );
};