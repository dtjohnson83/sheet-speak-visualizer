import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { formatNumber } from '@/lib/numberUtils';

interface Treemap3DChartRendererProps {
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

interface TreemapBoxProps {
  position: [number, number, number];
  size: [number, number, number];
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

const TreemapBox3D: React.FC<TreemapBoxProps> = ({ 
  position, 
  size, 
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
  const [currentScale, setCurrentScale] = useState(1);

  // Animate scale based on temporal animation
  useFrame((state) => {
    if (isTemporalAnimated && meshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * animationSpeed / 1000) * 0.1;
      setCurrentScale(pulseScale);
      meshRef.current.scale.setScalar(pulseScale);
    }
  });

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
    onHover?.(true, { label, value });
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(false);
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick?.({ label, value });
  };

  const material = useMemo(() => {
    const baseColor = new THREE.Color(color);
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      opacity: hovered ? 0.9 : 0.8,
      transparent: true,
      roughness: 0.4,
      metalness: 0.1
    });
  }, [color, hovered]);

  const textColor = useMemo(() => {
    const colorObj = new THREE.Color(color);
    const luminance = 0.299 * colorObj.r + 0.587 * colorObj.g + 0.114 * colorObj.b;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, [color]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={currentScale}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        material={material}
      >
        <boxGeometry args={size} />
      </mesh>
      
      {/* Edge wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color={hovered ? '#ffffff' : '#cccccc'} opacity={0.6} transparent />
      </lineSegments>

      {showLabel && label && size[0] > 1 && size[1] > 1 && (
        <>
          <Text
            position={[0, size[1] * 0.2, size[2] / 2 + 0.01]}
            fontSize={Math.min(size[0] * 0.3, size[1] * 0.3, 0.8)}
            color={textColor}
            anchorX="center"
            anchorY="middle"
            maxWidth={size[0] * 0.9}
            font="/fonts/inter-medium.woff"
          >
            {label}
          </Text>
          {value !== undefined && (
            <Text
              position={[0, -size[1] * 0.2, size[2] / 2 + 0.01]}
              fontSize={Math.min(size[0] * 0.2, size[1] * 0.2, 0.6)}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              maxWidth={size[0] * 0.9}
              font="/fonts/inter-regular.woff"
            >
              {formatNumber(value)}
            </Text>
          )}
        </>
      )}

      {hovered && (
        <Html position={[0, size[1] / 2 + 1, 0]} center>
          <div className="bg-popover text-popover-foreground border rounded-md p-2 shadow-lg pointer-events-none">
            <div className="font-medium">{label}</div>
            <div className="text-sm text-muted-foreground">
              Value: {formatNumber(value || 0)}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Treemap layout algorithm for 3D positioning
const calculateTreemapLayout = (data: any[], width: number, height: number) => {
  if (!data || data.length === 0) return [];
  
  // Sort by value descending
  const sortedData = [...data].sort((a, b) => (b.value || b.size || 0) - (a.value || a.size || 0));
  
  // Calculate total value
  const totalValue = sortedData.reduce((sum, item) => sum + (item.value || item.size || 0), 0);
  
  const layout: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    item: any;
  }> = [];
  
  let currentX = 0;
  let currentY = 0;
  let rowHeight = 0;
  
  sortedData.forEach((item, index) => {
    const value = item.value || item.size || 0;
    const ratio = value / totalValue;
    const area = width * height * ratio;
    
    // Calculate dimensions (simple row-based layout)
    const aspectRatio = 1.5;
    let rectWidth = Math.sqrt(area * aspectRatio);
    let rectHeight = area / rectWidth;
    
    // Ensure minimum size
    rectWidth = Math.max(rectWidth, 0.5);
    rectHeight = Math.max(rectHeight, 0.5);
    
    // Check if we need to start a new row
    if (currentX + rectWidth > width && layout.length > 0) {
      currentX = 0;
      currentY += rowHeight;
      rowHeight = 0;
    }
    
    // Adjust if still doesn't fit
    if (currentX + rectWidth > width) {
      rectWidth = width - currentX;
    }
    if (currentY + rectHeight > height) {
      rectHeight = height - currentY;
    }
    
    const depth = Math.min(Math.max(ratio * 3, 0.2), 2); // Depth based on value
    
    layout.push({
      x: currentX + rectWidth / 2,
      y: currentY + rectHeight / 2,
      width: rectWidth,
      height: rectHeight,
      depth,
      item
    });
    
    currentX += rectWidth;
    rowHeight = Math.max(rowHeight, rectHeight);
  });
  
  return layout;
};

export const Treemap3DChartRenderer: React.FC<Treemap3DChartRendererProps> = ({
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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<any>(null);

  console.log('🗺️ Treemap3DChartRenderer - Starting render:', {
    dataLength: data?.length,
    xColumn,
    yColumn,
    zColumn,
    showDataLabels
  });

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      console.warn('Treemap3DChartRenderer: No data provided');
      return [];
    }

    console.log('🗺️ Treemap3DChartRenderer - Raw input data:', {
      dataLength: data?.length,
      sampleData: data?.slice(0, 2),
      allKeys: data?.[0] ? Object.keys(data[0]) : []
    });

    // Check if data is already processed (has name, size, value structure)
    const sampleRow = data[0];
    const hasProcessedStructure = sampleRow && 
      ('name' in sampleRow || 'size' in sampleRow || 'value' in sampleRow);

    if (hasProcessedStructure) {
      // Data is already processed by treemapProcessor, use it directly
      const result = data.filter(item => 
        item && 
        (item.value > 0 || item.size > 0) &&
        typeof (item.value || item.size) === 'number'
      ).map(item => ({
        name: item.name || 'Unknown',
        value: item.value || item.size || 0,
        size: item.size || item.value || 0,
        height: zColumn && item[zColumn] ? Number(item[zColumn]) : (item.value || item.size || 1)
      }));

      console.log('🗺️ Treemap3DChartRenderer: Using pre-processed data', {
        originalLength: data.length,
        processedLength: result.length,
        categories: result.map(r => r.name),
        hasZColumn: !!zColumn
      });

      return result;
    }

    // Fallback: process raw data if needed
    if (!xColumn || !yColumn) {
      console.warn('Treemap3DChartRenderer: Missing required columns for raw data processing', { 
        xColumn, 
        yColumn 
      });
      return [];
    }

    const availableColumns = Object.keys(sampleRow || {});
    
    if (!availableColumns.includes(xColumn) || !availableColumns.includes(yColumn)) {
      console.error('Treemap3DChartRenderer: Columns not found in raw data', {
        xColumn,
        yColumn,
        availableColumns
      });
      return [];
    }

    // Process raw treemap data
    const grouped = data.reduce((acc, row) => {
      const category = row[xColumn]?.toString() || 'Unknown';
      const value = Number(row[yColumn]);
      const height = zColumn ? Number(row[zColumn]) : value;
      
      if (!isNaN(value) && value > 0) {
        if (!acc[category]) {
          acc[category] = { value: 0, height: 0, count: 0 };
        }
        acc[category].value += value;
        acc[category].height += height || value;
        acc[category].count += 1;
      }
      return acc;
    }, {} as Record<string, {value: number, height: number, count: number}>);

    const result = Object.entries(grouped)
      .map(([name, groupData]) => {
        const typedData = groupData as {value: number, height: number, count: number};
        return {
          name,
          value: typedData.value,
          size: typedData.value,
          height: typedData.height / typedData.count // Average height
        };
      })
      .filter(item => typeof item.value === 'number' && item.value > 0);

    console.log('🗺️ Treemap3DChartRenderer: Processed raw data', {
      originalLength: data.length,
      processedLength: result.length,
      categories: result.map(r => r.name)
    });

    return result;
  }, [data, xColumn, yColumn]);

  const layout = useMemo(() => {
    return calculateTreemapLayout(processedData, 10, 8); // 10x8 grid
  }, [processedData]);

  const handleItemHover = (hovered: boolean, itemData?: any) => {
    setHoveredItem(hovered ? itemData : null);
  };

  const handleItemClick = (itemData?: any) => {
    setSelectedItem(itemData?.label === selectedItem ? null : itemData?.label);
  };

  if (!processedData || processedData.length === 0) {
    return (
      <group>
        <Text position={[0, 0, 0]} fontSize={0.8} color="#666666" anchorX="center" anchorY="middle">
          No valid data to display
        </Text>
      </group>
    );
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Treemap boxes */}
      {layout.map((rect, index) => (
        <TreemapBox3D
          key={`${rect.item.name}-${index}`}
          position={[
            rect.x - 5, // Center around origin
            rect.y - 4,
            rect.depth / 2
          ]}
          size={[rect.width, rect.height, rect.depth]}
          color={chartColors[index % chartColors.length]}
          label={rect.item.name}
          value={rect.item.value}
          showLabel={showDataLabels}
          onHover={handleItemHover}
          onClick={handleItemClick}
          isSelected={selectedItem === rect.item.name}
          isTemporalAnimated={isTemporalAnimated}
          animationSpeed={animationSpeed}
        />
      ))}

      {/* Ground plane for reference */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshBasicMaterial color="#f0f0f0" opacity={0.1} transparent />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.6}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        3D Treemap: {xColumn} by {yColumn}
      </Text>
    </group>
  );
};