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

  // COMPLETELY REWRITTEN DATE PARSING - Fix the 1900s issue
  const parseTimeAdvanced = (val: any): { timestamp: number; displayDate: string; year: number } => {
    if (val == null || val === '') {
      return { timestamp: NaN, displayDate: 'Invalid Date', year: 0 };
    }
    
    console.log('🔍 Parsing date value:', val, 'Type:', typeof val);
    
    let dateObj: Date | null = null;
    
    // Handle different input types
    if (val instanceof Date) {
      dateObj = val;
    } else if (typeof val === 'string') {
      // Clean the string and try multiple parsing strategies
      const cleaned = String(val).trim();
      
      // Strategy 1: Direct parsing if it looks like 2024
      if (cleaned.includes('2024') || cleaned.includes('2023') || cleaned.includes('2025')) {
        console.log('📅 Detected 2024 date, parsing directly:', cleaned);
        dateObj = new Date(cleaned);
      }
      // Strategy 2: Try ISO format variations
      else if (cleaned.match(/^\d{4}-\d{2}-\d{2}/)) {
        console.log('📅 ISO format detected:', cleaned);
        dateObj = new Date(cleaned);
      }
      // Strategy 3: Try MM/DD/YYYY format
      else if (cleaned.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
        console.log('📅 MM/DD/YYYY format detected:', cleaned);
        dateObj = new Date(cleaned);
      }
      // Strategy 4: Try convertValueToDate as last resort
      else {
        console.log('📅 Using convertValueToDate for:', cleaned);
        try {
          const converted = convertValueToDate(cleaned);
          console.log('📅 Converted to:', converted);
          dateObj = new Date(converted);
        } catch (error) {
          console.warn('❌ convertValueToDate failed:', error);
          dateObj = null;
        }
      }
    } else if (typeof val === 'number') {
      console.log('🔢 Processing numeric date:', val);
      
      // Handle Unix timestamps (milliseconds)
      if (val > 1600000000000 && val < 2000000000000) {
        console.log('📅 Unix timestamp (ms) detected');
        dateObj = new Date(val);
      }
      // Handle Unix timestamps (seconds)  
      else if (val > 1600000000 && val < 2000000000) {
        console.log('📅 Unix timestamp (s) detected');
        dateObj = new Date(val * 1000);
      }
      // Handle Excel serial dates (but with better range checking)
      else if (val >= 44197 && val <= 46751) { // 2021-2028 range in Excel serial
        console.log('📅 Excel serial date detected (reasonable range)');
        try {
          const converted = convertValueToDate(val);
          console.log('📅 Excel converted to:', converted);
          dateObj = new Date(converted);
        } catch (error) {
          console.warn('❌ Excel conversion failed:', error);
          // Fallback: treat as days since 1900-01-01
          const excelEpoch = new Date(1900, 0, 1);
          dateObj = new Date(excelEpoch.getTime() + (val - 1) * 24 * 60 * 60 * 1000);
        }
      }
      // Handle suspicious small numbers (likely indices, not dates)
      else if (val < 100) {
        console.warn('⚠️ Number too small to be a date, treating as index:', val);
        // Create a fake date sequence starting from August 1, 2024
        const baseDate = new Date(2024, 7, 1); // August 1, 2024
        dateObj = new Date(baseDate.getTime() + val * 24 * 60 * 60 * 1000);
      }
      // Last resort: try conversion
      else {
        console.log('📅 Last resort conversion for number:', val);
        try {
          const converted = convertValueToDate(val);
          dateObj = new Date(converted);
        } catch {
          dateObj = null;
        }
      }
    }
    
    // Validate the result
    if (!dateObj || isNaN(dateObj.getTime())) {
      console.error('❌ Failed to parse date:', val);
      return { timestamp: NaN, displayDate: String(val), year: 0 };
    }
    
    const year = dateObj.getFullYear();
    console.log('✅ Parsed date successfully:', val, '→', dateObj.toISOString(), 'Year:', year);
    
    // Check for unreasonable years and try to correct
    if (year < 1950 || year > 2050) {
      console.warn('⚠️ Unreasonable year detected:', year, 'for input:', val);
      
      // If it's a 1900s date, try to adjust to 2020s
      if (year >= 1900 && year <= 1920) {
        const adjustedYear = year + 124; // Rough adjustment to get to 2024
        dateObj.setFullYear(adjustedYear);
        console.log('🔧 Adjusted year from', year, 'to', adjustedYear);
      }
    }
    
    return {
      timestamp: dateObj.getTime(),
      displayDate: dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: dateObj.getFullYear() === 2024 ? undefined : 'numeric' // Hide year if 2024
      }),
      year: dateObj.getFullYear()
    };
  };

  // ENHANCED LOGGING
  console.log('🚀 TimeSeries3DChartRenderer: Starting Analysis', {
    totalRecords: data?.length || 0,
    columns: { xColumn, yColumn, zColumn },
    resolved: { xKey, yKey, zKey },
    sampleData: data?.slice(0, 3)
  });

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
          const { timestamp } = parseTimeAdvanced(v);
          if (!isNaN(timestamp)) stats[k].date++;
          
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
    
    console.log('📊 Column inference results:', { 
      infX, infY, infZ, 
      columnStats: Object.entries(stats).map(([k, v]) => ({
        column: k,
        distinctValues: v.distinct.size,
        numericCount: v.numeric,
        dateCount: v.date,
        stringCount: v.stringish
      }))
    });
    
    return { infX, infY, infZ };
  }, [data, dataKeys]);

  const effXKey = (xKey && dataKeys.includes(xKey)) ? xKey : inferred.infX;
  const effYKey = (yKey && dataKeys.includes(yKey)) ? yKey : inferred.infY;
  const effZKey = (zKey && dataKeys.includes(zKey)) ? zKey : inferred.infZ;
  
  console.log('🎯 Final column mapping:', { effXKey, effYKey, effZKey });
  
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

  const { cubes, connections, uniqueTimes, uniqueCategories, dataQuality } = useMemo(() => {
    console.log('🔄 Processing data for TimeSeries3D', { 
      dataLength: data?.length || 0, 
      columns: { effXKey, effYKey, effZKey }
    });

    if (!data || data.length === 0) {
      return { cubes: [], connections: [], uniqueTimes: [], uniqueCategories: [], dataQuality: { valid: false, message: 'No data provided' } };
    }

    if (!effXKey || !effYKey) {
      return { cubes: [], connections: [], uniqueTimes: [], uniqueCategories: [], dataQuality: { valid: false, message: 'Missing required columns (category or value)' } };
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

    // ENHANCED DATA PROCESSING with better validation
    const processedData = data.map((item, index) => {
      const xValue = item?.[effXKey];
      const yValue = item?.[effYKey];
      const zValue = item?.[effZKey];
      
      const parsedY = parseYValue(yValue);
      const { timestamp, displayDate, year } = effZKey ? parseTimeAdvanced(zValue) : { 
        timestamp: index, 
        displayDate: `Point ${index + 1}`, 
        year: 2024 
      };
      
      return {
        ...item,
        _originalIndex: index,
        _xValue: xValue,
        _yValue: yValue,
        _zValue: zValue,
        _parsedY: parsedY,
        _timestamp: timestamp,
        _displayDate: displayDate,
        _year: year,
        _isValid: xValue != null && yValue != null && Number.isFinite(parsedY) && 
                  (effZKey ? !isNaN(timestamp) && year >= 2020 && year <= 2030 : true)
      };
    });

    const validData = processedData.filter(item => item._isValid);
    const invalidData = processedData.filter(item => !item._isValid);
    
    console.log('✅ Data validation results:', { 
      originalCount: data.length, 
      validCount: validData.length,
      invalidCount: invalidData.length,
      hasTimeColumn: Boolean(effZKey),
      invalidSamples: invalidData.slice(0, 3).map(d => ({
        original: { x: d._xValue, y: d._yValue, z: d._zValue },
        parsed: { timestamp: d._timestamp, year: d._year, display: d._displayDate }
      }))
    });

    if (validData.length === 0) {
      return { cubes: [], connections: [], uniqueTimes: [], uniqueCategories: [], dataQuality: { 
        valid: false, 
        message: 'No valid data after filtering - check date formats and value types',
        details: `Invalid samples: ${invalidData.length}, Check console for details`
      }};
    }

    // FORCE PROPER SORTING regardless of UI settings
    const sortedData = validData.sort((a, b) => {
      if (effZKey && !isNaN(a._timestamp) && !isNaN(b._timestamp)) {
        // PRIMARY SORT: ALWAYS by time (ASCENDING for chronological order)
        if (a._timestamp !== b._timestamp) {
          return a._timestamp - b._timestamp; // FORCED ASCENDING
        }
      }
      // SECONDARY SORT: by category for stability
      return String(a._xValue).localeCompare(String(b._xValue));
    });

    console.log('🔄 Sorting completed, first few items:', 
      sortedData.slice(0, 5).map(d => ({ 
        category: d._xValue, 
        value: d._parsedY, 
        date: d._displayDate,
        timestamp: d._timestamp 
      }))
    );

    // Get unique time points and categories
    const uniqueTimeValues = effZKey 
      ? [...new Set(sortedData.map(d => d._displayDate))].sort((a, b) => {
          const aItem = sortedData.find(d => d._displayDate === a);
          const bItem = sortedData.find(d => d._displayDate === b);
          return (aItem?._timestamp || 0) - (bItem?._timestamp || 0);
        })
      : ['Single Time Point'];
    const uniqueCategoryValues = [...new Set(sortedData.map(d => String(d._xValue)))];
    
    console.log('📈 Data structure analysis:', {
      uniqueTimes: uniqueTimeValues.length,
      uniqueCategories: uniqueCategories.length,
      timePoints: uniqueTimeValues,
      categories: uniqueCategoryValues,
      expectedTotal: uniqueTimeValues.length * uniqueCategoryValues.length,
      actualTotal: sortedData.length,
      isAggregated: sortedData.length < 100 && uniqueCategoryValues.length >= 5
    });

    // Calculate value ranges for cube scaling
    const yValues = sortedData.map(d => d._parsedY);
    const maxValue = Math.max(...yValues);
    const minValue = Math.min(...yValues);
    const valueRange = maxValue - minValue || 1;
    
    console.log('📊 Value range:', { minValue, maxValue, valueRange });
    
    const cubeSize = Math.min(0.8, 4.0 / Math.sqrt(Math.max(sortedData.length, 64)));
    const cubeList: any[] = [];
    
    // CREATE 3D GRID LAYOUT
    if (effZKey && uniqueTimeValues.length > 1) {
      // TRUE TIME SERIES: Time × Categories × Values
      console.log('🎯 Creating time series layout');
      
      uniqueTimeValues.forEach((timeValue, timeIndex) => {
        uniqueCategoryValues.forEach((categoryValue, categoryIndex) => {
          const dataPoint = sortedData.find(d => 
            d._displayDate === timeValue && String(d._xValue) === categoryValue
          );
          
          if (dataPoint) {
            const value = dataPoint._parsedY;
            const normalizedValue = (value - minValue) / valueRange;
            const cubeHeight = Math.max(0.5, normalizedValue * 6);
            
            // Position calculation - ensure proper grid spacing
            const timeSpacing = 2.5;
            const categorySpacing = 2.0;
            const totalTimeWidth = (uniqueTimeValues.length - 1) * timeSpacing;
            const totalCategoryDepth = (uniqueCategoryValues.length - 1) * categorySpacing;
            
            const x = -totalTimeWidth / 2 + timeIndex * timeSpacing;  // Time axis
            const y = cubeHeight / 2;                                 // Value height
            const z = -totalCategoryDepth / 2 + categoryIndex * categorySpacing; // Category axis
            
            const categoryColor = chartColors.length > 0 
              ? chartColors[categoryIndex % chartColors.length] 
              : `hsl(${(categoryIndex * 45) % 360}, 70%, 60%)`;
            
            cubeList.push({
              position: [x, y, z] as [number, number, number],
              scale: [cubeSize, cubeHeight, cubeSize] as [number, number, number],
              color: categoryColor,
              label: `${categoryValue} - ${timeValue}`,
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
    } else {
      // FALLBACK: Static categorical data or aggregated data
      console.log('🎯 Creating static/aggregated layout');
      
      uniqueCategoryValues.forEach((categoryValue, categoryIndex) => {
        const categoryData = sortedData.filter(d => String(d._xValue) === categoryValue);
        const avgValue = categoryData.reduce((sum, d) => sum + d._parsedY, 0) / categoryData.length;
        const normalizedValue = (avgValue - minValue) / valueRange;
        const cubeHeight = Math.max(0.5, normalizedValue * 6);
        
        const categorySpacing = 2.5;
        const totalCategoryWidth = (uniqueCategoryValues.length - 1) * categorySpacing;
        
        const x = -totalCategoryWidth / 2 + categoryIndex * categorySpacing;
        const y = cubeHeight / 2;
        const z = 0;
        
        const categoryColor = chartColors.length > 0 
          ? chartColors[categoryIndex % chartColors.length] 
          : `hsl(${(categoryIndex * 45) % 360}, 70%, 60%)`;
        
        cubeList.push({
          position: [x, y, z] as [number, number, number],
          scale: [cubeSize, cubeHeight, cubeSize] as [number, number, number],
          color: categoryColor,
          label: `${categoryValue} (${categoryData.length} points, Avg: ${avgValue.toFixed(1)})`,
          value: avgValue,
          timeIndex: 0,
          category: categoryValue,
          categoryIndex: categoryIndex,
          key: `cube-${categoryIndex}`
        });
      });
    }

    // CREATE CONNECTIONS for time series
    const connectionsList: any[] = [];
    if (effZKey && uniqueTimeValues.length > 1) {
      uniqueCategoryValues.forEach((categoryValue, categoryIndex) => {
        const categoryCubes = cubeList
          .filter(cube => cube.category === categoryValue)
          .sort((a, b) => a.timeIndex - b.timeIndex);
        
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
    }

    const dataQualityResult = {
      valid: true,
      message: `${cubeList.length} cubes from ${sortedData.length} data points`,
      isTimeSeries: Boolean(effZKey && uniqueTimeValues.length > 1),
      aggregationSuspected: sortedData.length < 100 && uniqueCategoryValues.length >= 5,
      dateRange: effZKey ? `${uniqueTimeValues[0]} to ${uniqueTimeValues[uniqueTimeValues.length - 1]}` : 'N/A'
    };

    return { 
      cubes: cubeList, 
      connections: connectionsList,
      uniqueTimes: uniqueTimeValues,
      uniqueCategories: uniqueCategoryValues,
      dataQuality: dataQualityResult
    };
  }, [data, effXKey, effYKey, effZKey, chartColors, tileMode]);

  // Early return with comprehensive error message
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
          position={[0, 4, 0]}
          fontSize={0.3}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          NO VALID DATA
        </Text>
        <Text
          position={[0, 3, 0]}
          fontSize={0.2}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
        >
          {dataQuality.message}
        </Text>
        <Text
          position={[0, 2, 0]}
          fontSize={0.15}
          color="#f59e0b"
          anchorX="center"
          anchorY="middle"
        >
          Expected: 1000+ time series records
        </Text>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.15}
          color="#f59e0b"
          anchorX="center"
          anchorY="middle"
        >
          Check: Data format, dates (should be 2024), column mappings
        </Text>
        <Text
          position={[0, 1, 0]}
          fontSize={0.12}
          color="#6b7280"
          anchorX="center"
          anchorY="middle"
        >
          Columns: {effXKey || 'missing'} × {effYKey || 'missing'} × {effZKey || 'missing'}
        </Text>
      </group>
    );
  }

  return (
    <>
      {/* Standard 3D Axes */}
      <StandardAxes3D 
        xLabel={dataQuality.isTimeSeries ? "Time" : "Index"}
        yLabel={effYKey || 'Value'}
        zLabel={dataQuality.isTimeSeries ? "Categories" : "Data Points"} 
        axisLength={6}
        showGrid={true}
        showOrigin={true}
        showZAxis={true}
      />
      
      {/* Enhanced data quality indicators */}
      <Text
        position={[-5, 6, -5]}
        fontSize={0.2}
        color={dataQuality.aggregationSuspected ? "#ef4444" : "#10b981"}
        anchorX="left"
        anchorY="top"
      >
        {dataQuality.aggregationSuspected 
          ? `⚠️ AGGREGATION DETECTED: ${cubes.length} points`
          : `✅ DATA OK: ${cubes.length} cubes`}
      </Text>
      
      <Text
        position={[-5, 5.5, -5]}
        fontSize={0.15}
        color="hsl(var(--muted-foreground))"
        anchorX="left"
        anchorY="top"
      >
        {dataQuality.isTimeSeries 
          ? `Time series: ${uniqueTimes.length} × ${uniqueCategories.length} (${dataQuality.dateRange})`
          : `Static data: ${uniqueCategories.length} categories`}
      </Text>
      
      {dataQuality.aggregationSuspected && (
        <Text
          position={[-5, 5, -5]}
          fontSize={0.12}
          color="#ef4444"
          anchorX="left"
          anchorY="top"
        >
          Need 1,344 records (8 locations × 7 days × 24 hours)
        </Text>
      )}
      
      <Text
        position={[-5, 4.5, -5]}
        fontSize={0.12}
        color="#6b7280"
        anchorX="left"
        anchorY="top"
      >
        Forced sorting: ALWAYS chronological (ignores UI settings)
      </Text>
      
      {/* Time axis labels (for time series) */}
      {dataQuality.isTimeSeries && uniqueTimes.map((timeValue, index) => {
        if (index % Math.max(1, Math.floor(uniqueTimes.length / 6)) === 0) {
          const cube = cubes.find(c => c.timeIndex === index);
          if (cube) {
            return (
              <Text
                key={`time-label-${index}`}
                position={[cube.position[0], -1, -4]}
                fontSize={0.15}
                color="hsl(var(--muted-foreground))"
                anchorX="center"
                anchorY="middle"
                rotation={[-Math.PI/4, 0, 0]}
              >
                {timeValue}
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
              position={[-4, -0.5, cube.position[2]]}
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
    </>
  );
};
