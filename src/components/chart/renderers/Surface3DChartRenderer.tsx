import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { StandardAxes3D } from '../utils/StandardAxes3D';

interface Surface3DChartRendererProps {
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

export const Surface3DChartRenderer: React.FC<Surface3DChartRendererProps> = ({
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
  console.log('🏔️ Surface3DChartRenderer - Starting render:', {
    dataLength: data?.length,
    xColumn,
    yColumn,
    zColumn,
    tileMode,
    sampleData: data?.slice(0, 2)
  });

  const surfaceData = useMemo(() => {
    if (!data || data.length === 0) {
      console.warn('Surface3DChartRenderer: No data provided');
      return null;
    }

    if (!xColumn || !yColumn || !zColumn) {
      console.warn('🏔️ Surface3DChartRenderer: Missing required columns', { 
        xColumn, yColumn, zColumn
      });
      return null;
    }

    // Check if columns exist in data
    const sampleRow = data[0] || {};
    const availableColumns = Object.keys(sampleRow);
    const missingColumns = [xColumn, yColumn, zColumn].filter(col => !availableColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.error('🏔️ Surface3DChartRenderer: Columns not found in data', {
        missingColumns, availableColumns
      });
      return null;
    }

    // Validate axis requirements:
    // X & Y: Continuous or ordinal (can be converted to numbers)
    // Z: Must be numeric (the dependent variable/KPI)
    const validData = data.filter(item => {
      if (!item) return false;
      
      const xVal = item[xColumn];
      const yVal = item[yColumn];
      const zVal = item[zColumn];
      
      // All values must exist
      if (xVal === undefined || yVal === undefined || zVal === undefined) return false;
      
      // X and Y can be ordinal/categorical - convert to numbers if possible
      const xNum = Number(xVal);
      const yNum = Number(yVal);
      const zNum = Number(zVal);
      
      // Z must be strictly numeric (the KPI we're measuring)
      if (isNaN(zNum)) return false;
      
      // X and Y should be convertible to numbers (for grid positioning)
      return !isNaN(xNum) && !isNaN(yNum);
    });

    if (validData.length === 0) {
      console.warn('🏔️ Surface3DChartRenderer: No valid data - Z-axis must be numeric, X/Y must be ordinal or continuous');
      return null;
    }

    // Sort data for better surface generation (X primary, Y secondary)
    validData.sort((a, b) => {
      const xDiff = Number(a[xColumn]) - Number(b[xColumn]);
      if (xDiff !== 0) return xDiff;
      return Number(a[yColumn]) - Number(b[yColumn]);
    });

    console.log('🏔️ Surface3DChartRenderer: Valid surface data', {
      validDataLength: validData.length,
      axisTypes: {
        xColumn: `${xColumn} (independent var 1)`,
        yColumn: `${yColumn} (independent var 2)`, 
        zColumn: `${zColumn} (dependent KPI)`
      }
    });

    return validData;
  }, [data, xColumn, yColumn, zColumn]);

  const { geometry, material } = useMemo(() => {
    if (!surfaceData) {
      return { geometry: new THREE.PlaneGeometry(1, 1), material: new THREE.MeshPhongMaterial({ color: '#cccccc' }) };
    }

    // Extract and organize data for proper surface grid
    const xValues = [...new Set(surfaceData.map(d => Number(d[xColumn])))].sort((a, b) => a - b);
    const yValues = [...new Set(surfaceData.map(d => Number(d[yColumn])))].sort((a, b) => a - b);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    // Get Z-values (the KPI we're measuring as height)
    const allZValues = surfaceData.map(d => Number(d[zColumn]));
    const zMin = Math.min(...allZValues);
    const zMax = Math.max(...allZValues);
    const zRange = zMax - zMin || 1;
    
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    const scale = 4;
    
    // Create grid dimensions based on unique X/Y values
    const gridWidth = xValues.length;
    const gridHeight = yValues.length;
    
    console.log('🏔️ Surface grid:', { gridWidth, gridHeight, totalPoints: gridWidth * gridHeight });
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];
    
    // Build proper grid based on X/Y independent variables
    for (let i = 0; i < gridHeight; i++) {
      for (let j = 0; j < gridWidth; j++) {
        const xVal = xValues[j];
        const yVal = yValues[i];
        
        // Find Z value (dependent variable) for this X,Y combination
        const dataPoint = surfaceData.find(d => 
          Math.abs(Number(d[xColumn]) - xVal) < 0.001 && 
          Math.abs(Number(d[yColumn]) - yVal) < 0.001
        );
        
        const zVal = dataPoint ? Number(dataPoint[zColumn]) : (zMin + zMax) / 2; // Use average if no data
        
        // Map to 3D coordinates
        // X-axis: Independent variable 1 (horizontal)
        const x = ((xVal - xMin) / xRange) * scale - scale / 2;
        // Z-axis: Independent variable 2 (depth) 
        const z = ((yVal - yMin) / yRange) * scale - scale / 2;
        // Y-axis: Dependent variable (height - the KPI)
        const y = ((zVal - zMin) / zRange) * scale;
        
        vertices.push(x, y, z);
        
        // Color based on Z-value (the KPI height)
        const normalizedZ = (zVal - zMin) / zRange;
        const colorIndex = Math.floor(normalizedZ * (chartColors.length - 1));
        const color = new THREE.Color(chartColors[Math.max(0, Math.min(colorIndex, chartColors.length - 1))]);
        colors.push(color.r, color.g, color.b);
      }
    }
    
    // Create triangular faces for the surface
    for (let i = 0; i < gridHeight - 1; i++) {
      for (let j = 0; j < gridWidth - 1; j++) {
        const a = i * gridWidth + j;
        const b = i * gridWidth + j + 1;
        const c = (i + 1) * gridWidth + j;
        const d = (i + 1) * gridWidth + j + 1;
        
        // Two triangles per quad (proper winding order)
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    
    return { geometry, material };
  }, [surfaceData, xColumn, yColumn, zColumn, chartColors]);

  console.log('🏔️ Surface3DChartRenderer: About to render surface mesh');

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
        showZAxis={zColumn && zColumn !== yColumn}
      />
      
      {/* Surface mesh */}
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      
      {/* Wireframe overlay for better definition */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#666" wireframe transparent opacity={0.2} />
      </mesh>
    </>
  );
};