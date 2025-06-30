
import { useState } from 'react';
import { validateFile, checkRateLimit } from '@/lib/security';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseSecureFileUploadProps {
  onSuccess: (file: File) => void;
  onError?: (error: string) => void;
}

export const useSecureFileUpload = ({ onSuccess, onError }: UseSecureFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileUpload = async (file: File) => {
    if (!user) {
      const error = 'Authentication required';
      onError?.(error);
      toast.error(error);
      return;
    }

    // Rate limiting check
    if (!checkRateLimit(user.id, 5, 60000)) { // 5 uploads per minute
      const error = 'Too many upload attempts. Please wait before trying again.';
      onError?.(error);
      toast.error(error);
      return;
    }

    setIsUploading(true);

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Additional security: Check file content
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Basic check for Excel/CSV file signatures
      const isValidExcel = 
        (uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) || // ZIP signature (xlsx)
        (uint8Array[0] === 0xD0 && uint8Array[1] === 0xCF) || // OLE signature (xls)
        (uint8Array[0] >= 0x20 && uint8Array[0] <= 0x7E); // Text files (csv)

      if (!isValidExcel) {
        throw new Error('File appears to be corrupted or invalid');
      }

      onSuccess(file);
      toast.success('File uploaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading
  };
};
