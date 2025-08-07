/**
 * Recipe Pattern Constants
 * 
 * This file contains all regex patterns and classification constants used by the Recipe Engine.
 * Centralizing patterns here improves maintainability and prevents duplication.
 */

// === GEOGRAPHIC PATTERNS ===
export const GEOGRAPHIC_PATTERNS = [
  // Coordinate patterns - very specific
  /^(latitude|longitude|lat|lng|lon)$/i,
  /_(lat|lng|lon|latitude|longitude)$/i,
  /(lat|lng|lon)_/i,
  /^(x_coord|y_coord|coord_x|coord_y)$/i,
  // Location patterns - only exact matches to avoid business terms
  /^(location|address|city|state|country)$/i,
  /^(full_address|street_address|postal_address)$/i,
  // Postal patterns - very specific
  /^(postal_code|zip_code|zipcode|postcode)$/i,
  // Administrative patterns - very specific
  /^(county|district|municipality|borough|parish)$/i,
  // Geographic identifiers - very specific
  /^(fips_code|iso_country|country_iso|geoname_id|place_id)$/i
];

// === TEMPORAL PATTERNS ===
export const TEMPORAL_PATTERNS = [
  // Standard time patterns - make sure "date" pattern is more specific
  /\b(time|date|year|month|day|hour|minute|second)\b/i,
  // Business time patterns
  /(quarter|fiscal|period|semester|season)/i,
  // Event time patterns
  /(timestamp|created|updated|modified|published|when|start|end|begin|finish)/i,
  // Relative time patterns
  /(ago|since|until|before|after|during)/i
];

// === VALUE PATTERNS ===
export const POSTAL_PATTERN = /^\d{5}(-\d{4})?$|^[A-Z]\d[A-Z] \d[A-Z]\d$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}/;
export const QUARTER_PATTERN = /^Q[1-4]|[1-4]Q|\d{4}Q[1-4]/;

// === CATEGORICAL PATTERNS ===
export const CATEGORY_PATTERNS = [
  /^(yes|no|true|false|y|n|t|f)$/i,
  /^(active|inactive|enabled|disabled|on|off)$/i,
  /^(high|medium|low|small|large|xl|xxl)$/i,
  /^(new|old|pending|approved|rejected|cancelled)$/i,
  /^[A-Z]{1,3}$/  // Short codes like "CA", "NY", "USD"
];

// === SPECIALIZED NUMERIC PATTERNS ===
export const POSTAL_CODE_PATTERN = /^(postal_code|zip_code|zipcode|postcode|fips_code)$/i;

// === COORDINATE PATTERN HELPERS ===
export const LATITUDE_PATTERNS = /(lat|latitude|y_coord)/i;
export const LONGITUDE_PATTERNS = /(lng|lon|longitude|x_coord)/i;
export const EXPLICIT_GEOGRAPHIC_PATTERNS = /(lat|lng|longitude|latitude|coord|geo|x_coord|y_coord)/i;

// === COUNTRY CODE PATTERNS ===
export const COUNTRY_CODE_PATTERN = /^(country_code|nation_code|iso_country|country_iso)$/i;
export const ISO_COUNTRY_FORMAT = /^[A-Z]{2,3}$/;

// === RANGES AND THRESHOLDS ===
export const COORDINATE_RANGES = {
  LATITUDE: { min: -90, max: 90 },
  LONGITUDE: { min: -180, max: 180 }
} as const;

export const YEAR_RANGE = { min: 1900, max: 2100 } as const;
export const UNIX_TIMESTAMP_RANGE = { min: 1000000000, max: 9999999999 } as const;

// === CARDINALITY THRESHOLDS ===
export const CARDINALITY_THRESHOLDS = {
  LOW_CATEGORICAL: 50,
  MEDIUM_CATEGORICAL: 200,
  LOW_UNIQUENESS_RATIO: 0.7,
  MEDIUM_UNIQUENESS_RATIO: 0.5,
  HIGH_UNIQUENESS_GEOGRAPHIC: 0.8
} as const;