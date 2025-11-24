'use client';

import { useEffect, useRef, useCallback } from 'react';
import { googlePlacesMonitor } from '../utils/googlePlacesMonitor';
import { lazyLoadGoogleMaps } from '../utils/lazyLoadScripts';

declare global {
  namespace google.maps.places {
    interface AutocompleteOptions {
      componentRestrictions?: ComponentRestrictions;
      fields?: string[];
      types?: string[];
      sessionToken?: google.maps.places.AutocompleteSessionToken;
    }
  }
}

export interface AddressData {
  formattedAddress: string;
  placeId?: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

// Cache to store recent address selections
const addressCache = new Map<string, AddressData>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CachedAddress {
  data: AddressData;
  timestamp: number;
}

export function useGooglePlaces(
  inputRef: React.RefObject<HTMLInputElement>,
  onAddressSelect: (addressData: AddressData) => void,
  enabled: boolean = true,
  minCharacters: number = 3 // Minimum characters before enabling autocomplete
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const apiCallCountRef = useRef<number>(0);
  const lastApiCallRef = useRef<Date | null>(null);

  // Memoize the callback to prevent unnecessary re-initializations
  const stableOnAddressSelect = useRef(onAddressSelect);
  stableOnAddressSelect.current = onAddressSelect;

  useEffect(() => {
    // Skip if disabled or already initialized
    if (!enabled || isInitializedRef.current) return;
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 100; // 10 seconds with 100ms intervals
    
    const initializeAutocomplete = async () => {
      // Check if component is still mounted
      if (!mounted) return;
      
      // Wait for input ref to be available
      if (!inputRef.current) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeAutocomplete, 100);
        } else {
          console.error('Input ref not available after waiting');
        }
        return;
      }

      // Wait for Google Maps Places library to be available
      if (!window.google?.maps?.places) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Waiting for Google Places API... (attempt ${retryCount}/${maxRetries})`);
          
          // Try to load Google Maps if not already loading
          try {
            await lazyLoadGoogleMaps();
          } catch (error) {
            console.error('Failed to load Google Maps:', error);
          }
          
          setTimeout(initializeAutocomplete, 100);
        } else {
          console.error('Google Places API failed to load after 10 seconds');
        }
        return;
      }

      // Verify Places Autocomplete class is available
      if (!window.google.maps.places.Autocomplete) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Waiting for Places Autocomplete class... (attempt ${retryCount}/${maxRetries})`);
          setTimeout(initializeAutocomplete, 100);
        } else {
          console.error('Places Autocomplete class not available after waiting');
        }
        return;
      }

      // Prevent re-initialization if autocomplete already exists
      if (autocompleteRef.current) {
        console.log('Google Places Autocomplete already initialized, skipping...');
        return;
      }

      try {
        console.log('Initializing Google Places Autocomplete');
        googlePlacesMonitor.logApiCall('autocomplete_init', { enabled, minCharacters });
        
        // Create a new session token
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

        // Initialize autocomplete with session token
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address', 'place_id'],
            types: ['address'],
            sessionToken: sessionTokenRef.current
          }
        );

        // Add place_changed listener with enhanced logging and caching
        const listener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place?.formatted_address) return;

          // Log API call for monitoring
          apiCallCountRef.current++;
          lastApiCallRef.current = new Date();
          googlePlacesMonitor.logApiCall('place_selected', {
            address: place.formatted_address,
            placeId: place.place_id,
            callNumber: apiCallCountRef.current
          });

          // Debug logging
          console.log('Google Places returned:', {
            formatted_address: place.formatted_address,
            place_id: place.place_id,
            address_components: place.address_components,
            types: place.types
          });

          const addressData: AddressData = {
            formattedAddress: place.formatted_address,
            placeId: place.place_id
          };

          // Parse address components
          place.address_components?.forEach(component => {
            console.log('Processing component:', {
              types: component.types,
              long_name: component.long_name,
              short_name: component.short_name
            });

            // Check all types, not just the first one
            const types = component.types;
            
            if (types.includes('street_number')) {
              addressData.streetNumber = component.long_name;
            } else if (types.includes('route')) {
              addressData.street = component.long_name;
            } else if (types.includes('locality')) {
              addressData.city = component.long_name;
            } else if (types.includes('sublocality') && !addressData.city) {
              // Fall back to sublocality if locality is not available
              addressData.city = component.long_name;
            } else if (types.includes('administrative_area_level_2') && !addressData.city) {
              // Sometimes county is used when city is not available
              addressData.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              addressData.state = component.short_name;
            } else if (types.includes('postal_code')) {
              addressData.postalCode = component.long_name;
            }
          });

          console.log('Parsed address data:', addressData);

          // Cache the result
          if (place.place_id) {
            addressCache.set(place.place_id, addressData);
            // Clean old cache entries
            cleanAddressCache();
          }

          // Use the stable reference to prevent dependency issues
          stableOnAddressSelect.current(addressData);
          
          // Create a new session token after selection
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        });

        // Monitor input for analytics (but let Google handle dropdown visibility)
        const handleInput = (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value.trim();
          
          // Log for monitoring but don't interfere with Google's native dropdown behavior
          if (value.length < minCharacters) {
            googlePlacesMonitor.logApiCall('input_too_short', { 
              inputLength: value.length, 
              minRequired: minCharacters 
            });
          }
        };

        inputRef.current.addEventListener('input', handleInput);

        console.log('Google Places Autocomplete initialized successfully');
        googlePlacesMonitor.logApiCall('autocomplete_ready');
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error);
        // Reset initialization flag so we can try again
        isInitializedRef.current = false;
        
        // If error is due to Places not being ready, retry
        if (retryCount < maxRetries && error instanceof Error && 
            (error.message.includes('Places') || error.message.includes('Autocomplete'))) {
          retryCount++;
          setTimeout(initializeAutocomplete, 200);
        }
      }
    };

    // Start initialization
    initializeAutocomplete();

    // Cleanup
    return () => {
      mounted = false;
      isInitializedRef.current = false;
      try {
        if (autocompleteRef.current && window.google?.maps?.event) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
        sessionTokenRef.current = null;
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, [enabled, inputRef, minCharacters]); // Remove onAddressSelect from dependencies
}

// Helper function to clean expired cache entries
function cleanAddressCache() {
  const now = Date.now();
  const entries = Array.from(addressCache.entries());
  for (const [key, value] of entries) {
    const cached = value as unknown as CachedAddress;
    if (cached.timestamp && now - cached.timestamp > CACHE_EXPIRY_MS) {
      addressCache.delete(key);
    }
  }
}

// Export for monitoring purposes
export function getApiCallStats() {
  return {
    totalCalls: 0, // This would need to be tracked globally
    cacheSize: addressCache.size,
    cacheEntries: Array.from(addressCache.keys())
  };
} 