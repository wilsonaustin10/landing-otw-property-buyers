'use client';

import { useEffect, useRef, useCallback } from 'react';
import { googlePlacesMonitor } from '../utils/googlePlacesMonitor';

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
    const maxRetries = 50; // 5 seconds with 100ms intervals
    
    const initializeAutocomplete = () => {
      // Check if component is still mounted
      if (!mounted) return;
      
      // Wait for both input ref and Google Maps to be available
      if (!inputRef.current || !window.google?.maps?.places) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Waiting for Google Places API... (attempt ${retryCount}/${maxRetries})`);
          setTimeout(initializeAutocomplete, 100);
        } else {
          console.error('Google Places API failed to load after 5 seconds');
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

          const addressData: AddressData = {
            formattedAddress: place.formatted_address,
            placeId: place.place_id
          };

          // Parse address components
          place.address_components?.forEach(component => {
            const type = component.types[0];
            switch (type) {
              case 'street_number': addressData.streetNumber = component.long_name; break;
              case 'route': addressData.street = component.long_name; break;
              case 'locality': addressData.city = component.long_name; break;
              case 'administrative_area_level_1': addressData.state = component.short_name; break;
              case 'postal_code': addressData.postalCode = component.long_name; break;
            }
          });

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

        // Add input listener to enforce minimum characters
        const handleInput = (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value.trim();
          
          if (value.length < minCharacters) {
            // Disable autocomplete for short inputs
            const pacContainer = document.querySelector('.pac-container') as HTMLElement;
            if (pacContainer) {
              pacContainer.style.display = 'none';
            }
            googlePlacesMonitor.logApiCall('input_too_short', { 
              inputLength: value.length, 
              minRequired: minCharacters 
            });
          } else {
            // Re-enable if hidden
            const pacContainer = document.querySelector('.pac-container') as HTMLElement;
            if (pacContainer && pacContainer.style.display === 'none') {
              pacContainer.style.display = '';
            }
          }
        };

        inputRef.current.addEventListener('input', handleInput);

        console.log('Google Places Autocomplete initialized successfully');
        googlePlacesMonitor.logApiCall('autocomplete_ready');
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error);
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