import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  Lightbulb,
  Navigation
} from 'lucide-react';
import { validateGeoData, GeoValidationResult } from '@/utils/geoValidation';
import { ColumnInfo, DataRow } from '@/pages/Index';

interface GeoChartValidatorProps {
  data: DataRow[];
  columns: ColumnInfo[];
  xColumn: string;
  yColumn: string;
  chartType: 'map2d' | 'map3d';
  onAutoFix?: (suggestions: { longitudeColumn?: string; latitudeColumn?: string }) => void;
}

export const GeoChartValidator = ({
  data,
  columns,
  xColumn,
  yColumn,
  chartType,
  onAutoFix
}: GeoChartValidatorProps) => {
  const validation = validateGeoData(data, columns, xColumn, yColumn, chartType);

  if (validation.isValid) {
    const validCount = data.filter(row => {
      const lng = row[xColumn];
      const lat = row[yColumn];
      return typeof lng === 'number' && 
             typeof lat === 'number' &&
             lng >= -180 && lng <= 180 &&
             lat >= -90 && lat <= 90;
    }).length;

    return (
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Geographic data validated successfully
            </span>
            <Badge variant="outline" className="ml-auto">
              {validCount} valid points
            </Badge>
          </div>
          {validation.suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {validation.suggestions.map((suggestion, index) => (
                <p key={index} className="text-xs text-green-700 dark:text-green-300">
                  • {suggestion}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {validation.errors.map((error, index) => (
        <Alert key={index} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ))}

      {validation.suggestions.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Suggestions
              </span>
            </div>
            <div className="space-y-1">
              {validation.suggestions.map((suggestion, index) => (
                <p key={index} className="text-xs text-blue-700 dark:text-blue-300">
                  • {suggestion}
                </p>
              ))}
            </div>

            {validation.autoSuggestions && onAutoFix && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAutoFix(validation.autoSuggestions!)}
                  className="w-full"
                >
                  <Navigation className="h-3 w-3 mr-2" />
                  Auto-select detected geographic columns
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Geographic Data Requirements
            </span>
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <p>• Longitude (X-axis): Must be between -180 and 180</p>
            <p>• Latitude (Y-axis): Must be between -90 and 90</p>
            <p>• Both columns must contain numeric decimal coordinates</p>
            <p>• Example: New York City is at longitude -74.0059, latitude 40.7128</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};