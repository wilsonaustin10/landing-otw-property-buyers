'use client';

import { useState, useEffect } from 'react';
import AddressInput from '../../components/AddressInput';
import GooglePlacesDebugger from '../../components/GooglePlacesDebugger';
import GooglePlacesMonitor from '../../components/GooglePlacesMonitor';
import type { AddressData } from '../../types/GooglePlacesTypes';
import { googlePlacesMonitor } from '../../utils/googlePlacesMonitor';

export default function TestPlacesAPI() {
  const [apiCalls, setApiCalls] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  useEffect(() => {
    // Monitor network requests to Google Places API
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const url = args[0]?.toString() || '';
        if (url.includes('maps.googleapis.com')) {
          const timestamp = new Date().toLocaleTimeString();
          setApiCalls(prev => [...prev, `${timestamp} - API Call: ${url.substring(0, 80)}...`]);
        }
        return originalFetch(...args);
      };

      return () => {
        window.fetch = originalFetch;
      };
    }
  }, []);

  const handleAddressSelect = (addressData: AddressData) => {
    console.log('Address selected:', addressData);
    setSelectedAddress(addressData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Google Places API Test</h1>
      
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Address Input Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          Monitor API calls below. The autocomplete should initialize only once.
        </p>
        
        <AddressInput 
          onAddressSelect={handleAddressSelect}
          className="mb-4"
        />
        
        {selectedAddress && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">Selected Address:</h3>
            <pre className="text-sm">{JSON.stringify(selectedAddress, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">API Call Monitor</h2>
        <div className="bg-gray-50 p-4 rounded h-64 overflow-y-auto">
          {apiCalls.length === 0 ? (
            <p className="text-gray-500">No API calls detected yet. Start typing in the address field.</p>
          ) : (
            <ul className="space-y-1">
              {apiCalls.map((call, index) => (
                <li key={index} className="text-sm font-mono text-gray-700">{call}</li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Note: This monitors fetch requests. Autocomplete uses JSONP which may not appear here.
        </p>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">What to Look For</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>The console should show "Initializing Google Places Autocomplete" only once</li>
          <li>No repeated initialization messages when typing or interacting with the page</li>
          <li>Address suggestions should appear normally when typing</li>
          <li>Check browser DevTools Network tab for excessive API calls</li>
          <li>Use the API Monitor (bottom right) to track all API interactions</li>
          <li>Autocomplete is disabled for inputs shorter than 3 characters</li>
        </ul>
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Optimization Features Implemented</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>✅ Built-in Google SDK debouncing (no custom debounce needed)</li>
          <li>✅ Minimum 3 characters before enabling autocomplete</li>
          <li>✅ Session tokens for billing optimization</li>
          <li>✅ Single initialization check prevents duplicate instances</li>
          <li>✅ Comprehensive API call monitoring and logging</li>
          <li>✅ Input event filtering for short inputs</li>
        </ul>
      </div>

      {/* Debug Components */}
      <GooglePlacesDebugger />
      <GooglePlacesMonitor />
    </div>
  );
}