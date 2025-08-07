import { ColumnInfo } from '@/pages/Index';
import { 
  COORDINATE_RANGES, 
  POSTAL_PATTERN, 
  LATITUDE_PATTERNS, 
  LONGITUDE_PATTERNS,
  COUNTRY_CODE_PATTERN,
  ISO_COUNTRY_FORMAT
} from './recipePatterns';
import { RECIPE_CONFIG } from './recipeConfig';

/**
 * Enhanced Geographic Detection System
 * 
 * Provides contextual analysis for geographic column detection, reducing false positives
 * by considering word context and qualifiers rather than just pattern matching.
 */
export class GeographicDetector {
  
  // Explicitly geographic terms that are unambiguous
  private static geoKeywords = new Set([
    'latitude', 'longitude', 'lat', 'lng', 'lon',
    'postal_code', 'zip_code', 'zipcode', 'postcode',
    'country_code', 'country_iso', 'state_code', 'province_code',
    'x_coord', 'y_coord', 'coord_x', 'coord_y',
    'fips_code', 'geoname_id', 'place_id'
  ]);
  
  // Terms that could be geographic but need context validation
  private static ambiguousTerms = new Set([
    'state', 'location', 'address', 'city', 'country', 'region',
    'area', 'zone', 'district', 'territory', 'place'
  ]);
  
  // Context words that indicate non-geographic usage
  private static nonGeoContexts = new Set([
    'email', 'ip', 'mac', 'memory', 'application', 'app',
    'order', 'process', 'machine', 'server', 'network',
    'connection', 'session', 'user', 'account', 'system',
    'database', 'file', 'document', 'record', 'status',
    'error', 'exception', 'log', 'debug', 'test'
  ]);
  
  // Geographic qualifiers that indicate geographic context
  private static geoQualifiers = new Set([
    'shipping', 'billing', 'delivery', 'mailing',
    'customer', 'client', 'store', 'branch', 'office',
    'warehouse', 'facility', 'site', 'venue',
    'home', 'work', 'business', 'residential',
    'origin', 'destination', 'pickup', 'dropoff'
  ]);
  
  // Geographic hint words for value-based validation
  private static geoHints = new Set([
    'coord', 'geo', 'map', 'spatial', 'cartesian',
    'mercator', 'utm', 'wgs84', 'gps', 'navigation'
  ]);

  /**
   * Main detection method with contextual analysis
   */
  static isGeographic(name: string, column: ColumnInfo): boolean {
    const normalized = name.toLowerCase().trim();
    const words = normalized.split(/[_\s\-\.]+/).filter(word => word.length > 0);
    
    // Step 1: Check for explicit geographic keywords (high confidence)
    if (words.some(word => this.geoKeywords.has(word))) {
      return true;
    }
    
    // Step 2: Handle ambiguous terms with context analysis
    const hasAmbiguousTerm = words.some(word => this.ambiguousTerms.has(word));
    
    if (hasAmbiguousTerm) {
      // Reject if non-geographic context is present
      const hasNonGeoContext = words.some(word => this.nonGeoContexts.has(word));
      
      if (hasNonGeoContext) {
        return false;
      }
      
      // Accept if geographic qualifier is present
      const hasGeoQualifier = words.some(word => this.geoQualifiers.has(word));
      
      if (hasGeoQualifier) {
        return true;
      }
      
      // For standalone ambiguous terms, be more restrictive
      // Only accept if it's a very common geographic pattern
      if (this.isCommonGeographicPattern(normalized)) {
        return true;
      }
    }
    
    // Step 3: Value-based validation as last resort (only with geographic hints)
    return this.validateByValues(normalized, column);
  }

  /**
   * Checks if the name matches common geographic patterns
   */
  private static isCommonGeographicPattern(name: string): boolean {
    const commonPatterns = [
      /^(address|city|state|country)$/i,           // Standalone common terms
      /^(full_address|street_address)$/i,          // Address variants
      /^(home_|work_|billing_|shipping_)/i,       // Prefixed patterns
      /_(address|city|state|country)$/i            // Suffixed patterns
    ];
    
    return commonPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Value-based validation - only when name hints at geographic data
   */
  private static validateByValues(name: string, column: ColumnInfo): boolean {
    if (!column.values || column.values.length < 5) {
      return false;
    }
    
    // Only do value-based detection if name hints at geographic data
    const hasGeoHint = Array.from(this.geoHints).some(hint => name.includes(hint));
    
    if (!hasGeoHint) {
      return false;
    }
    
    const sampleValues = column.values.slice(0, Math.min(RECIPE_CONFIG.valueSampleSize, column.values.length));
    
    // Check for coordinate patterns (numeric columns)
    if (column.type === 'numeric') {
      const numValues = sampleValues.map(v => parseFloat(String(v))).filter(v => !isNaN(v));
      if (numValues.length > 0) {
        const min = Math.min(...numValues);
        const max = Math.max(...numValues);
        
        // Latitude range check
        if (min >= COORDINATE_RANGES.LATITUDE.min && 
            max <= COORDINATE_RANGES.LATITUDE.max && 
            LATITUDE_PATTERNS.test(name)) {
          return true;
        }
        
        // Longitude range check
        if (min >= COORDINATE_RANGES.LONGITUDE.min && 
            max <= COORDINATE_RANGES.LONGITUDE.max && 
            LONGITUDE_PATTERNS.test(name)) {
          return true;
        }
      }
    }
    
    // Check for postal codes
    if (sampleValues.some(val => POSTAL_PATTERN.test(String(val)))) {
      return true;
    }
    
    // Check for country codes (only if name explicitly suggests country codes)
    const isCountryCodeColumn = COUNTRY_CODE_PATTERN.test(name);
    if (isCountryCodeColumn && sampleValues.every(val => ISO_COUNTRY_FORMAT.test(String(val)))) {
      return true;
    }
    
    return false;
  }

  /**
   * Provides detailed analysis for debugging and feedback
   */
  static analyzeColumn(name: string, column: ColumnInfo): {
    isGeographic: boolean;
    confidence: number;
    reasoning: string[];
    suggestions: string[];
  } {
    const normalized = name.toLowerCase().trim();
    const words = normalized.split(/[_\s\-\.]+/).filter(word => word.length > 0);
    const reasoning: string[] = [];
    const suggestions: string[] = [];
    let confidence = 0;
    
    // Check explicit keywords
    const explicitKeywords = words.filter(word => this.geoKeywords.has(word));
    if (explicitKeywords.length > 0) {
      confidence = 0.95;
      reasoning.push(`Contains explicit geographic keywords: ${explicitKeywords.join(', ')}`);
    }
    
    // Check ambiguous terms
    const ambiguousWords = words.filter(word => this.ambiguousTerms.has(word));
    if (ambiguousWords.length > 0) {
      reasoning.push(`Contains potentially geographic terms: ${ambiguousWords.join(', ')}`);
      
      const nonGeoWords = words.filter(word => this.nonGeoContexts.has(word));
      const geoQualifierWords = words.filter(word => this.geoQualifiers.has(word));
      
      if (nonGeoWords.length > 0) {
        confidence = 0.1;
        reasoning.push(`Non-geographic context detected: ${nonGeoWords.join(', ')}`);
        suggestions.push('Consider renaming if this is actually geographic data');
      } else if (geoQualifierWords.length > 0) {
        confidence = 0.8;
        reasoning.push(`Geographic qualifiers present: ${geoQualifierWords.join(', ')}`);
      } else if (this.isCommonGeographicPattern(normalized)) {
        confidence = 0.7;
        reasoning.push('Matches common geographic naming pattern');
      } else {
        confidence = 0.3;
        reasoning.push('Ambiguous term without clear context');
        suggestions.push('Add geographic qualifier (e.g., customer_location, shipping_address)');
      }
    }
    
    // Value-based analysis
    const hasGeoHints = Array.from(this.geoHints).some(hint => name.includes(hint));
    if (hasGeoHints && column.values && column.values.length >= 5) {
      reasoning.push('Column name suggests geographic data, checking values...');
      if (this.validateByValues(normalized, column)) {
        confidence = Math.max(confidence, 0.8);
        reasoning.push('Values confirm geographic nature');
      } else {
        reasoning.push('Values do not confirm geographic nature');
        suggestions.push('Verify data format matches geographic standards');
      }
    }
    
    const isGeographic = confidence > 0.5;
    
    if (!isGeographic && ambiguousWords.length > 0) {
      suggestions.push('If this is geographic data, consider using more specific naming');
    }
    
    return {
      isGeographic,
      confidence,
      reasoning,
      suggestions
    };
  }

  /**
   * Get geographic type suggestion based on analysis
   */
  static getGeographicType(name: string, column: ColumnInfo): 'coordinates' | 'address' | 'administrative' | 'postal' | 'identifier' | 'unknown' {
    const normalized = name.toLowerCase();
    
    if (LATITUDE_PATTERNS.test(normalized) || LONGITUDE_PATTERNS.test(normalized)) {
      return 'coordinates';
    }
    
    if (normalized.includes('address') || normalized.includes('street')) {
      return 'address';
    }
    
    if (normalized.includes('postal') || normalized.includes('zip')) {
      return 'postal';
    }
    
    if (normalized.includes('country') || normalized.includes('state') || normalized.includes('province')) {
      return 'administrative';
    }
    
    if (normalized.includes('id') || normalized.includes('code')) {
      return 'identifier';
    }
    
    return 'unknown';
  }
}