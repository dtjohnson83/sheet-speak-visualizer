import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { checkRateLimit, sanitizeText } from '@/lib/security';

interface UseEnhancedFileUploadProps {
  onSuccess: (file: File) => void;
  onError?: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

// Enhanced file validation with multiple security layers
const validateFileSignature = (buffer: ArrayBuffer, filename: string): boolean => {
  const uint8Array = new Uint8Array(buffer);
  const signature = uint8Array.slice(0, 8);
  
  // Enhanced signature validation
  const fileSignatures = {
    xlsx: [0x50, 0x4B, 0x03, 0x04], // ZIP-based format
    xls: [0xD0, 0xCF, 0x11, 0xE0], // OLE compound document
    csv: null, // Text-based, validated separately
  };

  const extension = filename.toLowerCase().split('.').pop();
  
  if (extension === 'csv') {
    // For CSV, check if it's valid text
    const firstBytes = uint8Array.slice(0, 512);
    return firstBytes.every(byte => byte >= 0x09 && byte <= 0x7F);
  }
  
  if (extension === 'xlsx') {
    return signature[0] === 0x50 && signature[1] === 0x4B;
  }
  
  if (extension === 'xls') {
    return signature[0] === 0xD0 && signature[1] === 0xCF && 
           signature[2] === 0x11 && signature[3] === 0xE0;
  }
  
  return false;
};

const scanForMaliciousContent = (buffer: ArrayBuffer): { isSafe: boolean; threats: string[] } => {
  const uint8Array = new Uint8Array(buffer);
  const content = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
  const threats: string[] = [];
  
  // Scan for common malicious patterns
  const maliciousPatterns = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /<script[^>]*>/gi,
    /eval\s*\(/gi,
    /document\.write/gi,
    /window\.location/gi,
    /iframe/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
  ];
  
  maliciousPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      threats.push(`Malicious pattern ${index + 1} detected`);
    }
  });
  
  // Check for embedded executables
  if (content.includes('MZ') && content.includes('PE')) {
    threats.push('Embedded executable detected');
  }
  
  // Check for suspicious URLs
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = content.match(urlPattern) || [];
  if (urls.length > 10) {
    threats.push('Excessive URL count detected');
  }
  
  return {
    isSafe: threats.length === 0,
    threats
  };
};

export const useEnhancedFileUpload = ({ 
  onSuccess, 
  onError,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']
}: UseEnhancedFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

  const logSecurityEvent = useCallback((event: string, details: any) => {
    logger.security('File upload security event', {
      event,
      userId: user?.id,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 200),
      ...details
    });
  }, [user?.id]);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Sanitize filename
    const sanitizedName = sanitizeText(file.name);
    if (sanitizedName !== file.name) {
      logSecurityEvent('suspicious_filename', { 
        originalName: file.name.substring(0, 100),
        sanitizedName: sanitizedName.substring(0, 100)
      });
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`
      };
    }
    
    // Check minimum file size (prevent empty files)
    if (file.size < 10) {
      return {
        isValid: false,
        error: 'File appears to be empty or corrupted'
      };
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      logSecurityEvent('invalid_file_type', { 
        fileType: file.type,
        fileName: sanitizedName.substring(0, 100)
      });
      return {
        isValid: false,
        error: 'File type not allowed. Only Excel (.xlsx, .xls) and CSV files are supported'
      };
    }
    
    // Check file extension
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = sanitizedName.toLowerCase().substring(sanitizedName.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      logSecurityEvent('invalid_file_extension', { 
        extension: fileExtension,
        fileName: sanitizedName.substring(0, 100)
      });
      return {
        isValid: false,
        error: 'File extension not allowed'
      };
    }
    
    // Check for suspicious filename patterns
    const suspiciousPatterns = [
      /\.exe/i, /\.bat/i, /\.cmd/i, /\.scr/i, /\.js/i, /\.vbs/i,
      /\.php/i, /\.asp/i, /\.jsp/i, /\.dll/i, /\.com/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(sanitizedName))) {
      logSecurityEvent('suspicious_file_pattern', { 
        fileName: sanitizedName.substring(0, 100)
      });
      return {
        isValid: false,
        error: 'File contains suspicious patterns'
      };
    }
    
    return { isValid: true };
  }, [maxFileSize, allowedTypes, logSecurityEvent]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!user) {
      const error = 'Authentication required for file upload';
      logSecurityEvent('upload_without_auth', { fileName: file.name.substring(0, 100) });
      onError?.(error);
      toast.error(error);
      return;
    }

    // Enhanced rate limiting check
    if (!checkRateLimit(user.id, 3, 60000)) { // Reduced to 3 uploads per minute
      const error = 'Upload rate limit exceeded. Please wait before trying again.';
      logSecurityEvent('rate_limit_exceeded', { 
        userId: user.id,
        fileName: file.name.substring(0, 100)
      });
      onError?.(error);
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Phase 1: Basic validation
      setUploadProgress(20);
      const basicValidation = validateFile(file);
      if (!basicValidation.isValid) {
        throw new Error(basicValidation.error);
      }

      // Phase 2: File signature validation
      setUploadProgress(40);
      const buffer = await file.arrayBuffer();
      
      if (!validateFileSignature(buffer, file.name)) {
        logSecurityEvent('invalid_file_signature', { 
          fileName: file.name.substring(0, 100),
          fileSize: file.size
        });
        throw new Error('File signature validation failed. The file may be corrupted or malicious.');
      }

      // Phase 3: Malicious content scanning
      setUploadProgress(60);
      const securityScan = scanForMaliciousContent(buffer);
      
      if (!securityScan.isSafe) {
        logSecurityEvent('malicious_content_detected', { 
          fileName: file.name.substring(0, 100),
          threats: securityScan.threats
        });
        throw new Error('Security scan failed: potentially malicious content detected');
      }

      // Phase 4: Final validation
      setUploadProgress(80);
      
      // Log successful upload
      logSecurityEvent('file_upload_success', { 
        fileName: file.name.substring(0, 100),
        fileSize: file.size,
        fileType: file.type
      });

      setUploadProgress(100);
      onSuccess(file);
      toast.success('File uploaded and validated successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      logSecurityEvent('file_upload_failed', { 
        fileName: file.name.substring(0, 100),
        error: errorMessage.substring(0, 200)
      });
      
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user, validateFile, onSuccess, onError, logSecurityEvent]);

  return {
    handleFileUpload,
    isUploading,
    uploadProgress
  };
};