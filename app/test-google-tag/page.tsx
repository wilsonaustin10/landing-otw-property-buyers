'use client';

import { useState, useEffect } from 'react';

export default function TestGoogleTag() {
  const [gtagStatus, setGtagStatus] = useState<string>('Checking...');
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    // Check gtag status
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.dataLayer) {
        setGtagStatus('✅ Google Tag is loaded and ready');
        clearInterval(checkInterval);
      }
    }, 100);

    // Stop checking after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (gtagStatus === 'Checking...') {
        setGtagStatus('❌ Google Tag not detected');
      }
    }, 5000);
  }, [gtagStatus]);

  const sendTestEvent = (eventName: string, parameters: any) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, parameters);
      const eventLog = `${new Date().toLocaleTimeString()} - Sent: ${eventName} ${JSON.stringify(parameters)}`;
      setEvents(prev => [...prev, eventLog]);
    } else {
      setEvents(prev => [...prev, `${new Date().toLocaleTimeString()} - Error: gtag not available`]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Google Tag Test Page</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <p className="text-lg">{gtagStatus}</p>
        
        <div className="mt-4">
          <h3 className="font-semibold">Configured Tags:</h3>
          <ul className="list-disc pl-5 mt-2">
            <li>Google Ads: AW-17359126152</li>
            <li>Google Ads: AW-17041108639</li>
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
              <li>Google Analytics: {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Events</h2>
        <div className="space-y-3">
          <button
            onClick={() => sendTestEvent('page_view_test', { page_title: 'Test Page', page_location: window.location.href })}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Send Page View Event
          </button>
          
          <button
            onClick={() => sendTestEvent('form_start', { form_name: 'test_form', form_step: 1 })}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors ml-2"
          >
            Send Form Start Event
          </button>
          
          <button
            onClick={() => sendTestEvent('conversion', { 
              send_to: 'AW-17359126152/test-conversion',
              value: 1.0,
              currency: 'USD'
            })}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors ml-2"
          >
            Send Test Conversion
          </button>
          
          <button
            onClick={() => {
              if (window.dataLayer) {
                const currentData = JSON.stringify(window.dataLayer, null, 2);
                console.log('DataLayer contents:', currentData);
                alert('DataLayer contents logged to console');
              }
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors ml-2"
          >
            Log DataLayer to Console
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Event Log</h2>
        <div className="bg-gray-50 p-4 rounded h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500">No events sent yet. Click the buttons above to test.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((event, index) => (
                <li key={index} className="text-sm font-mono">{event}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">How to Verify in Google Services</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Google Tag Assistant:</strong> Install the Chrome extension and check if tags show as "Working"
          </li>
          <li>
            <strong>Network Tab:</strong> Open DevTools → Network → Filter by "collect" or "gtag" → You should see requests being sent
          </li>
          <li>
            <strong>Google Ads:</strong> Check Tools & Settings → Measurement → Conversions → Tag status should be "Active"
          </li>
          <li>
            <strong>Real-time Reports:</strong> If GA4 is configured, check Google Analytics → Real-time to see your events
          </li>
        </ol>
      </div>
    </div>
  );
}