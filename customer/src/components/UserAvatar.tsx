import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiCamera, FiEye } from 'react-icons/fi';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: number;
  onChangeAvatar?: (file: File) => void;
  className?: string;
}

// Get the API URL from environment variable or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  size = 96, // Default size in pixels
  onChangeAvatar,
  className = '',
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [viewImage, setViewImage] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now()); // Add timestamp for cache busting
  const optionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to get the full image URL with cache busting
  const getImageUrl = (src?: string) => {
    if (!src) return '';
    
    // Add timestamp for cache busting
    const cacheBuster = `?t=${timestamp}`;
    
    // If it's already an absolute URL, use it as is
    if (src.startsWith('http')) return `${src}${cacheBuster}`;
    
    // If it's a server path starting with /uploads, prepend the API URL
    if (src.startsWith('/uploads')) return `${API_URL}${src}${cacheBuster}`;
    
    // Otherwise, return as is with cache buster
    return `${src}${cacheBuster}`;
  };
  
  // Update timestamp when avatar changes to force reload
  useEffect(() => {
    setTimestamp(Date.now());
  }, [avatar]);
  
  // Generate initials from name
  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Generate a color based on name
  const getColor = () => {
    if (!name) return '#6366F1'; // Default indigo color
    
    // List of pastel/soft colors
    const colors = [
      '#F87171', // Red
      '#FB923C', // Orange
      '#FBBF24', // Amber
      '#A3E635', // Lime
      '#34D399', // Emerald
      '#22D3EE', // Cyan
      '#60A5FA', // Blue
      '#818CF8', // Indigo
      '#A78BFA', // Violet
      '#E879F9', // Fuchsia
      '#F472B6', // Pink
    ];
    
    // Use the sum of the character codes to generate a consistent index
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChangeAvatar) {
      onChangeAvatar(file);
      setShowOptions(false);
      // Update timestamp to ensure image reload
      setTimestamp(Date.now());
    }
  };
  
  // Handle outside click to close options menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    
    if (showOptions) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showOptions]);
  
  return (
    <div className={`relative ${className}`}>
      {/* Avatar display */}
      <div 
        className="relative cursor-pointer rounded-full overflow-hidden"
        style={{ width: size, height: size }}
        onClick={() => setShowOptions(true)}
      >
        {avatar ? (
          <Image
            src={getImageUrl(avatar)}
            alt={name || 'User'}
            fill
            className="object-cover"
            priority
            unoptimized={true} // Disable Next.js image optimization to prevent caching
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: getColor(), fontSize: size * 0.4 }}
          >
            {getInitials()}
          </div>
        )}
      </div>
      
      {/* Options popup */}
      {showOptions && (
        <div 
          ref={optionsRef}
          className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg py-2 w-48"
          style={{ top: size, left: '50%', transform: 'translateX(-50%)' }}
        >
          <button
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100"
            onClick={() => {
              setViewImage(true);
              setShowOptions(false);
            }}
          >
            <FiEye className="mr-2" />
            Xem ảnh đại diện
          </button>
          <button
            className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiCamera className="mr-2" />
            Đổi ảnh đại diện
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      )}
      
      {/* Fullscreen image view */}
      {viewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setViewImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            {avatar ? (
              <Image
                src={getImageUrl(avatar)}
                alt={name || 'User'}
                width={800}
                height={800}
                className="object-contain"
                unoptimized={true} // Disable Next.js image optimization to prevent caching
              />
            ) : (
              <div 
                className="w-96 h-96 flex items-center justify-center text-white font-bold rounded-full"
                style={{ backgroundColor: getColor(), fontSize: 120 }}
              >
                {getInitials()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar; 