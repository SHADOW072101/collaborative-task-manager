import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

interface AvatarUploadProps {
  currentAvatar?: File;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export const AvatarUpload = ({  
  onUpload, 
  isUploading = false 
}: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      try {
        await onUpload(file);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Current Avatar */}
        <div className="relative">
          {/* <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl font-bold text-blue-600">
                {currentAvatar ? '' : '👤'}
              </div>
            )}
          </div> */}
          
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Preview and Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-500">
              Upload a new profile picture. Max size: 5MB
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          
          {preview && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Preview</p>
                  <p className="text-xs text-gray-500">
                    Click upload to save this image
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleUpload}
                  loading={isUploading}
                  size="sm"
                >
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  size="sm"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};