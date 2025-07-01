// Utility functions for date conversion and formatting

// Excel date serial number conversion with time support
export const convertExcelDate = (serial: number): string => {
  // Excel's epoch is 1900-01-01, but Excel incorrectly treats 1900 as a leap year
  // So we need to account for this bug
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  return date.toISOString();
};

// Check if a value looks like an Excel date serial
export const isExcelDateSerial = (value: number): boolean => {
  // Expanded range: 1 (1900-01-01) to 2958465 (2099-12-31)
  // Accept both integers and decimals (decimals represent time component)
  return value >= 1 && value <= 2958465;
};

// Convert a value to date format if possible
export const convertValueToDate = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const num = Number(value);
  
  // If it's a number and looks like an Excel date serial, convert it
  if (!isNaN(num) && isExcelDateSerial(num)) {
    try {
      return convertExcelDate(num);
    } catch (error) {
      console.warn(`Failed to convert Excel date serial ${num}:`, error);
      return String(value);
    }
  }
  
  // Try to parse as regular date and convert to ISO string
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.warn('Date conversion error:', error);
  }
  
  return String(value);
};

// Format a date value for display
export const formatDateForDisplay = (value: any, format: string = 'YYYY-MM-DD'): string => {
  if (value === null || value === undefined || value === '') return '';
  
  try {
    // First, ensure we have a proper date
    let dateValue = value;
    const num = Number(value);
    
    // If it's an Excel serial number, convert it first
    if (!isNaN(num) && isExcelDateSerial(num)) {
      dateValue = convertExcelDate(num);
    }
    
    // Handle ISO string dates and other formats properly
    let date: Date;
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      // ISO string - parse directly
      date = new Date(dateValue);
    } else {
      // Other formats - let Date constructor handle it
      date = new Date(dateValue);
    }
    
    if (isNaN(date.getTime())) return String(value);
    
    switch (format) {
      case 'MM/DD/YYYY':
        return date.toLocaleDateString('en-US');
      case 'DD/MM/YYYY':
        return date.toLocaleDateString('en-GB');
      case 'MMM DD, YYYY':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      case 'MMMM DD, YYYY':
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'DD MMM YYYY':
        return date.toLocaleDateString('en-GB', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      case 'YYYY-MM-DD HH:MM':
        return `${date.toLocaleDateString('en-CA')} ${date.toTimeString().slice(0, 5)}`;
      case 'MM/DD/YYYY HH:MM':
        return `${date.toLocaleDateString('en-US')} ${date.toTimeString().slice(0, 5)}`;
      case 'YYYY-MM-DD':
      default:
        return date.toLocaleDateString('en-CA'); // ISO format
    }
  } catch (error) {
    console.warn('Date formatting error:', error);
    return String(value);
  }
};
