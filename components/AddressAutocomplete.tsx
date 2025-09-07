'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Home } from 'lucide-react';

interface AddressData {
  address: string;
  formattedAddress?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (addressData: AddressData) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  error?: string;
  onBlur?: () => void;
}

declare global {
  interface Window {
    initAutocomplete?: () => void;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter your property address",
  className = "",
  autoFocus = false,
  error,
  onBlur
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onAddressSelectRef = useRef(onAddressSelect);
  
  // Update ref when callback changes
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
  }, [onAddressSelect]);

  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current) {
      console.log('AddressAutocomplete: Input ref not ready');
      return;
    }
    
    if (!window.google?.maps?.places) {
      console.log('AddressAutocomplete: Google Maps Places API not loaded');
      return;
    }

    console.log('AddressAutocomplete: Initializing autocomplete');

    // Destroy previous instance if it exists
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }

    try {
      // Create new autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'address_components', 'geometry']
        }
      );

      console.log('AddressAutocomplete: Autocomplete instance created successfully');

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log('AddressAutocomplete: Place selected', place);
        
        // Check if we have a valid place with a formatted address
        // If not, keep the user's typed value
        if (place?.formatted_address) {
          console.log('AddressAutocomplete: Using formatted address:', place.formatted_address);
          onChange(place.formatted_address);
          
          // Parse address components if callback provided
          if (onAddressSelect && place.address_components) {
            const addressData: AddressData = {
              address: place.formatted_address,
              formattedAddress: place.formatted_address,
              placeId: place.place_id
            };
            
            // Parse components
            let streetNumber = '';
            let route = '';
            
            place.address_components.forEach((component: any) => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
              } else if (types.includes('route')) {
                route = component.long_name;
              } else if (types.includes('locality')) {
                addressData.city = component.long_name;
              } else if (types.includes('sublocality') && !addressData.city) {
                addressData.city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                addressData.state = component.short_name;
              } else if (types.includes('postal_code')) {
                addressData.postalCode = component.long_name;
              }
            });
            
            // Combine street number and route for full street address
            addressData.addressLine1 = [streetNumber, route].filter(Boolean).join(' ').trim();
            
            console.log('Parsed address data:', addressData);
            if (onAddressSelectRef.current) {
              onAddressSelectRef.current(addressData);
            }
          }
        } else if (place?.name) {
          // This might be the issue - when user just types a number
          // Google might return just the street number as place.name
          console.log('AddressAutocomplete: Only place.name available:', place.name);
          console.log('AddressAutocomplete: Current input value:', inputRef.current?.value);
          // Don't update with just place.name if it's incomplete
          // Keep what the user typed instead
          if (inputRef.current?.value && inputRef.current.value.length > place.name.length) {
            console.log('AddressAutocomplete: Keeping user input instead of place.name');
            // Don't call onChange, keep the current value
          } else {
            onChange(place.name);
          }
        } else {
          console.log('AddressAutocomplete: No valid place data, keeping user input');
        }
      });
    } catch (error) {
      console.error('AddressAutocomplete: Error creating autocomplete instance', error);
    }
  }, [onChange]);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      initializeAutocomplete();
      return;
    }

    // Listen for the custom event that indicates Google Maps is ready
    const handleGoogleMapsReady = () => {
      setIsLoaded(true);
      initializeAutocomplete();
    };

    window.addEventListener('google-maps-ready', handleGoogleMapsReady);

    // Also set up a polling check as a fallback
    const checkGoogleMaps = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(checkGoogleMaps);
        setIsLoaded(true);
        initializeAutocomplete();
      }
    }, 100);

    // Clean up interval after 10 seconds if Google Maps hasn't loaded
    const timeout = setTimeout(() => {
      clearInterval(checkGoogleMaps);
      console.warn('Google Maps API failed to load after 10 seconds');
    }, 10000);

    return () => {
      window.removeEventListener('google-maps-ready', handleGoogleMapsReady);
      clearInterval(checkGoogleMaps);
      clearTimeout(timeout);
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [initializeAutocomplete]);

  // Reinitialize when Google Maps loads
  useEffect(() => {
    if (isLoaded) {
      initializeAutocomplete();
    }
  }, [isLoaded, initializeAutocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Prevent form submission on Enter key when selecting from dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Check if the autocomplete dropdown is open
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && (pacContainer as HTMLElement).style.display !== 'none') {
        e.preventDefault();
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <Home className="inline w-4 h-4 mr-1" />
        What's the property address?
      </label>
      <input
        ref={inputRef}
        type="text"
        id="address"
        name="address"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-label="Property address"
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? 'address-error' : 'address-hint'}
      />
      {error ? (
        <p id="address-error" className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </p>
      ) : (
        <p id="address-hint" className="text-xs text-gray-500 mt-1">
          We buy houses anywhere in the area
        </p>
      )}
    </div>
  );
}