// Utility to get full image URL from relative paths

/**
 * Gets the full image URL for a given path
 * @param {string} imagePath - The image path or URL
 * @returns {string} - The full image URL
 */
export const getFullImageUrl = (imagePath) => {
  // If no image path is provided, return a placeholder
  if (!imagePath) return '/images/product-placeholder.svg';
  
  // If it's already an absolute URL, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Get the base URL from environment or use fallback
  // Try multiple potential base URLs to improve reliability
  let baseUrl;
  if (typeof window !== 'undefined') {
    // When running in browser, dynamically determine the server
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    
    // Try same host but different ports that might be running the API server
    if (host === 'localhost' || host === '127.0.0.1') {
      // Use port 5001 as that's our API port according to API_URL
      baseUrl = `${protocol}//${host}:5001`;
      console.log('Using localhost baseUrl:', baseUrl);
    } else {
      // For production, use the environment variable or same origin
      baseUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${host}`;
      console.log('Using production baseUrl:', baseUrl);
    }
  } else {
    // Server-side rendering - use configured URL
    baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    console.log('Using SSR baseUrl:', baseUrl);
  }
  
  // Handle API proxy paths when using same origin proxy
  let finalUrl;
  if (imagePath.startsWith('/uploads/')) {
    // For upload paths, prepend the baseUrl instead of using as is
    finalUrl = `${baseUrl}${imagePath}`;
    console.log('Upload path resolved to:', finalUrl);
  } else {
    // Ensure no double slashes in the URL
    finalUrl = imagePath.startsWith('/') 
      ? `${baseUrl}${imagePath}`
      : `${baseUrl}/${imagePath}`;
    console.log('Regular path resolved to:', finalUrl);
  }
  
  console.log('Image URL generated:', finalUrl);
  return finalUrl;
}; 