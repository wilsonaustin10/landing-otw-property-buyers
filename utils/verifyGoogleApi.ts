export const verifyGoogleApiKey = () => {
  try {
    // Log all environment variables (be careful with sensitive data)
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasGoogleKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      keyPrefix: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 4)
    });

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing. Please check your .env.local file');
      return false;
    }

    if (apiKey === 'your_api_key_here' || apiKey === '') {
      console.error('Please replace the placeholder API key with your actual key in .env.local');
      return false;
    }

    if (!apiKey.startsWith('AIza')) {
      console.error('Invalid Google Maps API key format. Key should start with "AIza"');
      return false;
    }

    console.log('Google Maps API key verification successful');
    return true;
  } catch (error) {
    console.error('Error during API key verification:', error);
    return false;
  }
};

// Optional: Add a function to verify if the API is loaded
export const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && 
         window.google && 
         window.google.maps && 
         window.google.maps.places;
};