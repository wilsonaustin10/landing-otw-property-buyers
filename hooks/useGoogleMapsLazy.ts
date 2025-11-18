'use client';

import { useCallback, useState, useEffect } from 'react';
import { lazyLoadGoogleMaps } from '../utils/lazyLoadScripts';

export const useGoogleMapsLazy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      setIsLoaded(true);
    }
  }, []);

  const loadGoogleMaps = useCallback(async () => {
    if (isLoaded || isLoading) return true;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await lazyLoadGoogleMaps();
      setIsLoaded(true);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load Google Maps';
      console.error('Failed to load Google Maps:', errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  const waitForGoogleMaps = useCallback(async (): Promise<boolean> => {
    // Check if Places library is already available
    if (isLoaded && window.google?.maps?.places) {
      return true;
    }
    
    // Try to load if not already loaded
    const success = await loadGoogleMaps();
    if (!success) return false;

    // Since lazyLoadGoogleMaps now waits for Places library, we can check immediately
    // But add a fallback check just in case
    if (window.google?.maps?.places) {
      return true;
    }

    // Fallback: poll for Places library (shouldn't be needed if lazyLoadGoogleMaps works correctly)
    return new Promise((resolve) => {
      let isResolved = false;
      let timeoutId: NodeJS.Timeout | null = null;
      
      const checkPlaces = () => {
        if (isResolved) return;
        
        if (window.google?.maps?.places) {
          isResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          setIsLoaded(true);
          resolve(true);
        }
      };

      // Check immediately first
      checkPlaces();
      
      // If not ready, poll every 50ms
      const checkInterval = setInterval(() => {
        checkPlaces();
      }, 50);

      // Timeout after 10 seconds
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          clearInterval(checkInterval);
          console.error('Google Maps Places library not available after waiting');
          resolve(false);
        }
      }, 10000);
    });
  }, [isLoaded, loadGoogleMaps]);

  return {
    loadGoogleMaps,
    waitForGoogleMaps,
    isLoading,
    isLoaded,
    error
  };
};