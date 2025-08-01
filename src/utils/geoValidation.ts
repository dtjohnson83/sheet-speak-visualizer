import { ColumnInfo, DataRow } from '@/pages/Index';
import { detectGeoData } from './geoDataUtils';

export interface GeoValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  autoSuggestions?: {
    longitudeColumn?: string;
    latitudeColumn?: string;
  };
}

/**
 * Validates geographic data for map charts
 */
export const validateGeoData = (
  data: DataRow[],
  columns: ColumnInfo[],
  xColumn: string,
  yColumn: string,
  chartType: 'map2d' | 'map3d'
): GeoValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let autoSuggestions: { longitudeColumn?: string; latitudeColumn?: string } = {};

  // Check if columns exist
  if (!xColumn || !yColumn) {
    errors.push('Both longitude (X-axis) and latitude (Y-axis) columns must be selected');
    
    // Auto-detect geographic columns
    const geoDetection = detectGeoData(columns, data);
    if (geoDetection.hasGeoData) {
      if (geoDetection.longitudeColumn) {
        autoSuggestions.longitudeColumn = geoDetection.longitudeColumn;
        suggestions.push(`Detected longitude column: "${geoDetection.longitudeColumn}"`);
      }
      if (geoDetection.latitudeColumn) {
        autoSuggestions.latitudeColumn = geoDetection.latitudeColumn;
        suggestions.push(`Detected latitude column: "${geoDetection.latitudeColumn}"`);
      }
    }
    
    return { isValid: false, errors, suggestions, autoSuggestions };
  }

  // Find column info
  const xCol = columns.find(col => col.name === xColumn);
  const yCol = columns.find(col => col.name === yColumn);

  if (!xCol || !yCol) {
    errors.push('Selected columns not found in data');
    return { isValid: false, errors, suggestions };
  }

  // Check if columns are numeric
  if (xCol.type !== 'numeric' || yCol.type !== 'numeric') {
    errors.push('Both longitude and latitude columns must contain numeric values');
    suggestions.push('Select columns that contain decimal coordinates (e.g., -74.0059, 40.7128)');
    return { isValid: false, errors, suggestions };
  }

  // Validate coordinate ranges
  const invalidCoords = data.filter(row => {
    const lng = row[xColumn];
    const lat = row[yColumn];
    
    if (lng === null || lng === undefined || lat === null || lat === undefined) {
      return false; // Skip null values
    }
    
    return typeof lng !== 'number' || 
           typeof lat !== 'number' ||
           lng < -180 || lng > 180 ||
           lat < -90 || lat > 90;
  });

  if (invalidCoords.length > 0) {
    errors.push(`${invalidCoords.length} rows have invalid coordinates`);
    suggestions.push('Longitude values must be between -180 and 180');
    suggestions.push('Latitude values must be between -90 and 90');
    
    // Sample invalid coordinates for debugging
    const sampleInvalid = invalidCoords.slice(0, 3);
    if (sampleInvalid.length > 0) {
      suggestions.push(`Sample invalid coordinates: ${sampleInvalid.map(row => 
        `(${row[xColumn]}, ${row[yColumn]})`
      ).join(', ')}`);
    }
  }

  // Check if we have enough valid data points
  const validCoords = data.filter(row => {
    const lng = row[xColumn];
    const lat = row[yColumn];
    
    return typeof lng === 'number' && 
           typeof lat === 'number' &&
           lng >= -180 && lng <= 180 &&
           lat >= -90 && lat <= 90;
  });

  if (validCoords.length === 0) {
    errors.push('No valid geographic coordinates found');
    suggestions.push('Ensure your data contains valid latitude/longitude pairs');
    return { isValid: false, errors, suggestions };
  }

  if (validCoords.length < data.length * 0.5) {
    suggestions.push(`Only ${validCoords.length} of ${data.length} rows have valid coordinates`);
  }

  // Chart-specific validations
  if (chartType === 'map3d') {
    suggestions.push('For 3D maps, consider adding a Z-axis column for elevation data');
  }

  const isValid = errors.length === 0 && validCoords.length > 0;
  
  return { isValid, errors, suggestions, autoSuggestions };
};

/**
 * Suggests the best geographic columns based on data analysis
 */
export const suggestGeoColumns = (columns: ColumnInfo[], data: DataRow[]) => {
  const geoDetection = detectGeoData(columns, data);
  
  if (!geoDetection.hasGeoData) {
    return null;
  }

  return {
    longitude: geoDetection.longitudeColumn,
    latitude: geoDetection.latitudeColumn,
    confidence: geoDetection.confidence
  };
};