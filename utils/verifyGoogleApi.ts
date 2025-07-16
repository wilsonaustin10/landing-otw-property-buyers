// Cache the verification result to avoid repeated console logs
let cachedApiKeyValid: boolean | null = null;

export const verifyGoogleApiKey = () => {
  // Return cached result if available
  if (cachedApiKeyValid !== null) {
    return cachedApiKeyValid;
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing. Please check your .env.local file');
      cachedApiKeyValid = false;
      return false;
    }

    if (apiKey === 'your_api_key_here' || apiKey === '') {
      console.error('Please replace the placeholder API key with your actual key in .env.local');
      cachedApiKeyValid = false;
      return false;
    }

    if (!apiKey.startsWith('AIza')) {
      console.error('Invalid Google Maps API key format. Key should start with "AIza"');
      cachedApiKeyValid = false;
      return false;
    }

    // Only log once on successful verification
    console.log('Google Maps API key verification successful');
    cachedApiKeyValid = true;
    return true;
  } catch (error) {
    console.error('Error during API key verification:', error);
    cachedApiKeyValid = false;
    return false;
  }
};

// Cache the loaded state to avoid repeated checks
let lastLoadedCheck: { timestamp: number; result: boolean } | null = null;
const CACHE_DURATION_MS = 1000; // Cache for 1 second

// Optional: Add a function to verify if the API is loaded
export const isGoogleMapsLoaded = () => {
  const now = Date.now();
  
  // Return cached result if still valid
  if (lastLoadedCheck && (now - lastLoadedCheck.timestamp) < CACHE_DURATION_MS) {
    return lastLoadedCheck.result;
  }
  
  const result = typeof window !== 'undefined' && 
         window.google && 
         window.google.maps && 
         window.google.maps.places;
         
  lastLoadedCheck = { timestamp: now, result: !!result };
  return result;
};