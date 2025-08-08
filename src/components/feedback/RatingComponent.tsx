import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RatingComponentProps {
  maxRating?: number;
  initialRating?: number;
  rating?: number;
  onChange?: (rating: number) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const RatingComponent: React.FC<RatingComponentProps> = ({
  maxRating = 5,
  initialRating = 0,
  rating: externalRating,
  onChange,
  label,
  disabled = false,
  size = 'md',
  showValue = false,
}) => {
  const [internalRating, setInternalRating] = useState(initialRating);
  const rating = externalRating !== undefined ? externalRating : internalRating;
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleRatingClick = (newRating: number) => {
    if (disabled) return;
    if (externalRating === undefined) {
      setInternalRating(newRating);
    }
    onChange?.(newRating);
  };

  const handleMouseEnter = (hoverValue: number) => {
    if (disabled) return;
    setHoverRating(hoverValue);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {showValue && rating > 0 && (
            <span className="ml-2 text-muted-foreground">({rating}/{maxRating})</span>
          )}
        </label>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= (hoverRating || rating);
          
          return (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              className={cn(
                "p-1 h-auto hover:bg-transparent",
                disabled && "cursor-default"
              )}
              onClick={() => handleRatingClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled 
                    ? "fill-primary text-primary" 
                    : "fill-transparent text-muted-foreground hover:text-primary",
                  disabled && "opacity-50"
                )}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
};