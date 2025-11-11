'use client';

import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userAPI } from '@/lib/api/user';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';

export default function ProfileImageUpload() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setIsUploading(true);

    try {
      const response = await userAPI.uploadProfileImage(file);

      if (response.success) {
        toast.success('Profile image updated successfully!');
        
        // Update user in Redux store
        dispatch({
          type: 'auth/loginUser/fulfilled',
          payload: {
            user: {
              ...user,
              profileImage: response.data.data.imageUrl,
            },
            isAuthenticated: true,
          },
        });

        setPreviewUrl(null);
      } else {
        toast.error(response.error || 'Failed to upload image');
        setPreviewUrl(null);
      }
    } catch (error) {
      toast.error('An error occurred while uploading image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.profileImage) return;

    setIsDeleting(true);

    try {
      const response = await userAPI.deleteProfileImage();

      if (response.success) {
        toast.success('Profile image deleted successfully!');
        
        // Update user in Redux store
        dispatch({
          type: 'auth/loginUser/fulfilled',
          payload: {
            user: {
              ...user,
              profileImage: null,
            },
            isAuthenticated: true,
          },
        });
      } else {
        toast.error(response.error || 'Failed to delete image');
      }
    } catch (error) {
      toast.error('An error occurred while deleting image');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage 
            src={previewUrl || user?.profileImage} 
            alt={user?.name || 'User'} 
          />
          <AvatarFallback className="text-2xl bg-blue-600 text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-1 space-y-4">
        <div>
          <h3 className="font-medium text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500 mt-1">
            JPG, PNG or WEBP. Max size 5MB.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>

          {user?.profileImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
