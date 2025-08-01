import React, { useMemo } from 'react';
import { ColumnInfo, DataRow } from '@/pages/Index';
import { detectGeoData } from '@/utils/geoDataUtils';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface GeospatialDataDetectorProps {
  data: DataRow[];
  columns: ColumnInfo[];
  onGeoDataDetected?: (detection: any) => void;
}

export const GeospatialDataDetector = ({ 
  data, 
  columns, 
  onGeoDataDetected 
}: GeospatialDataDetectorProps) => {
  const geoDetection = useMemo(() => {
    if (!data.length || !columns.length) return null;
    return detectGeoData(columns, data);
  }, [data, columns]);

  React.useEffect(() => {
    if (geoDetection && onGeoDataDetected) {
      onGeoDataDetected(geoDetection);
    }
  }, [geoDetection, onGeoDataDetected]);

  if (!geoDetection) return null;

  const { hasGeoData, latitudeColumn, longitudeColumn, addressColumn, confidence } = geoDetection;

  if (!hasGeoData) return null;

  return (
    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-green-600" />
        <span className="font-medium text-green-800 dark:text-green-200">
          Geographic Data Detected
        </span>
        <Badge variant="secondary" className="text-xs">
          {Math.round(confidence * 100)}% confident
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        {latitudeColumn && longitudeColumn && (
          <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            <span>
              Coordinates found: <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-xs">
                {latitudeColumn}
              </code> (lat), <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-xs">
                {longitudeColumn}
              </code> (lng)
            </span>
          </div>
        )}
        
        {addressColumn && (
          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <AlertTriangle className="h-3 w-3" />
            <span>
              Address column: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                {addressColumn}
              </code> (geocoding required)
            </span>
          </div>
        )}
        
        <p className="text-muted-foreground text-xs mt-2">
          💡 Try the new <strong>2D Map</strong> or <strong>3D Map</strong> chart types for geographic visualization!
        </p>
      </div>
    </div>
  );
};