
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

// Enhanced input sanitization utilities
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // More comprehensive sanitization
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"'&`]/g, '') // Remove dangerous characters including backticks and ampersands
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/style\s*=/gi, '') // Remove style attributes
    .trim()
    .substring(0, 1000); // Limit length
};

// Enhanced HTML sanitization for content that might be rendered
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // Comprehensive HTML sanitization
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '') // Remove iframe tags
    .replace(/<object[^>]*>.*?<\/object>/gis, '') // Remove object tags
    .replace(/<embed[^>]*>/gi, '') // Remove embed tags
    .replace(/<link[^>]*>/gi, '') // Remove link tags
    .replace(/<meta[^>]*>/gi, '') // Remove meta tags
    .replace(/<form[^>]*>.*?<\/form>/gis, '') // Remove form tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
    .substring(0, 5000); // Limit length for HTML content
};

export const sanitizeChartTitle = (title: string): string => {
  if (!title) return 'Untitled Chart';
  
  return sanitizeText(title).substring(0, 100) || 'Untitled Chart';
};

// Enhanced rate limiting utilities with IP-based tracking
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

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

export const checkIPRateLimit = (ip: string, maxRequests: number = 50, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const ipRequests = ipRequestCounts.get(ip);

  if (!ipRequests || now > ipRequests.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (ipRequests.count >= maxRequests) {
    return false;
  }

  ipRequests.count++;
  return true;
};

// Clear old rate limit entries periodically
export const cleanupRateLimits = (): void => {
  const now = Date.now();
  
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
  
  for (const [key, value] of ipRequestCounts.entries()) {
    if (now > value.resetTime) {
      ipRequestCounts.delete(key);
    }
  }
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
