// Edge function security utilities

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Content-Type-Options'?: string;
  'X-Frame-Options'?: string;
  'X-XSS-Protection'?: string;
  'Strict-Transport-Security'?: string;
  'Referrer-Policy'?: string;
}

export const getSecurityHeaders = (): SecurityHeaders => ({
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});

export const getEnhancedCORSHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  ...getSecurityHeaders(),
});

export const validateRequest = (req: Request): { isValid: boolean; error?: string } => {
  // Check request method
  if (!['POST', 'OPTIONS'].includes(req.method)) {
    return { isValid: false, error: 'Method not allowed' };
  }

  // Check content type for POST requests
  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { isValid: false, error: 'Invalid content type' };
    }
  }

  // Check for required headers
  const origin = req.headers.get('origin');
  const userAgent = req.headers.get('user-agent');
  
  if (!origin && !userAgent) {
    return { isValid: false, error: 'Missing required headers' };
  }

  return { isValid: true };
};

export const sanitizeRequestData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  
  // Remove or sanitize sensitive fields
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'authorization'];
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      delete sanitized[key];
    }
    
    // Recursively sanitize nested objects
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestData(sanitized[key]);
    }
    
    // Sanitize strings
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].substring(0, 10000); // Limit string length
    }
  });

  return sanitized;
};

export const createSecureResponse = (
  data: any, 
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response => {
  const headers = {
    ...getEnhancedCORSHeaders(),
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
};

export const createSecureErrorResponse = (
  message: string,
  status: number = 500,
  additionalHeaders: Record<string, string> = {}
): Response => {
  const sanitizedMessage = message.length > 200 ? 'An error occurred' : message;
  
  return createSecureResponse(
    { 
      error: sanitizedMessage,
      timestamp: new Date().toISOString(),
    },
    status,
    additionalHeaders
  );
};