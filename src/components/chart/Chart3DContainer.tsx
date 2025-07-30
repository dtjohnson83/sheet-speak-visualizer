import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { RotateCcw, Maximize, Minimize } from 'lucide-react';

interface Chart3DContainerProps {
  children: React.ReactNode;
  height?: number;
  className?: string;
  enableControls?: boolean;
  showEnvironment?: boolean;
  autoRotate?: boolean;
}

export const Chart3DContainer: React.FC<Chart3DContainerProps> = ({
  children,
  height = 400,
  className = "",
  enableControls = true,
  showEnvironment = false,
  autoRotate = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);

  const resetCamera = () => {
    // This would typically trigger a camera reset
    console.log('Resetting camera position');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Control Panel */}
      {enableControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetCamera}
            className="bg-background/80 backdrop-blur-sm"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="bg-background/80 backdrop-blur-sm"
          >
            {isAutoRotating ? 'Stop' : 'Auto'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            className="bg-background/80 backdrop-blur-sm"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      )}

      <div style={{ height: isFullscreen ? '100vh' : `${height}px` }}>
        <Canvas
          shadows
          camera={{ position: [8, 8, 8], fov: 60 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <Suspense fallback={null}>
            {/* Enhanced Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#4f46e5" />
            <pointLight position={[10, -5, 10]} intensity={0.3} color="#06b6d4" />
            
            {/* Environment */}
            {showEnvironment && (
              <>
                <Environment preset="sunset" />
                <Stars 
                  radius={100} 
                  depth={50} 
                  count={5000} 
                  factor={4} 
                  saturation={0} 
                  fade 
                  speed={1}
                />
              </>
            )}
            
            {/* Enhanced Camera Controls */}
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
              zoomSpeed={0.8}
              panSpeed={0.8}
              maxPolarAngle={Math.PI * 0.75}
              minDistance={5}
              maxDistance={50}
              autoRotate={isAutoRotating}
              autoRotateSpeed={1}
            />
            
            {/* 3D Chart Content with floating animation */}
            <Float
              speed={1}
              rotationIntensity={0.1}
              floatIntensity={0.1}
              enabled={isAutoRotating}
            >
              {children}
            </Float>
          </Suspense>
        </Canvas>
      </div>
    </Card>
  );
};