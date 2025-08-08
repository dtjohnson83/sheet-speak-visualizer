import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { StandardAxes3D } from '../utils/StandardAxes3D';
import { formatNumber } from '@/lib/numberUtils';
import { convertValueToDate } from '@/lib/dateConversion';

interface TimeSeries3DChartRendererProps {
  data: any[];
  xColumn: string;        // Should be 'location' (categories)
  yColumn: string;        // Should be 'temperature' (values) 
  zColumn?: string;       // Should be 'date' (time axis)
  seriesColumn?: string;  // Should be 'location' (same as xColumn for time series)
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
  
  // Build a robust list of all keys across a data sample
  const allKeys = useMemo(() => {
    const sample = Array.isArray(data) ? data.slice(0, 200) : [];
    const set = new Set<string>();
    sample.forEach((row: any) => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(k => set.add(k));
      }
    });
    return Array.from(set);
  }, [data]);

  // Resolve actual data keys by case-insensitive matching against allKeys
  const resolveColumnName = useMemo(() => {
    return (col?: string) => {
      if (!col) return undefined;
      if (allKeys.includes(col)) return col;
      const found = allKeys.find(k => k.toLowerCase() === String(col).toLowerCase());
      return found || col;
    };
  }, [allKeys]);

  const xKey = useMemo(() => resolveColumnName(xColumn), [resolveColumnName, xColumn]);
  const yKey = useMemo(() => resolveColumnName(yColumn), [resolveColumnName, yColumn]);
  const zKey = useMemo(() => resolveColumnName(zColumn), [resolveColumnName, zColumn]);

  // CRITICAL FIX: Ensure we're working with raw data, not aggregated
  console.log('TimeSeries3DChartRenderer: Input validation', {
    totalDataPoints: data?.length || 0,
    xColumn,
    yColumn, 
    zColumn,
    firstRecord: data?.[0],
    sampleRecords: data?.slice(0, 3)
  });

  // If we only have 8 data points for 8 locations, this indicates pre-aggregation
  if (data?.length === 8 && allKeys.includes(xColumn)) {
    console.warn('⚠️ DETECTED AGGREGATED DATA - Need raw time series data with all time points');
    console.log('Expected: ~1,344 records (8 locations × 7 days × 24 hours)');
    console.log('Received:', data.length, 'records');
  }

  // Date/time parsing (supports Date objects, ISO strings, and Excel serials)
  const parseTime = (val: any): number => {
    if (val == null) return NaN;
    if (val instanceof Date) return val.getTime();
    if (typeof val === 'number') {
      // Rough detection of Excel date serial range
      if (val > 20000 && val < 60000) {
        const iso = convertValueToDate(val);
        const t = Date.parse(iso);
        return isNaN(t) ? NaN : t;
      }
    }
    const iso = convertValueToDate(val);
    const t = Date.parse(iso);
    return isNaN(t) ? NaN : t;
  };

  // Infer keys if not provided or mismatched
  const dataKeys = useMemo(() => {
    const firstRow = data?.find((r: any) => r && typeof r === 'object') || {};
    return Object.keys(firstRow);
  }, [data]);

  const inferred = useMemo(() => {
    const sample = Array.isArray(data) ? data.slice(0, 50) : [];
    const stats: Record<string, { numeric: number; date: number; stringish: number; distinct: Set<any> }>= {};
    dataKeys.forEach(k => (stats[k] = { numeric: 0, date: 0, stringish: 0, distinct: new Set() }));
    sample.forEach((row: any) => {
      dataKeys.forEach(k => {
        const v = row?.[k];
        if (v !== undefined && v !== null) {
          stats[k].distinct.add(v);
          const t = parseTime(v);
          if (!isNaN(t)) stats[k].date++;
          let n: number = NaN;
          if (typeof v === 'number') n = v;
          else if (typeof v === 'string') {
            const cleaned = v.replace(/[^0-9.+\-eE]/g, '');
            const parsed = parseFloat(cleaned);
            if (Number.isFinite(parsed)) n = parsed;
          }
          if (Number.isFinite(n)) stats[k].numeric++;
          if (typeof v === 'string') stats[k].stringish++;
        }
      });
    });
    const keys = Object.keys(stats);
    const infY = keys.sort((a,b)=> stats[b].numeric - stats[a].numeric)[0];
    const infZ = keys.sort((a,b)=> stats[b].date - stats[a].date)[0];
    const infX = keys.sort((a,b)=> (stats[b].stringish || 0) - (stats[a].stringish || 0) || (stats[b].distinct.size - stats[a].distinct.size))[0];
    return { infX, infY, infZ };
  }, [data, dataKeys]);

  const effXKey = (xKey && dataKeys.includes(xKey)) ? xKey : inferred.infX;
  const effYKey = (yKey && dataKeys.includes(yKey)) ? yKey : inferred.infY;
  const effZKey = (zKey && dataKeys.includes(zKey)) ? zKey : inferred.infZ;
  
  // Determine if the provided zColumn actually exists in the current data
  const hasZData = useMemo(() => {
    return effZKey ? (data?.some((row: any) => row && row[effZKey] !== undefined && row[effZKey] !== null) || false) : false;
  }, [data, effZKey]);
  
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

  const { cubes, connections, uniqueTimes, uniqueCategories } = useMemo(() => {
    console.log('TimeSeries3DChartRenderer: Processing data', { 
      dataLength: data?.length || 0, 
      xColumn, 
      yColumn, 
      zColumn,
      resolved: { xKey, yKey, zKey },
      effective: { effXKey, effYKey, effZKey },
      firstDataItem: data?.[0]
    });

    if (!data || data.length === 0) {
      console.log('TimeSeries3DChartRenderer: No data provided');
      return { cubes: [], connections: [], uniqueTimes: [], uniqueCategories: [] };
    }

    // Ensure we have valid column names and data
    if (!xColumn || !yColumn) {
      console.warn('TimeSeries3DChartRenderer: Missing required columns', { xColumn, yColumn });
      return { cubes: [], connections: [], uniqueTimes: [], uniqueCategories: [] };
    }

    // CRITICAL FIX: For time series, we REQUIRE zColumn (time/date)
    if (!zColumn || !effZKey) {
      console.error('❌ TIME SERIES REQUIRES DATE COLUMN:', { zColumn, effZKey });
      return { cubes: [], connections: [], uniqueTimes: [], uniqueCategories: [] };
    }

    // Robust numeric parsing for yColumn values
    const parseYValue = (val: any): number => {
      if (typeof val === 'number') return Number.isFinite(val) ? val : NaN;
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.+\-eE]/g, '');
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : NaN;
      }
      return NaN;
    };

    // CRITICAL FIX: More strict validation for time series data
    const validData = data.filter(item => {
      const hasX = item && item[effXKey] !== undefined && item[effXKey] !== null;
      const hasY = item && item[effYKey] !== undefined && item[effYKey] !== null;
      const hasZ = item && item[effZKey] !== undefined && item[effZKey] !== null;
      const hasValidY = Number.isFinite(parseYValue(item?.[effYKey]));
      const hasValidTime = !isNaN(parseTime(item?.[effZKey]));
      
      return hasX && hasY && hasZ && hasValidY && hasValidTime;
    });

    console.log('TimeSeries3DChartRenderer: Valid data after filtering', { 
      originalCount: data.length, 
      validCount: validData.length,
      sampleValidItem: validData[0]
    });

    if (validData.length === 0) {
      console.warn('TimeSeries3DChartRenderer: No valid data after filtering');
      return { cubes: [], connections: [], uniqueTimes: [], uniqueCategories: [] };
    }

    // CRITICAL FIX: Sort ALL data by time first, then by category for proper time series
    const sortedData = validData.sort((a, b) => {
      // Primary sort: by time
      const aTime = parseTime(a[effZKey]);
      const bTime = parseTime(b[effZKey]);
      if (!isNaN(aTime) && !isNaN(bTime) && aTime !== bTime) {
        return aTime - bTime;
      }
      // Secondary sort: by category for stability
      return String(a[effXKey]).localeCompare(String(b[effXKey]));
    });

    // Get unique time points and categories for proper grid layout
    const uniqueTimeValues = [...new Set(sortedData.map(d => String(d[effZKey])))];
    const uniqueCategoryValues = [...new Set(sortedData.map(d => String(d[effXKey])))];
    
    console.log('TimeSeries Data Structure:', {
      uniqueTimes: uniqueTimeValues.length,
      uniqueCategories: uniqueCategoryValues.length,
      expectedTotal: uniqueTimeValues.length * uniqueCategoryValues.length,
      actualTotal: sortedData.length
    });

    const getY = (d: any): number => parseYValue(d?.[effYKey]);
    const yValues = sortedData.map(getY).filter(v => Number.isFinite(v));
    const maxValue = Math.max(...yValues);
    const minValue = Math.min(...yValues);
    const valueRange = maxValue - minValue || 1;
    
    const cubeSize = tileMode ? Math.min(0.6, 3.0 / Math.sqrt(sortedData.length)) : 0.4;
    const cubeList: any[] = [];
    
    // CRITICAL FIX: Create proper 3D grid - Time × Categories × Values
    uniqueTimeValues.forEach((timeValue, timeIndex) => {
      uniqueCategoryValues.forEach((categoryValue, categoryIndex) => {
        // Find the data point for this time-category combination
        const dataPoint = sortedData.find(d => 
          String(d[effZKey]) === timeValue && String(d[effXKey]) === categoryValue
        );
        
        if (dataPoint) {
          const value = getY(dataPoint);
          const normalizedValue = (value - minValue) / valueRange;
          const cubeHeight = Math.max(0.3, normalizedValue * 4);
          
          // Position calculation for proper 3D grid
          const timeSpacing = 1.5;
          const categorySpacing = 1.5;
          const totalTimeWidth = (uniqueTimeValues.length - 1) * timeSpacing;
          const totalCategoryDepth = (uniqueCategoryValues.length - 1) * categorySpacing;
          
          const x = -totalTimeWidth / 2 + timeIndex * timeSpacing;  // Time progression (X-axis)
          const y = cubeHeight / 2;                                 // Value height (Y-axis)
          const z = -totalCategoryDepth / 2 + categoryIndex * categorySpacing; // Category separation (Z-axis)
          
          const categoryColor = chartColors.length > 0 
            ? chartColors[categoryIndex % chartColors.length] 
            : `hsl(${(categoryIndex * 60) % 360}, 70%, 60%)`;
          
          const timeLabel = new Date(convertValueToDate(timeValue)).toLocaleDateString();
          const label = `${categoryValue} - ${timeLabel}`;
          
          cubeList.push({
            position: [x, y, z] as [number, number, number],
            scale: [cubeSize, cubeHeight, cubeSize] as [number, number, number],
            color: categoryColor,
            label: label,
            value: value,
            timeIndex: timeIndex,
            category: categoryValue,
            categoryIndex: categoryIndex,
            timeValue: timeValue,
            key: `timecube-${categoryIndex}-${timeIndex}`
          });
        }
      });
    });

    // CRITICAL FIX: Create connections between consecutive time points for each category
    const connectionsList: any[] = [];
    uniqueCategoryValues.forEach((categoryValue, categoryIndex) => {
      const categoryCubes = cubeList
        .filter(cube => cube.category === categoryValue)
        .sort((a, b) => a.timeIndex - b.timeIndex); // Ensure proper time order
      
      for (let i = 0; i < categoryCubes.length - 1; i++) {
        const start = categoryCubes[i].position;
        const end = categoryCubes[i + 1].position;
        connectionsList.push({
          start: [start[0], start[1], start[2]] as [number, number, number],
          end: [end[0], end[1], end[2]] as [number, number, number],
          category: categoryValue,
          key: `connection-${categoryIndex}-${i}`
        });
      }
    });

    return { 
      cubes: cubeList, 
      connections: connectionsList,
      uniqueTimes: uniqueTimeValues,
      uniqueCategories: uniqueCategoryValues
    };
  }, [data, xColumn, yColumn, zColumn, chartColors, tileMode, effXKey, effYKey, effZKey]);

  // Early return if no cubes to render
  if (cubes.length === 0) {
    return (
      <group>
        <StandardAxes3D 
          xLabel="Time"
          yLabel={effYKey || 'Value'}
          zLabel="Categories"
          axisLength={4}
          showGrid={true}
          showOrigin={true}
          showZAxis={true}
        />
        <Text
          position={[0, 3, 0]}
          fontSize={0.3}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          No valid time series data
        </Text>
        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          Check data format and column mappings
        </Text>
      </group>
    );
  }

  return (
    <>
      {/* Standard 3D Axes with proper labels */}
      <StandardAxes3D 
        xLabel="Time"
        yLabel={effYKey || 'Value'}
        zLabel="Categories" 
        axisLength={6}
        showGrid={true}
        showOrigin={true}
        showZAxis={true}
      />
      
      {/* Time axis labels (every few time points) */}
      {uniqueTimes.map((timeValue, index) => {
        if (index % Math.max(1, Math.floor(uniqueTimes.length / 5)) === 0) {
          const cube = cubes.find(c => c.timeIndex === index);
          if (cube) {
            return (
              <Text
                key={`time-label-${index}`}
                position={[cube.position[0], -0.8, -3]}
                fontSize={0.15}
                color="hsl(var(--muted-foreground))"
                anchorX="center"
                anchorY="middle"
                rotation={[-Math.PI/4, 0, 0]}
              >
                {new Date(convertValueToDate(timeValue)).toLocaleDateString()}
              </Text>
            );
          }
        }
        return null;
      })}
      
      {/* Category axis labels */}
      {uniqueCategories.map((categoryValue, index) => {
        const cube = cubes.find(c => c.categoryIndex === index);
        if (cube) {
          return (
            <Text
              key={`category-label-${index}`}
              position={[-3, -0.5, cube.position[2]]}
              fontSize={0.15}
              color="hsl(var(--muted-foreground))"
              anchorX="center"
              anchorY="middle"
              rotation={[0, Math.PI/4, 0]}
            >
              {categoryValue}
            </Text>
          );
        }
        return null;
      })}
      
      {/* Time series connections */}
      {connections.map((connection, index) => (
        <Line
          key={connection.key}
          points={[connection.start, connection.end]}
          color="hsl(var(--primary))"
          lineWidth={3}
          transparent
          opacity={0.7}
        />
      ))}
      
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
      
      {/* Data summary info for debugging */}
      <Text
        position={[-4, 4, -4]}
        fontSize={0.15}
        color="hsl(var(--muted-foreground))"
        anchorX="left"
        anchorY="top"
      >
        {`Data: ${cubes.length} points (${uniqueTimes.length} times × ${uniqueCategories.length} series)`}
      </Text>
    </>
  );
};
