'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Home } from 'lucide-react';
import { useGoogleMapsLazy } from '../hooks/useGoogleMapsLazy';

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
  onFocus?: () => void;
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
  onBlur,
  onFocus
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { loadGoogleMaps, isLoaded } = useGoogleMapsLazy();
  const onAddressSelectRef = useRef(onAddressSelect);
  const [hasSelectedFromDropdown, setHasSelectedFromDropdown] = useState(false);
  
  // Update ref when callback changes
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
  }, [onAddressSelect]);

  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || isInitialized) {
      return;
    }
    
    if (!window.google?.maps?.places) {
      console.log('AddressAutocomplete: Google Maps Places API not loaded, attempting to load...');
      await loadGoogleMaps();
      
      if (!window.google?.maps?.places) {
        console.error('AddressAutocomplete: Failed to load Google Maps');
        return;
      }
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
          fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
        }
      );

      console.log('AddressAutocomplete: Autocomplete instance created successfully');
      setIsInitialized(true);

      // Handle place selection - CRITICAL: Only update when we have a complete address
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log('AddressAutocomplete: Place selected', place);
        
        // ONLY update the form if we have a valid formatted_address from Google
        // This is the complete address the user selected from the dropdown
        if (place?.formatted_address) {
          console.log('AddressAutocomplete: Using formatted address:', place.formatted_address);
          
          // Mark that we've selected from dropdown
          setHasSelectedFromDropdown(true);
          
          // Update the input field with the complete formatted address
          onChange(place.formatted_address);
          
          // Also parse and send address components if callback provided
          if (onAddressSelectRef.current) {
            const addressData: AddressData = {
              address: place.formatted_address,
              formattedAddress: place.formatted_address,
              placeId: place.place_id
            };
            
            // Parse components if available
            if (place.address_components) {
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
            }
            
            console.log('Parsed address data:', addressData);
            onAddressSelectRef.current(addressData);
          }
        } else {
          // If we don't have a formatted_address, the user didn't select from dropdown
          // Log this for debugging but DON'T update the form with partial data
          console.log('AddressAutocomplete: No formatted_address available');
          console.log('AddressAutocomplete: Place object:', place);
          
          // Important: We do NOT update the form here
          // The user's typed value will remain in the input field
        }
      });
    } catch (error) {
      console.error('AddressAutocomplete: Error creating autocomplete instance', error);
    }
  }, [onChange, isInitialized, loadGoogleMaps]);

  // Load Google Maps on focus
  const handleFocus = useCallback(async () => {
    if (!isInitialized && !isLoaded) {
      await initializeAutocomplete();
    }
    onFocus?.();
  }, [isInitialized, isLoaded, initializeAutocomplete, onFocus]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If this change is from selecting an address, don't clear the data
    if (hasSelectedFromDropdown) {
      setHasSelectedFromDropdown(false);
      onChange(e.target.value);
      return;
    }
    
    // User is typing manually
    onChange(e.target.value);
    
    // When user types manually, clear the selection data
    // This ensures they must select from dropdown for valid submission
    if (onAddressSelectRef.current) {
      onAddressSelectRef.current({
        address: e.target.value,
        formattedAddress: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        placeId: '' // Clear placeId when typing manually
      });
    }
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
        onFocus={handleFocus}
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
          Start typing and select your address from the dropdown
        </p>
      )}
    </div>
  );
}