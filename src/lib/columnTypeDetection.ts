// Utility functions for smart column type detection

/**
 * Detects if a column name suggests it contains date data
 */
export const isDateColumnName = (columnName: string): boolean => {
  const lowerName = columnName.toLowerCase().trim();
  
  // Common date-related keywords
  const dateKeywords = [
    'date', 'time', 'timestamp', 'datetime',
    'created', 'updated', 'modified', 'deleted',
    'birth', 'born', 'start', 'end', 'begin', 'finish',
    'expires', 'expired', 'due', 'deadline',
    'published', 'release', 'launch', 'opened', 'closed',
    'registered', 'joined', 'signed', 'last_login',
    'effective', 'valid', 'from', 'to', 'until'
  ];
  
  // Check if column name contains any date keywords
  return dateKeywords.some(keyword => lowerName.includes(keyword));
};

/**
 * Enhanced column type detection that considers both column name and data values
 */
export const detectColumnTypeWithName = (
  columnName: string,
  values: any[]
): 'numeric' | 'date' | 'categorical' | 'text' => {
  const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonEmptyValues.length === 0) return 'text';
  
  // First, check if column name suggests it's a date
  if (isDateColumnName(columnName)) {
    // If name suggests date, be more lenient with date detection
    if (hasAnyDateLikeValues(nonEmptyValues)) {
      return 'date';
    }
  }
  
  // Existing numeric detection logic
  const numericValues = nonEmptyValues.filter(v => {
    const num = Number(v);
    return !isNaN(num) && isFinite(num) && String(v).trim() !== '';
  });
  
  if (numericValues.length >= nonEmptyValues.length * 0.8) {
    // Check if it's a year column (but not if name suggests date)
    if (!isDateColumnName(columnName)) {
      const yearValues = nonEmptyValues.filter(v => {
        const str = String(v).trim();
        if (!/^\d{4}$/.test(str)) return false;
        const year = parseInt(str);
        return year >= 1900 && year <= new Date().getFullYear() + 20;
      });
      
      if (yearValues.length >= nonEmptyValues.length * 0.8) {
        return 'numeric';
      }
    }
    
    return 'numeric';
  }
  
  // Standard date detection (stricter when name doesn't suggest date)
  if (hasDateLikeValues(nonEmptyValues)) {
    return 'date';
  }
  
  // Check for categorical
  const uniqueValues = new Set(nonEmptyValues.map(v => String(v).toLowerCase().trim()));
  if (uniqueValues.size < nonEmptyValues.length * 0.5 && uniqueValues.size > 1 && uniqueValues.size <= 50) {
    return 'categorical';
  }
  
  return 'text';
};

/**
 * Checks if values contain date-like data (lenient for name-based detection)
 */
const hasAnyDateLikeValues = (values: any[]): boolean => {
  // More lenient date detection when column name suggests date
  const dateIndicators = values.filter(v => {
    const str = String(v).trim();
    
    // Check for common date patterns
    const datePatterns = [
      /^\d{4}-\d{1,2}-\d{1,2}/, // ISO dates (with or without time)
      /^\d{1,2}\/\d{1,2}\/\d{4}/, // US format
      /^\d{1,2}-\d{1,2}-\d{4}/, // Alternative format
      /^\d{4}\/\d{1,2}\/\d{1,2}/, // Year first
      /^\d{1,2}\/\d{1,2}\/\d{2}$/, // Short year
    ];
    
    if (datePatterns.some(pattern => pattern.test(str))) {
      return true;
    }
    
    // Check for Excel date serials
    const num = Number(v);
    if (!isNaN(num) && num >= 1 && num <= 2958465) {
      return true;
    }
    
    // Check if it can be parsed as a date
    const date = new Date(v);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      return year >= 1900 && year <= 2100;
    }
    
    return false;
  });
  
  // If at least 30% of values look like dates, consider it a date column
  return dateIndicators.length >= Math.max(1, values.length * 0.3);
};

/**
 * Standard date detection (stricter)
 */
const hasDateLikeValues = (values: any[]): boolean => {
  // Check for Excel date serials
  const potentialDateSerials = values.filter(v => {
    const num = Number(v);
    return !isNaN(num) && num >= 1 && num <= 2958465;
  });
  
  if (potentialDateSerials.length > values.length * 0.5) {
    return true;
  }
  
  // Check for date string patterns
  const datePatterns = [
    /^\d{4}-\d{1,2}-\d{1,2}$/,
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
    /^\d{4}\/\d{1,2}\/\d{1,2}$/,
    /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}/,
  ];
  
  const dateValues = values.filter(v => {
    const str = String(v).trim();
    if (/^\d+$/.test(str)) return false;
    
    const matchesPattern = datePatterns.some(pattern => pattern.test(str));
    if (!matchesPattern) return false;
    
    const date = new Date(str);
    if (isNaN(date.getTime())) return false;
    
    const year = date.getFullYear();
    return year >= 1900 && year <= 2100;
  });
  
  return dateValues.length > values.length * 0.7;
};
