import { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { api } from '../lib/api';
import type { UserProfile } from '../types';

interface ProfileCardProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

export default function ProfileCard({ profile, onProfileUpdate }: ProfileCardProps) {
  const [uploading, setUploading] = useState(false);
  const [compensation, setCompensation] = useState<number | ''>(profile?.defaultCompensation ?? '');
  const [compensationError, setCompensationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCompensation(profile?.defaultCompensation ?? '');
    setCompensationError('');
  }, [profile]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
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
      formData.append('photo', file);
      const result = await api.upload('/upload', formData);
      
      if (result.photoURL) {
        const updatedProfile = {
          ...profile,
          photoURL: result.photoURL,
        } as UserProfile;
        
        // Save the updated profile to the backend
        if (profile?.uid) {
          await api.put(`/users/${profile.uid}`, { photoURL: result.photoURL });
        }
        
        onProfileUpdate(updatedProfile);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateCompensation = (value: number | '') => {
    if (value === '') return 'Enter a compensation amount';
    if (value <= 200) return 'Compensation must be greater than 200';
    if (value >= 1000) return 'Compensation must be less than 1000';
    return '';
  };

  const handleCompensationChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setCompensation('');
      setCompensationError('Enter a numeric value');
      return;
    }
    setCompensation(parsed);
    setCompensationError(validateCompensation(parsed));
  };

  const saveCompensation = async () => {
    if (!profile?.uid) return;
    const error = validateCompensation(compensation);
    if (error) {
      setCompensationError(error);
      return;
    }

    try {
      await api.put(`/users/${profile.uid}`, { defaultCompensation: compensation });
      onProfileUpdate({ ...profile, defaultCompensation: compensation });
    } catch (err) {
      console.error('Failed to save compensation', err);
      alert('Unable to save compensation');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-6">
        {/* Photo Section */}
        <div className="flex-shrink-0">
          <button
            onClick={handlePhotoClick}
            disabled={uploading}
            className="relative group"
          >
            <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-red-600 hover:bg-red-50 transition">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL.replace('localhost', window.location.hostname)}
                  alt={profile?.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-red-600 transition" />
                  <span className="text-xs text-gray-500 mt-1 group-hover:text-red-600">Upload Photo</span>
                </div>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                <div className="text-white text-sm font-medium">Uploading...</div>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Profile Info Section */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{profile?.displayName || 'Your Name'}</h2>
          <p className="text-gray-600 mt-1">{profile?.city || 'City not set'}</p>
          <p className="text-sm text-gray-500 mt-3">{profile?.email}</p>
          <div className="mt-4 inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {profile?.role?.charAt(0).toUpperCase()}
            {profile?.role?.slice(1)}
          </div>

          {profile?.role === 'worker' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700">Default Compensation</label>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-gray-600">€</span>
                <input
                  type="number"
                  min={201}
                  max={999}
                  value={compensation === '' ? '' : compensation}
                  onChange={(e) => handleCompensationChange(e.target.value)}
                  className="w-32 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={saveCompensation}
                  disabled={!!validateCompensation(compensation)}
                  className="px-3 py-2 bg-red-600 text-white rounded disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Save
                </button>
              </div>
              {compensationError && (
                <p className="mt-2 text-xs text-red-600">{compensationError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
