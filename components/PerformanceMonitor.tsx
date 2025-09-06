'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;
    
    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
        });
      }
      
      // Log critical metrics
      if (['FCP', 'LCP', 'CLS', 'FID', 'TTFB'].includes(metric.name)) {
        console.log(`${metric.name}: ${metric.value}`);
      }
    };
    
    // Observe performance metrics
    if ('PerformanceObserver' in window) {
      try {
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          reportWebVitals({
            name: 'LCP',
            value: lastEntry.startTime,
            id: 'v3-' + Date.now(),
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // FID
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            reportWebVitals({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              id: 'v3-' + Date.now(),
            });
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        // CLS
        let clsValue = 0;
        let clsEntries: any[] = [];
        
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = clsEntries[0];
              const lastSessionEntry = clsEntries[clsEntries.length - 1];
              
              if (entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                clsValue += entry.value;
                clsEntries.push(entry);
              } else {
                clsValue = entry.value;
                clsEntries = [entry];
              }
            }
          });
          
          reportWebVitals({
            name: 'CLS',
            value: clsValue,
            id: 'v3-' + Date.now(),
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
      } catch (e) {
        console.error('Error setting up performance monitoring:', e);
      }
    }
    
    // Report load time
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        // TTFB
        reportWebVitals({
          name: 'TTFB',
          value: navigationEntry.responseStart - navigationEntry.requestStart,
          id: 'v3-' + Date.now(),
        });
        
        // Page Load Time
        reportWebVitals({
          name: 'Load',
          value: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
          id: 'v3-' + Date.now(),
        });
      }
    });
    
  }, []);
  
  return null;
}