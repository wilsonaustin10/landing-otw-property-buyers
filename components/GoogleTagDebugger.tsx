'use client';

import { useEffect, useState } from 'react';

interface DataLayerEvent {
  event?: string;
  [key: string]: any;
}

export default function GoogleTagDebugger() {
  const [isGtagLoaded, setIsGtagLoaded] = useState(false);
  const [dataLayerEvents, setDataLayerEvents] = useState<DataLayerEvent[]>([]);
  const [showDebugger, setShowDebugger] = useState(false);

  useEffect(() => {
    // Check if gtag is loaded
    const checkGtag = setInterval(() => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.dataLayer) {
        setIsGtagLoaded(true);
        clearInterval(checkGtag);
        
        // Monitor dataLayer events
        const originalPush = window.dataLayer.push;
        window.dataLayer.push = function(...args: any[]) {
          setDataLayerEvents(prev => [...prev, ...args].slice(-10)); // Keep last 10 events
          return originalPush.apply(window.dataLayer, args);
        };
      }
    }, 100);

    // Clean up after 5 seconds if gtag doesn't load
    setTimeout(() => clearInterval(checkGtag), 5000);

    return () => clearInterval(checkGtag);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowDebugger(!showDebugger)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        {showDebugger ? 'Hide' : 'Show'} Tag Debug
      </button>

      {showDebugger && (
        <div className="fixed bottom-20 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md w-96 max-h-96 overflow-auto z-50">
          <h3 className="font-bold text-lg mb-2">Google Tag Debugger</h3>
          
          <div className="mb-4">
            <p className="font-semibold">Status:</p>
            <p className={`text-sm ${isGtagLoaded ? 'text-green-600' : 'text-red-600'}`}>
              {isGtagLoaded ? '✓ Google Tag Loaded' : '✗ Google Tag Not Detected'}
            </p>
            {isGtagLoaded && (
              <p className="text-xs text-gray-600 mt-1">
                window.gtag and window.dataLayer are available
              </p>
            )}
          </div>

          <div className="mb-4">
            <p className="font-semibold">Configured Tags:</p>
            <ul className="text-sm text-gray-700">
              <li>• AW-17359126152 (Google Ads)</li>
              <li>• AW-17041108639 (Google Ads)</li>
              {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                <li>• {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} (GA4)</li>
              )}
            </ul>
          </div>

          {dataLayerEvents.length > 0 && (
            <div>
              <p className="font-semibold">Recent Events:</p>
              <div className="text-xs bg-gray-100 p-2 rounded mt-1 max-h-40 overflow-y-auto">
                {dataLayerEvents.map((event, index) => (
                  <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(event, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                  window.gtag('event', 'test_event', {
                    event_category: 'Debug',
                    event_label: 'Manual Test'
                  });
                  alert('Test event sent! Check the Recent Events section.');
                }
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Send Test Event
            </button>
          </div>
        </div>
      )}
    </>
  );
}