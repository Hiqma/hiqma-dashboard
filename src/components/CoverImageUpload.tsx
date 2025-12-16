'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface CoverImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function CoverImageUpload({ currentImageUrl, onImageChange, className }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE}/upload/cover-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewUrl(data.url);
        onImageChange(data.url);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
  };

  return (
    <div className={className}>
      <div className="flex justify-center">
        <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-lg relative" style={{ aspectRatio: '3/4' }}>
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md z-10"
                title="Remove image"
              >
                <X size={16} />
              </button>
              <div
                onClick={handleFileSelect}
                className="absolute inset-0 cursor-pointer bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center"
              >
                <span className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-800 opacity-0 hover:opacity-100 transition-opacity">
                  Change Image
                </span>
              </div>
            </>
          ) : (
            <div
              onClick={handleFileSelect}
              className="flex flex-col items-center justify-center h-full p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <span className="text-sm font-medium text-gray-900">Uploading...</span>
                </div>
              ) : (
                <>
                  <ImageIcon size={32} className="text-gray-400 mb-3" />
                  <span className="block text-sm font-medium text-gray-900 mb-1">
                    Upload Cover
                  </span>
                  <span className="block text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}