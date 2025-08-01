import { ColumnInfo, DataRow } from '@/pages/Index';

export interface GeoDataDetection {
  hasGeoData: boolean;
  latitudeColumn: string | null;
  longitudeColumn: string | null;
  addressColumn: string | null;
  confidence: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Common patterns for latitude column names
const LAT_PATTERNS = [
  /^lat(itude)?$/i,
  /^lat$/i,
  /^y$/i,
  /^geo_lat$/i,
  /^location_lat$/i
];

// Common patterns for longitude column names
const LNG_PATTERNS = [
  /^lng$/i,
  /^lon(gitude)?$/i,
  /^long$/i,
  /^x$/i,
  /^geo_lng$/i,
  /^geo_lon$/i,
  /^location_lng$/i,
  /^location_lon$/i
];

// Common patterns for address columns
const ADDRESS_PATTERNS = [
  /^address$/i,
  /^location$/i,
  /^place$/i,
  /^city$/i,
  /^region$/i
];

/**
 * Detects geographic data in the provided columns and data
 */
export const detectGeoData = (columns: ColumnInfo[], data: DataRow[]): GeoDataDetection => {
  let latitudeColumn: string | null = null;
  let longitudeColumn: string | null = null;
  let addressColumn: string | null = null;
  let confidence = 0;

  // Find latitude column
  for (const column of columns) {
    if (column.type === 'numeric') {
      for (const pattern of LAT_PATTERNS) {
        if (pattern.test(column.name)) {
          // Validate that values are in latitude range (-90 to 90)
          const validLat = data.every(row => {
            const val = row[column.name];
            return val === null || val === undefined || (typeof val === 'number' && val >= -90 && val <= 90);
          });
          
          if (validLat) {
            latitudeColumn = column.name;
            confidence += 0.4;
            break;
          }
        }
      }
    }
  }

  // Find longitude column
  for (const column of columns) {
    if (column.type === 'numeric') {
      for (const pattern of LNG_PATTERNS) {
        if (pattern.test(column.name)) {
          // Validate that values are in longitude range (-180 to 180)
          const validLng = data.every(row => {
            const val = row[column.name];
            return val === null || val === undefined || (typeof val === 'number' && val >= -180 && val <= 180);
          });
          
          if (validLng) {
            longitudeColumn = column.name;
            confidence += 0.4;
            break;
          }
        }
      }
    }
  }

  // Find address column
  for (const column of columns) {
    if (column.type === 'text' || column.type === 'categorical') {
      for (const pattern of ADDRESS_PATTERNS) {
        if (pattern.test(column.name)) {
          addressColumn = column.name;
          confidence += 0.2;
          break;
        }
      }
    }
  }

  const hasGeoData = Boolean((latitudeColumn && longitudeColumn) || addressColumn);

  return {
    hasGeoData,
    latitudeColumn,
    longitudeColumn,
    addressColumn,
    confidence
  };
};

/**
 * Calculates the geographic bounds of the data
 */
export const calculateGeoBounds = (data: DataRow[], latColumn: string, lngColumn: string): GeoBounds | null => {
  const validCoords = data
    .map(row => ({
      lat: row[latColumn],
      lng: row[lngColumn]
    }))
    .filter(coord => 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      coord.lat >= -90 && coord.lat <= 90 &&
      coord.lng >= -180 && coord.lng <= 180
    );

  if (validCoords.length === 0) return null;

  return {
    north: Math.max(...validCoords.map(c => c.lat)),
    south: Math.min(...validCoords.map(c => c.lat)),
    east: Math.max(...validCoords.map(c => c.lng)),
    west: Math.min(...validCoords.map(c => c.lng))
  };
};

/**
 * Formats coordinate values for display
 */
export const formatCoordinate = (value: number, type: 'lat' | 'lng'): string => {
  const direction = type === 'lat' 
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  
  return `${Math.abs(value).toFixed(6)}°${direction}`;
};

/**
 * Validates if a coordinate pair is valid
 */
export const isValidCoordinate = (lat: any, lng: any): boolean => {
  return typeof lat === 'number' && 
         typeof lng === 'number' &&
         lat >= -90 && lat <= 90 &&
         lng >= -180 && lng <= 180;
};