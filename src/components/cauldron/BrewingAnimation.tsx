import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Beaker } from 'lucide-react';

interface BrewingAnimationProps {
  isActive: boolean;
  recipe?: {
    name: string;
    confidence: number;
    chartType: string;
    ingredients: string[];
  };
  onComplete?: () => void;
}

interface BrewingPhase {
  name: string;
  icon: React.ReactNode;
  duration: number;
  color: string;
}

export const BrewingAnimation: React.FC<BrewingAnimationProps> = ({
  isActive,
  recipe,
  onComplete
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  const brewingPhases: BrewingPhase[] = [
    { name: 'Analyzing Ingredients', icon: <Beaker className="h-4 w-4" />, duration: 1000, color: 'hsl(var(--primary))' },
    { name: 'Mixing Essences', icon: <Zap className="h-4 w-4" />, duration: 1500, color: 'hsl(var(--secondary))' },
    { name: 'Applying Magic', icon: <Sparkles className="h-4 w-4" />, duration: 2000, color: 'hsl(var(--accent))' },
    { name: 'Finalizing Recipe', icon: <Sparkles className="h-4 w-4" />, duration: 1000, color: 'hsl(var(--primary))' }
  ];

  // Generate random bubbles
  useEffect(() => {
    if (isActive) {
      const newBubbles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        delay: Math.random() * 2
      }));
      setBubbles(newBubbles);
    }
  }, [isActive]);

  // Brewing phase progression
  useEffect(() => {
    if (!isActive) {
      setCurrentPhase(0);
      setProgress(0);
      return;
    }

    let phaseTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    const runPhase = (phaseIndex: number) => {
      if (phaseIndex >= brewingPhases.length) {
        onComplete?.();
        return;
      }

      setCurrentPhase(phaseIndex);
      setProgress(0);

      const phase = brewingPhases[phaseIndex];
      const progressIncrement = 100 / (phase.duration / 50);

      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + progressIncrement;
          if (newProgress >= 100) {
            clearInterval(progressTimer);
            phaseTimer = setTimeout(() => runPhase(phaseIndex + 1), 200);
          }
          return Math.min(newProgress, 100);
        });
      }, 50);
    };

    runPhase(0);

    return () => {
      clearTimeout(phaseTimer);
      clearInterval(progressTimer);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const currentPhaseData = brewingPhases[currentPhase];

  return (
    <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
      {/* Magical background effects */}
      <div className="absolute inset-0 opacity-30">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-gradient-to-t from-primary/40 to-transparent animate-pulse"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Cauldron visualization */}
      <div className="relative z-10 text-center space-y-6">
        <div className="mx-auto w-32 h-32 relative">
          {/* Cauldron base */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-muted/50 to-muted border-4 border-primary/30 relative overflow-hidden">
            {/* Bubbling liquid */}
            <div 
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-1000 animate-pulse"
              style={{ 
                height: `${60 + (progress * 0.3)}%`,
                background: `linear-gradient(to top, ${currentPhaseData?.color}40, ${currentPhaseData?.color}20)`
              }}
            />
            
            {/* Magical sparkles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles 
                className="h-8 w-8 text-primary animate-spin" 
                style={{ animationDuration: '3s' }}
              />
            </div>
          </div>

          {/* Steam/smoke effect */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-gradient-to-t from-primary/30 to-transparent rounded-full animate-pulse opacity-60"
                style={{
                  marginLeft: `${(i - 1) * 8}px`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Current phase indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            {currentPhaseData?.icon}
            <h3 className="text-lg font-semibold text-foreground">
              {currentPhaseData?.name}
            </h3>
          </div>
          
          <Progress value={progress} className="w-full max-w-md mx-auto" />
          
          <p className="text-sm text-muted-foreground">
            Phase {currentPhase + 1} of {brewingPhases.length}
          </p>
        </div>

        {/* Recipe preview */}
        {recipe && (
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h4 className="font-medium text-foreground">{recipe.name}</h4>
              <Badge variant="outline">
                {Math.round(recipe.confidence * 100)}% confidence
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              Creating {recipe.chartType} visualization
            </p>
            
            <div className="flex flex-wrap justify-center gap-1">
              {recipe.ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Magical effects overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-ping opacity-75"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${30 + (i * 10)}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};