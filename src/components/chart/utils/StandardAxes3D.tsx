import React from 'react';
import { Text } from '@react-three/drei';

interface StandardAxes3DProps {
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
  axisLength?: number;
  showGrid?: boolean;
  showOrigin?: boolean;
  showZAxis?: boolean;
}

export const StandardAxes3D: React.FC<StandardAxes3DProps> = ({
  xLabel = 'X',
  yLabel = 'Y',
  zLabel = 'Z',
  axisLength = 4,
  showGrid = true,
  showOrigin = true,
  showZAxis = true
}) => {
  // Use consistent colors for 3D axes
  const axisColor = "#666";
  const gridColor = "#ddd";

  return (
    <group>
      {/* Origin marker */}
      {showOrigin && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={axisColor} />
        </mesh>
      )}

      {/* X Axis - extends from -length/2 to +length/2 */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, axisLength]} />
        <meshBasicMaterial color="#e74c3c" />
      </mesh>
      
      {/* X Axis arrowhead */}
      <mesh position={[axisLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshBasicMaterial color="#e74c3c" />
      </mesh>
      
      {/* X Axis label */}
      <Text 
        position={[axisLength / 2 + 0.3, 0, 0]} 
        fontSize={0.12}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        {xLabel}
      </Text>

      {/* Y Axis - extends from 0 to +length */}
      <mesh position={[0, axisLength / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, axisLength]} />
        <meshBasicMaterial color="#2ecc71" />
      </mesh>
      
      {/* Y Axis arrowhead */}
      <mesh position={[0, axisLength, 0]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshBasicMaterial color="#2ecc71" />
      </mesh>
      
      {/* Y Axis label */}
      <Text 
        position={[0, axisLength + 0.3, 0]} 
        fontSize={0.12}
        color="#2ecc71"
        anchorX="center"
        anchorY="middle"
      >
        {yLabel}
      </Text>

      {/* Z Axis - extends from -length/2 to +length/2 */}
      {showZAxis && (
        <>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, axisLength]} />
            <meshBasicMaterial color="#3498db" />
          </mesh>
          
          {/* Z Axis arrowhead */}
          <mesh position={[0, 0, axisLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.05, 0.15, 8]} />
            <meshBasicMaterial color="#3498db" />
          </mesh>
          
          {/* Z Axis label */}
          <Text 
            position={[0, 0, axisLength / 2 + 0.3]} 
            fontSize={0.12} 
            color="#3498db"
            anchorX="center"
            anchorY="middle"
          >
            {zLabel}
          </Text>
        </>
      )}

      {/* Grid lines */}
      {showGrid && (
        <group>
          {/* XZ plane grid */}
          {Array.from({ length: 9 }, (_, i) => {
            const pos = (i - 4) * 0.5;
            return (
              <group key={`grid-${i}`}>
                {/* Lines parallel to X axis */}
                <mesh position={[0, 0, pos]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.005, 0.005, axisLength]} />
                  <meshBasicMaterial color={gridColor} transparent opacity={0.3} />
                </mesh>
                {/* Lines parallel to Z axis */}
                <mesh position={[pos, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.005, 0.005, axisLength]} />
                  <meshBasicMaterial color={gridColor} transparent opacity={0.3} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Reference floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[axisLength, axisLength]} />
        <meshPhongMaterial color={gridColor} transparent opacity={0.1} />
      </mesh>
    </group>
  );
};