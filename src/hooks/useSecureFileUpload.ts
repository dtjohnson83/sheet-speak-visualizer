
import { useState } from 'react';
import { validateFile, checkRateLimit } from '@/lib/security';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEnhancedFileUpload } from './useEnhancedFileUpload';
import { useAuditLogger } from './useAuditLogger';

interface UseSecureFileUploadProps {
  onSuccess: (file: File) => void;
  onError?: (error: string) => void;
}

export const useSecureFileUpload = ({ onSuccess, onError }: UseSecureFileUploadProps) => {
  // Use enhanced file upload for better security
  const enhancedUpload = useEnhancedFileUpload({ onSuccess, onError });
  const { logFileEvent } = useAuditLogger();

  const handleFileUpload = async (file: File) => {
    // Log file upload attempt
    logFileEvent('file_upload_attempt', file.name, {
      fileSize: file.size,
      fileType: file.type
    });

    // Delegate to enhanced upload handler
    await enhancedUpload.handleFileUpload(file);
  };

  return {
    handleFileUpload,
    isUploading: enhancedUpload.isUploading,
    uploadProgress: enhancedUpload.uploadProgress
  };
};
