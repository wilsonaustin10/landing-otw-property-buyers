'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { lazyLoadGoogleTagManager } from '../utils/lazyLoadScripts';

export default function GoogleTagManagerOptimized() {
  const pathname = usePathname();

  useEffect(() => {
    // Load GTM after a small delay to prioritize critical content
    const timer = setTimeout(() => {
      lazyLoadGoogleTagManager().catch(console.error);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}