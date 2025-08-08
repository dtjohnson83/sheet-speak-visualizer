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
  seriesColumn?: string;
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
  seriesColumn,
  chartColors,
  showDataLabels = false,
  tileMode = false,
  isTemporalAnimated = false,
  animationSpeed = 1000
}) => {
  const [hoveredCube, setHoveredCube] = useState<string | null>(null);
  const [selectedCubes, setSelectedCubes] = useState<Set<string>>(new Set());
  
  // Determine if the provided zColumn actually exists in the current data
  const hasZData = useMemo(() => {
    return zColumn ? (data?.some((row: any) => row && row[zColumn] !== undefined && row[zColumn] !== null) || false) : false;
  }, [data, zColumn]);
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
    console.log('TimeSeries3DChartRenderer: Processing data', { 
      dataLength: data?.length || 0, 
      xColumn, 
      yColumn, 
      zColumn,
      firstDataItem: data?.[0]
    });

    if (!data || data.length === 0) {
      console.log('TimeSeries3DChartRenderer: No data provided');
      return { cubes: [], connections: [] };
    }

    // Ensure we have valid column names and data
    if (!xColumn || !yColumn) {
      console.warn('TimeSeries3DChartRenderer: Missing required columns', { xColumn, yColumn });
      return { cubes: [], connections: [] };
    }

    // Only require zColumn if at least one row actually has it
    const requireZ = Boolean(zColumn && data.some((row: any) => row && row[zColumn] !== undefined && row[zColumn] !== null));

    // Filter data - only require zColumn if it's present in the dataset
    const validData = data.filter(item => {
      const isValid = item && 
        item[xColumn] !== undefined && 
        item[yColumn] !== undefined &&
        (!requireZ || item[zColumn] !== undefined) &&
        !isNaN(Number(item[yColumn]));
      
      if (!isValid) {
        console.log('Filtering out invalid item:', {
          item,
          hasX: item?.[xColumn] !== undefined,
          hasY: item?.[yColumn] !== undefined,
          hasZ: !requireZ || item?.[zColumn] !== undefined,
          yIsNumber: !isNaN(Number(item?.[yColumn]))
        });
      }
      
      return isValid;
    });

    console.log('TimeSeries3DChartRenderer: Valid data after filtering', { 
      originalCount: data.length, 
      validCount: validData.length,
      requireZ,
      sampleValidItem: validData[0]
    });

    // Sort data - use zColumn if required/present, otherwise sort by category
    const sortedData = validData.sort((a, b) => {
      if (requireZ) {
        // Sort by date/time using zColumn (temporal axis)
        const aTime = new Date(a[zColumn]).getTime();
        const bTime = new Date(b[zColumn]).getTime();
        if (!isNaN(aTime) && !isNaN(bTime)) {
          return aTime - bTime;
        }
        // Fallback to string comparison
        return String(a[zColumn]).localeCompare(String(b[zColumn]));
      } else {
        // No temporal column in the data, order by category for stability
        return String(a[xColumn]).localeCompare(String(b[xColumn]));
      }
    });

    if (sortedData.length === 0) {
      console.warn('TimeSeries3DChartRenderer: No valid data after filtering and sorting');
      return { cubes: [], connections: [] };
    }

    const maxValue = Math.max(...validData.map(d => Number(d[yColumn]) || 0));
    const minValue = Math.min(...validData.map(d => Number(d[yColumn]) || 0));
    const valueRange = maxValue - minValue || 1;
    
    // Group data by category (xColumn) and process by time (zColumn)
    const categoryGroups = validData.reduce((groups, item) => {
      const category = String(item[xColumn]);
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    }, {} as Record<string, any[]>);

    const categories = Object.keys(categoryGroups);
    const cubeSize = tileMode ? Math.min(0.6, 3.0 / validData.length) : 0.4;
    
    const cubeList: any[] = [];
    
    categories.forEach((category, categoryIndex) => {
      const categoryData = categoryGroups[category].sort((a, b) => {
        if (zColumn && validData.some((row: any) => row && row[zColumn] !== undefined && row[zColumn] !== null)) {
          // Sort by date within each category
          const aTime = new Date(a[zColumn]).getTime();
          const bTime = new Date(b[zColumn]).getTime();
          if (!isNaN(aTime) && !isNaN(bTime)) {
            return aTime - bTime;
          }
          return String(a[zColumn]).localeCompare(String(b[zColumn]));
        } else {
          // No temporal sorting, maintain original order
          return 0;
        }
      });
      
      categoryData.forEach((item, timeIndex) => {
        const value = Number(item[yColumn]) || 0;
        const normalizedValue = (value - minValue) / valueRange;
        const cubeHeight = Math.max(0.3, normalizedValue * 4); // Height based on value
        
        // Position: X = time progression, Y = value height, Z = category separation
        const timeSpacing = tileMode ? Math.min(1.2, 6.0 / categoryData.length) : 1.0;
        const categorySpacing = 2.0;
        const totalTimeWidth = (categoryData.length - 1) * timeSpacing;
        const totalCategoryDepth = (categories.length - 1) * categorySpacing;
        
        const x = -totalTimeWidth / 2 + timeIndex * timeSpacing; // Time progression
        const y = cubeHeight / 2; // Value height
        const z = -totalCategoryDepth / 2 + categoryIndex * categorySpacing; // Category separation
        
        // Category-based color
        const categoryColor = chartColors.length > 0 
          ? chartColors[categoryIndex % chartColors.length] 
          : `hsl(${(categoryIndex * 60) % 360}, 70%, 60%)`;
        
        // Generate label based on available data
        const label = (zColumn && (item[zColumn] !== undefined && item[zColumn] !== null))
          ? `${category} - ${new Date(item[zColumn]).toLocaleDateString()}`
          : `${category} - Point ${timeIndex + 1}`;
        
        cubeList.push({
          position: [x, y, z] as [number, number, number],
          scale: [cubeSize * 0.8, cubeHeight, cubeSize * 0.8] as [number, number, number],
          color: categoryColor,
          label: label,
          value: value,
          timeIndex: timeIndex,
          category: category,
          categoryIndex: categoryIndex,
          key: `timecube-${categoryIndex}-${timeIndex}`
        });
      });
    });

    // Create connections between consecutive time points within each category
    const connectionsList: any[] = [];
    categories.forEach((category, categoryIndex) => {
      const categoryCubes = cubeList.filter(cube => cube.category === category);
      for (let i = 0; i < categoryCubes.length - 1; i++) {
        const start = categoryCubes[i].position;
        const end = categoryCubes[i + 1].position;
        connectionsList.push({
          start: [start[0], start[1], start[2]] as [number, number, number],
          end: [end[0], end[1], end[2]] as [number, number, number],
          key: `connection-${categoryIndex}-${i}`
        });
      }
    });

    return { cubes: cubeList, connections: connectionsList };
  }, [data, xColumn, yColumn, zColumn, chartColors, tileMode]);

  // Early return if no cubes to render
  if (cubes.length === 0) {
    return (
      <group>
      <StandardAxes3D 
        xLabel={hasZData ? (zColumn || 'Index') : 'Index'}
        yLabel={yColumn || 'Value'}
        zLabel={seriesColumn || xColumn || 'Series'}
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
        xLabel={hasZData ? (zColumn || 'Index') : (xColumn || 'Index')}
        yLabel={yColumn}
        zLabel={seriesColumn || xColumn || 'Series'}
        axisLength={6}
        showGrid={true}
        showOrigin={true}
        showZAxis={true}
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