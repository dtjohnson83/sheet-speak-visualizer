import React, { Suspense, useState, useRef } from 'react';
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
  tileMode?: boolean;
  isRecording?: boolean;
}

export const Chart3DContainer: React.FC<Chart3DContainerProps> = ({
  children,
  height = 400,
  className = "",
  enableControls = true,
  showEnvironment = false,
  autoRotate = false,
  tileMode = false,
  isRecording = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${!height ? 'h-full' : ''}`}>
      {/* Control Panel - positioned differently for tile mode */}
      {enableControls && (
        <div className={`absolute z-20 flex gap-1 ${tileMode ? 'bottom-2 right-2' : 'top-2 right-2'}`}>
          <Button
            size={tileMode ? "icon" : "sm"}
            variant="outline"
            onClick={resetCamera}
            className={`bg-background/80 backdrop-blur-sm border-border/50 ${tileMode ? 'h-7 w-7 p-0' : ''}`}
            title="Reset camera"
          >
            <RotateCcw className={tileMode ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
          <Button
            size={tileMode ? "icon" : "sm"}
            variant="outline"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`bg-background/80 backdrop-blur-sm border-border/50 ${isAutoRotating ? 'bg-primary/20 border-primary/50' : ''} ${tileMode ? 'h-7 w-7 p-0' : ''}`}
            title={isAutoRotating ? "Stop auto-rotation" : "Start auto-rotation"}
          >
            {isAutoRotating ? 'Stop' : 'Auto'}
          </Button>
          {!tileMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
              className="bg-background/80 backdrop-blur-sm border-border/50"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}

      <div 
        className={!height ? 'h-full' : ''}
        style={{ height: isFullscreen ? '100vh' : height ? `${height}px` : '100%' }}
      >
        <Canvas
          shadows
          camera={{ 
            position: tileMode ? [4, 4, 4] : [8, 8, 8], 
            fov: tileMode ? 85 : 60 
          }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: isRecording
          }}
        >
          <Suspense fallback={null}>
            {/* Enhanced Lighting - adjusted for tile mode */}
            <ambientLight intensity={tileMode ? 0.7 : 0.3} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={tileMode ? 2.2 : 1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[-10, -10, -10]} intensity={tileMode ? 0.8 : 0.4} color="#4f46e5" />
            <pointLight position={[10, -5, 10]} intensity={tileMode ? 0.7 : 0.3} color="#06b6d4" />
            
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
              ref={controlsRef}
              enableDamping
              dampingFactor={0.05}
              rotateSpeed={0.5}
              zoomSpeed={0.8}
              panSpeed={0.8}
              maxPolarAngle={Math.PI * 0.75}
              minDistance={tileMode ? 2 : 5}
              maxDistance={tileMode ? 15 : 50}
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