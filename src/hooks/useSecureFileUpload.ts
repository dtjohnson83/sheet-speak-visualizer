
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
    console.log('handleFileUpload called with file:', file.name, file.type, file.size);
    console.log('User authenticated:', !!user);
    
    if (!user) {
      const error = 'Authentication required';
      console.log('Upload failed: Not authenticated');
      onError?.(error);
      toast.error(error);
      return;
    }

    // Rate limiting check
    console.log('Checking rate limit for user:', user.id);
    if (!checkRateLimit(user.id, 5, 60000)) { // 5 uploads per minute
      const error = 'Too many upload attempts. Please wait before trying again.';
      console.log('Upload failed: Rate limit exceeded');
      onError?.(error);
      toast.error(error);
      return;
    }

    setIsUploading(true);

    try {
      // Validate file
      console.log('Validating file...');
      const validation = validateFile(file);
      console.log('File validation result:', validation);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Additional security: Check file content
      console.log('Checking file content...');
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      console.log('File signature:', uint8Array.slice(0, 4));
      
      // Basic check for Excel/CSV file signatures
      const isValidExcel = 
        (uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) || // ZIP signature (xlsx)
        (uint8Array[0] === 0xD0 && uint8Array[1] === 0xCF) || // OLE signature (xls)
        (uint8Array[0] >= 0x20 && uint8Array[0] <= 0x7E); // Text files (csv)

      console.log('File content validation passed:', isValidExcel);
      
      if (!isValidExcel) {
        throw new Error('File appears to be corrupted or invalid');
      }

      console.log('File validation passed, calling onSuccess');
      onSuccess(file);
      toast.success('File uploaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.log('Upload failed with error:', errorMessage, error);
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
