import React from 'react';
import { getChartColors } from '@/lib/chartTheme';

interface BrandedPrimitivesProps {
  colors?: string[];
  id?: string;
}

/**
 * Reusable SVG definitions for branded chart components
 * Provides gradients, patterns, shadows, and filters
 */
export const BrandedPrimitives: React.FC<BrandedPrimitivesProps> = ({ 
  colors = getChartColors('modern'), 
  id = 'branded-chart' 
}) => {
  return (
    <defs>
      {/* Primary Gradients */}
      <linearGradient id={`${id}-gradient-primary`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} stopOpacity={0.8} />
        <stop offset="100%" stopColor={colors[0]} stopOpacity={0.3} />
      </linearGradient>

      <linearGradient id={`${id}-gradient-secondary`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[1] || colors[0]} stopOpacity={0.8} />
        <stop offset="100%" stopColor={colors[1] || colors[0]} stopOpacity={0.3} />
      </linearGradient>

      <linearGradient id={`${id}-gradient-tertiary`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[2] || colors[0]} stopOpacity={0.8} />
        <stop offset="100%" stopColor={colors[2] || colors[0]} stopOpacity={0.3} />
      </linearGradient>

      {/* Bar Gradients */}
      <linearGradient id={`${id}-bar-gradient-primary`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} stopOpacity={1} />
        <stop offset="100%" stopColor={colors[0]} stopOpacity={0.8} />
      </linearGradient>

      <linearGradient id={`${id}-bar-gradient-secondary`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[1] || colors[0]} stopOpacity={1} />
        <stop offset="100%" stopColor={colors[1] || colors[0]} stopOpacity={0.8} />
      </linearGradient>

      {/* Radial Gradients for Points */}
      <radialGradient id={`${id}-point-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={colors[0]} stopOpacity={1} />
        <stop offset="70%" stopColor={colors[0]} stopOpacity={0.8} />
        <stop offset="100%" stopColor={colors[0]} stopOpacity={0} />
      </radialGradient>

      {/* Shadow Filters */}
      <filter id={`${id}-drop-shadow`} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={colors[0]} floodOpacity="0.2" />
      </filter>

      <filter id={`${id}-glow-shadow`} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={colors[0]} floodOpacity="0.4" />
      </filter>

      <filter id={`${id}-bar-shadow`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={colors[0]} floodOpacity="0.3" />
      </filter>

      {/* Hatch Patterns for Highlighting */}
      <pattern id={`${id}-hatch-pattern`} patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M 0,4 l 4,-4 M -1,1 l 2,-2 M 3,5 l 2,-2" stroke={colors[0]} strokeOpacity="0.3" strokeWidth="1" />
      </pattern>

      {/* Grid Pattern */}
      <pattern id={`${id}-grid-pattern`} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--chart-grid))" strokeWidth="1" strokeOpacity="0.3" />
      </pattern>

      {/* Animated Gradient for Loading States */}
      <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={colors[0]} stopOpacity={0.1}>
          <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor={colors[0]} stopOpacity={0.3}>
          <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor={colors[0]} stopOpacity={0.1}>
          <animate attributeName="stop-opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
  );
};

interface BrandedTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  labelFormatter?: (value: any) => string;
  valueFormatter?: (value: any) => string;
}

/**
 * Custom tooltip component with modern styling
 */
export const BrandedTooltip: React.FC<BrandedTooltipProps> = ({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="chart-tooltip animate-in fade-in-0 zoom-in-95 duration-200">
      <div className="chart-tooltip-content">
        {label && (
          <div className="chart-tooltip-label">
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="chart-tooltip-item">
            <div 
              className="chart-tooltip-indicator"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="chart-tooltip-value font-medium">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BrandedLegendProps {
  payload?: any[];
  onToggle?: (dataKey: string) => void;
  hiddenItems?: Set<string>;
}

/**
 * Custom legend component with pill-style design
 */
export const BrandedLegend: React.FC<BrandedLegendProps> = ({
  payload,
  onToggle,
  hiddenItems = new Set(),
}) => {
  if (!payload || !payload.length) {
    return null;
  }

  return (
    <div className="chart-legend">
      {payload.map((entry, index) => {
        const isHidden = hiddenItems.has(entry.dataKey);
        return (
          <div
            key={index}
            className={`chart-legend-item ${isHidden ? 'opacity-50' : ''}`}
            onClick={() => onToggle?.(entry.dataKey)}
          >
            <div
              className="chart-legend-indicator"
              style={{ backgroundColor: entry.color }}
            />
            <span className="chart-legend-text">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
};

interface GridProps {
  stroke?: string;
  strokeDasharray?: string;
  opacity?: number;
}

/**
 * Custom grid component with muted styling
 */
export const BrandedGrid: React.FC<GridProps> = ({
  stroke = 'hsl(var(--chart-grid))',
  strokeDasharray = '2,2',
  opacity = 0.3,
  ...props
}) => {
  return (
    <g className="chart-grid">
      {/* This will be replaced by the actual grid lines from Recharts */}
    </g>
  );
};

export default BrandedPrimitives;