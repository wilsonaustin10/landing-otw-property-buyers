'use client';

import { useCallback, useState, useEffect } from 'react';
import { lazyLoadGoogleMaps } from '../utils/lazyLoadScripts';

export const useGoogleMapsLazy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
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
    if (isLoaded) return true;
    
    const success = await loadGoogleMaps();
    if (!success) return false;

    return new Promise((resolve) => {
      if (window.google?.maps) {
        resolve(true);
      } else {
        const checkInterval = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 10000);
      }
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