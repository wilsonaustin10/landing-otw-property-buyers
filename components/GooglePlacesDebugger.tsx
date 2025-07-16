'use client';

import { useEffect, useState } from 'react';
import { verifyGoogleApiKey, isGoogleMapsLoaded } from '../utils/verifyGoogleApi';

interface ApiStatus {
  apiKeyValid: boolean;
  mapsLoaded: boolean;
  placesLoaded: boolean;
  errorMessages: string[];
  loadTime: number | null;
}

export default function GooglePlacesDebugger() {
  const [status, setStatus] = useState<ApiStatus>({
    apiKeyValid: false,
    mapsLoaded: false,
    placesLoaded: false,
    errorMessages: [],
    loadTime: null
  });
  const [showDebugger, setShowDebugger] = useState(false);
  const startTime = Date.now();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let hasLoaded = false;

    const checkStatus = () => {
      // Only check if not already loaded
      if (hasLoaded) return true;

      const newStatus: ApiStatus = {
        apiKeyValid: verifyGoogleApiKey(),
        mapsLoaded: typeof window !== 'undefined' && !!window.google?.maps,
        placesLoaded: !!isGoogleMapsLoaded(),
        errorMessages: [],
        loadTime: null
      };

      // Check for specific issues
      if (!newStatus.apiKeyValid) {
        newStatus.errorMessages.push('Google Maps API key is invalid or missing');
      }

      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        newStatus.errorMessages.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable not found');
      }

      if (newStatus.mapsLoaded && !newStatus.placesLoaded) {
        newStatus.errorMessages.push('Google Maps loaded but Places library not available');
      }

      if (newStatus.placesLoaded) {
        newStatus.loadTime = Date.now() - startTime;
        hasLoaded = true;
      }

      setStatus(newStatus);

      // Stop checking after Places is loaded or after 10 seconds
      if (newStatus.placesLoaded || Date.now() - startTime > 10000) {
        return true;
      }
      return false;
    };

    // Initial check
    checkStatus();

    // Only set interval if not already loaded
    if (!hasLoaded) {
      interval = setInterval(() => {
        if (checkStatus()) {
          clearInterval(interval);
        }
      }, 500); // Increased interval to reduce checks
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowDebugger(!showDebugger)}
        className="fixed bottom-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50"
      >
        {showDebugger ? 'Hide' : 'Show'} Places Debug
      </button>

      {showDebugger && (
        <div className="fixed bottom-20 left-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md w-96 max-h-96 overflow-auto z-50">
          <h3 className="font-bold text-lg mb-2">Google Places API Debugger</h3>
          
          <div className="space-y-3">
            <div>
              <p className="font-semibold">API Key Status:</p>
              <p className={`text-sm ${status.apiKeyValid ? 'text-green-600' : 'text-red-600'}`}>
                {status.apiKeyValid ? '✓ Valid API Key' : '✗ Invalid or Missing API Key'}
              </p>
            </div>

            <div>
              <p className="font-semibold">Google Maps Status:</p>
              <p className={`text-sm ${status.mapsLoaded ? 'text-green-600' : 'text-red-600'}`}>
                {status.mapsLoaded ? '✓ Google Maps Loaded' : '✗ Google Maps Not Loaded'}
              </p>
            </div>

            <div>
              <p className="font-semibold">Places Library Status:</p>
              <p className={`text-sm ${status.placesLoaded ? 'text-green-600' : 'text-red-600'}`}>
                {status.placesLoaded ? '✓ Places Library Loaded' : '✗ Places Library Not Loaded'}
              </p>
            </div>

            {status.loadTime && (
              <div>
                <p className="font-semibold">Load Time:</p>
                <p className="text-sm text-gray-600">{status.loadTime}ms</p>
              </div>
            )}

            {status.errorMessages.length > 0 && (
              <div>
                <p className="font-semibold text-red-600">Errors:</p>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {status.errorMessages.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600">
                API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 
                  `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 8)}...` : 
                  'Not Set'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Script Load Strategy: beforeInteractive
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  console.log('Google Maps Debug Info:', {
                    google: typeof window !== 'undefined' ? window.google : undefined,
                    maps: typeof window !== 'undefined' ? window.google?.maps : undefined,
                    places: typeof window !== 'undefined' ? window.google?.maps?.places : undefined,
                    env: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  });
                  alert('Debug info logged to console');
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Log Debug Info
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}