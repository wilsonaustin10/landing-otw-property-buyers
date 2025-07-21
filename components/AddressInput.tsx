'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import type { AddressData } from '../types/GooglePlacesTypes';
import { Loader2 } from 'lucide-react';
import { useForm } from '../context/FormContext';

interface AddressInputProps {
  onAddressSelect?: (addressData: AddressData) => void;
  className?: string;
  defaultValue?: string;
  error?: string;
  readOnly?: boolean;
}

export default function AddressInput({ 
  onAddressSelect, 
  className = '',
  defaultValue = '',
  error: externalError,
  readOnly = false
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [localError, setLocalError] = useState<string>('');
  const { formState, updateFormData, errors } = useForm();

  // Handle Google Places selection - memoized to prevent re-initialization
  const handleAddressSelect = useCallback(async (addressData: AddressData) => {
    console.log('AddressInput received:', addressData);
    setIsProcessing(true);
    setLocalError(''); // Clear any previous errors
    
    try {
      // Check for minimum required fields (city and state)
      if (!addressData.city || !addressData.state) {
        console.error('Missing required fields:', { 
          city: addressData.city, 
          state: addressData.state,
          fullData: addressData 
        });
        // If city or state is missing, it's likely not a valid residential address
        throw new Error('Please select a complete address with city and state.');
      }

      // Build address components with available data
      const streetAddress = addressData.streetNumber && addressData.street 
        ? `${addressData.streetNumber} ${addressData.street}`.trim()
        : addressData.street || '';

      // Warn if some components are missing but don't block submission
      const missingComponents = [];
      if (!addressData.streetNumber) missingComponents.push('street number');
      if (!addressData.street) missingComponents.push('street name');
      if (!addressData.postalCode) missingComponents.push('ZIP code');

      if (missingComponents.length > 0) {
        console.warn(`Address is missing: ${missingComponents.join(', ')}. User may need to verify.`);
      }

      // Update form data with available address components
      const addressUpdate = {
        address: addressData.formattedAddress,
        streetAddress: streetAddress,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode || '',
        placeId: addressData.placeId || ''
      };
      
      setSelectedAddress(addressData);
      updateFormData(addressUpdate);
      
      if (onAddressSelect) {
        await onAddressSelect(addressData);
      }
    } catch (err) {
      console.error('Error processing address:', err);
      setLocalError(err instanceof Error ? err.message : 'Error processing address selection');
    } finally {
      setIsProcessing(false);
    }
  }, [onAddressSelect, updateFormData]);

  // Initialize Google Places with minimum 3 characters requirement
  useGooglePlaces(inputRef, handleAddressSelect, !readOnly, 3);

  const error = externalError || localError || errors?.address;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative w-full">
        {readOnly ? (
          <div className="w-full px-4 py-3 text-lg border rounded-lg bg-gray-50">
            {formState.address}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your property address"
            className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all
              ${error ? 'border-red-500' : 'border-gray-300'}`}
            defaultValue={defaultValue || formState.address}
            disabled={isLoading || isProcessing}
            aria-label="Property address"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'address-error' : undefined}
            required
          />
        )}
        
        {(isLoading || isProcessing) && !readOnly && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {error && !readOnly && (
          <p id="address-error" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {selectedAddress && !error && !readOnly && (
        <div className="flex flex-col space-y-2">
          <div className={`p-3 rounded-lg ${
            (!selectedAddress.streetNumber || !selectedAddress.street || !selectedAddress.postalCode)
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <p className={`text-sm ${
              (!selectedAddress.streetNumber || !selectedAddress.street || !selectedAddress.postalCode)
                ? 'text-yellow-800'
                : 'text-green-800'
            }`}>
              Selected: {selectedAddress.formattedAddress}
            </p>
            {(!selectedAddress.streetNumber || !selectedAddress.street || !selectedAddress.postalCode) && (
              <p className="text-xs text-yellow-700 mt-1">
                Note: Some address details may be missing. Please verify the address is correct.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
