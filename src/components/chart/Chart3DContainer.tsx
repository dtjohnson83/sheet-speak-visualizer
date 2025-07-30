import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface Chart3DContainerProps {
  children: React.ReactNode;
  height?: number;
  className?: string;
}

export const Chart3DContainer: React.FC<Chart3DContainerProps> = ({
  children,
  height = 400,
  className = ""
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div style={{ height: `${height}px` }}>
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            {/* Lighting setup */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            
            {/* Camera controls */}
            <OrbitControls
              enableDamping
              dampingFactor={0.1}
              rotateSpeed={0.5}
              zoomSpeed={1}
              panSpeed={0.8}
              maxPolarAngle={Math.PI / 2}
            />
            
            {/* 3D Chart Content */}
            {children}
          </Suspense>
        </Canvas>
      </div>
    </Card>
  );
};