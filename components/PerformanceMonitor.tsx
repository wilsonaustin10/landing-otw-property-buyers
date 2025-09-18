'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Log Core Web Vitals
      const logWebVitals = () => {
        const paintEntries = performance.getEntriesByType('paint');
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint').pop() as any;
        
        if (navigationEntries.length > 0) {
          const nav = navigationEntries[0];
          console.group('🚀 Performance Metrics');
          console.log('DNS Lookup:', nav.domainLookupEnd - nav.domainLookupStart, 'ms');
          console.log('TCP Connection:', nav.connectEnd - nav.connectStart, 'ms');
          console.log('Request Time:', nav.responseStart - nav.requestStart, 'ms');
          console.log('Response Time:', nav.responseEnd - nav.responseStart, 'ms');
          console.log('DOM Processing:', nav.domComplete - nav.domInteractive, 'ms');
          console.log('Page Load Time:', nav.loadEventEnd - nav.fetchStart, 'ms');
          console.groupEnd();
        }

        if (fcp) {
          console.log('📊 First Contentful Paint (FCP):', fcp.startTime.toFixed(2), 'ms');
        }

        if (lcp) {
          console.log('📊 Largest Contentful Paint (LCP):', lcp.startTime.toFixed(2), 'ms');
        }

        // Log total JS size loaded
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsResources = resources.filter(r => r.name.includes('.js') || r.name.includes('recaptcha') || r.name.includes('maps') || r.name.includes('gtag'));
        
        const totalJSSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
        console.log('📦 Total JavaScript Loaded:', (totalJSSize / 1024).toFixed(2), 'KB');
        
        // Log individual script sizes
        console.group('📜 Script Details');
        jsResources.forEach(r => {
          const name = r.name.split('/').pop() || r.name;
          const size = r.transferSize || 0;
          const loadTime = r.responseEnd - r.startTime;
          console.log(`${name}: ${(size / 1024).toFixed(2)} KB, loaded in ${loadTime.toFixed(2)} ms`);
        });
        console.groupEnd();
      };

      // Wait for page to fully load before logging
      if (document.readyState === 'complete') {
        setTimeout(logWebVitals, 1000);
      } else {
        window.addEventListener('load', () => setTimeout(logWebVitals, 1000));
      }

      // Observe Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          console.log('📊 Cumulative Layout Shift (CLS):', clsValue.toFixed(3));
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // CLS observer not supported
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const fid = entries[0] as any;
            console.log('📊 First Input Delay (FID):', fid.processingStart - fid.startTime, 'ms');
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // FID observer not supported
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
        const reportWebVital = (metric: { name: string; value: number }) => {
          (window as any).gtag('event', metric.name, {
            value: Math.round(metric.value),
            metric_value: metric.value,
          });
        };

        // Report core web vitals when available
        if (lcp) {
          reportWebVital({ name: 'LCP', value: lcp.startTime });
        }
        if (fcp) {
          reportWebVital({ name: 'FCP', value: fcp.startTime });
        }
      }
    }
  }, []);

  return null;
}