'use client';

import { useCallback, useState, useEffect } from 'react';
import { lazyLoadRecaptcha } from '../utils/lazyLoadScripts';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

export const useRecaptcha = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRecaptcha = useCallback(async () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    try {
      await lazyLoadRecaptcha();
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load reCAPTCHA:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return null;
    }

    if (!isLoaded) {
      await loadRecaptcha();
    }

    if (typeof window === 'undefined' || !window.grecaptcha?.enterprise) {
      console.warn('reCAPTCHA Enterprise not loaded');
      return null;
    }

    return new Promise((resolve) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
          resolve(token);
        } catch (error) {
          console.error('Error executing reCAPTCHA:', error);
          resolve(null);
        }
      });
    });
  }, [isLoaded, loadRecaptcha]);

  return { executeRecaptcha, loadRecaptcha, isLoading, isLoaded };
};