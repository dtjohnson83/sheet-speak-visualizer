
// File upload security utilities
export const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds 50MB limit'
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only Excel (.xlsx, .xls) and CSV files are allowed'
    };
  }

  // Check file extension as additional security
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'File extension not allowed'
    };
  }

  // Basic filename validation
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: 'Filename too long'
    };
  }

  // Check for suspicious patterns in filename
  const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs'];
  const lowerFileName = file.name.toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (lowerFileName.includes(pattern)) {
      return {
        isValid: false,
        error: 'File contains suspicious content'
      };
    }
  }

  return { isValid: true };
};

// Input sanitization utilities
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove HTML tags and dangerous characters
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"']/g, '') // Remove dangerous characters
    .trim()
    .substring(0, 1000); // Limit length
};

export const sanitizeChartTitle = (title: string): string => {
  if (!title) return 'Untitled Chart';
  
  return sanitizeText(title).substring(0, 100) || 'Untitled Chart';
};

// Rate limiting utilities
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (userId: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(userId);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  return true;
};

// Error message sanitization
export const sanitizeError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  
  const message = error.message || error.toString();
  
  // Don't expose sensitive information
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /key/i,
    /secret/i,
    /connection/i,
    /database/i,
    /auth/i
  ];
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(message)) {
      return 'A system error occurred. Please try again.';
    }
  }
  
  return sanitizeText(message) || 'An unexpected error occurred';
};
