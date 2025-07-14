'use client';

import React, { useRef, useState } from 'react';
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

  // Handle Google Places selection
  const handleAddressSelect = async (addressData: AddressData) => {
    setIsProcessing(true);
    
    try {
      // Ensure all required fields are present
      if (!addressData.streetNumber || !addressData.street || !addressData.city || 
          !addressData.state || !addressData.postalCode || !addressData.placeId) {
        throw new Error('Incomplete address selected. Please select a full address.');
      }

      // Update form data with all address components
      const addressUpdate = {
        address: addressData.formattedAddress,
        streetAddress: `${addressData.streetNumber} ${addressData.street}`.trim(),
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        placeId: addressData.placeId
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
  };

  // Only initialize Google Places if not readOnly
  if (!readOnly) {
    useGooglePlaces(inputRef, handleAddressSelect);
  }

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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Selected: {selectedAddress.formattedAddress}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
