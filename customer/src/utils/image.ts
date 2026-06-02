export const getFullImageUrl = (imagePath: string): string => {
  // Debug info
  console.log('Original image path:', imagePath);
  
  // Check for empty or undefined paths
  if (!imagePath) {
    console.log('Image path is empty, using placeholder');
    return '/images/product-placeholder.svg';
  }
  
  // If the image URL is already absolute, return it as is
  if (imagePath.startsWith('http')) {
    console.log('Image path is already absolute');
    return imagePath;
  }
  
  // For server-side paths that start with /uploads
  if (imagePath.startsWith('/uploads')) {
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const fullUrl = `${serverUrl}${imagePath}`;
    console.log('Server image path, resolved to:', fullUrl);
    return fullUrl;
  }
  
  // Hardcode the base URL for testing if environment variable is not set
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  console.log('Using base URL:', baseUrl);
  
  // Remove trailing slash from base URL if it exists
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Add leading slash to image path if it doesn't exist
  const cleanImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Combine base URL and image path
  const fullUrl = `${cleanBaseUrl}${cleanImagePath}`;
  console.log('Resolved full URL:', fullUrl);
  
  return fullUrl;
}; 