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
}

export const Surface3DChartRenderer: React.FC<Surface3DChartRendererProps> = ({
  data,
  xColumn,
  yColumn,
  zColumn,
  chartColors,
  showDataLabels = false
}) => {
  const { geometry, material } = useMemo(() => {
    if (!data || data.length === 0) {
      return { geometry: new THREE.PlaneGeometry(1, 1), material: new THREE.MeshPhongMaterial({ color: '#cccccc' }) };
    }

    // Create a grid of vertices for the surface
    const gridSize = Math.ceil(Math.sqrt(data.length));
    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];
    
    // Get value ranges for normalization
    const xValues = data.map(d => Number(d[xColumn]) || 0);
    const yValues = data.map(d => Number(d[yColumn]) || 0);
    const zValues = data.map(d => Number(d[zColumn]) || 0);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);
    
    const scale = 4;
    
    // Create vertices
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const dataIndex = i * gridSize + j;
        
        if (dataIndex < data.length) {
          const item = data[dataIndex];
          // Center surface around origin
          const x = ((Number(item[xColumn]) || 0) - xMin) / (xMax - xMin || 1) * scale - scale / 2;
          const y = ((Number(item[yColumn]) || 0) - yMin) / (yMax - yMin || 1) * 2; // Height from origin
          const z = ((Number(item[zColumn]) || 0) - zMin) / (zMax - zMin || 1) * scale - scale / 2;
          
          vertices.push(x, y, z);
          
          // Color based on height
          const colorIndex = Math.floor((y / 2) * (chartColors.length - 1));
          const color = new THREE.Color(chartColors[Math.max(0, Math.min(colorIndex, chartColors.length - 1))]);
          colors.push(color.r, color.g, color.b);
        } else {
          // Fill empty spots with interpolated values
          const x = (j / (gridSize - 1)) * scale - scale / 2;
          const z = (i / (gridSize - 1)) * scale - scale / 2;
          vertices.push(x, 0, z);
          colors.push(0.5, 0.5, 0.5);
        }
      }
    }
    
    // Create triangular faces
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const a = i * gridSize + j;
        const b = i * gridSize + j + 1;
        const c = (i + 1) * gridSize + j;
        const d = (i + 1) * gridSize + j + 1;
        
        // Two triangles per quad
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
      opacity: 0.8
    });
    
    return { geometry, material };
  }, [data, xColumn, yColumn, zColumn, chartColors]);

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