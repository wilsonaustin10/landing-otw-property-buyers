'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { LeadFormData } from '../types';
import { trackEvent } from '../utils/analytics';
import { useGooglePlaces, AddressData } from '../hooks/useGooglePlaces';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FormErrors {
  address?: string;
  phone?: string;
  submit?: string;
}

export default function LeadForm() {
  const [formData, setFormData] = useState<LeadFormData>({
    address: '',
    phone: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google?.maps?.places) {
        setIsGoogleLoaded(true);
      } else {
        console.error('Google Maps Places API not loaded');
        // Retry after a short delay
        setTimeout(checkGoogleMapsLoaded, 1000);
      }
    };

    checkGoogleMapsLoaded();
  }, []);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateAddress = (address: string) => {
    return address.trim().length > 0;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateAddress(formData.address)) {
      newErrors.address = 'Please enter a valid property address';
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSelect = (addressData: AddressData) => {
    console.log('Address selected:', addressData);
    
    // Create a complete address string including zip code
    const fullAddress = addressData.formattedAddress.includes(addressData.postalCode || '')
      ? addressData.formattedAddress
      : `${addressData.formattedAddress} ${addressData.postalCode || ''}`.trim();

    setFormData(prev => ({
      ...prev,
      address: fullAddress
    }));
    setErrors(prev => ({ ...prev, address: undefined }));
  };

  useGooglePlaces(addressInputRef, handleAddressSelect);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setTouched({ address: true, phone: true });
      trackEvent('form_validation_failed', { errors });
      return;
    }

    setLoading(true);
    trackEvent('form_submission', { step: 1 });
    
    try {
      // Submit form data to partial endpoint (no reCAPTCHA needed for initial lead capture)
      const response = await fetch('/api/submit-partial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          consent: formData.consent,
        }),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        throw new Error(`Failed to parse API response: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        // Extract error message from API response
        const errorMessage = result.error || `API error: ${response.status} ${response.statusText}`;
        console.error('API error response:', errorMessage);
        
        // Check if it's a phone validation error
        if (errorMessage.toLowerCase().includes('phone') || errorMessage.toLowerCase().includes('invalid number')) {
          setErrors(prev => ({
            ...prev,
            phone: errorMessage
          }));
          setTouched(prev => ({ ...prev, phone: true }));
          trackEvent('phone_validation_api_error', { error: errorMessage });
        }
        
        throw new Error(errorMessage);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit form');
      }

      // Store leadId if needed for future reference
      if (result.leadId) {
        console.log('Lead created with ID:', result.leadId);
      }

      router.push('/property-listed');
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if it's a rate limit error
        if (errorMessage.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
        // Check if it's a reCAPTCHA error
        else if (errorMessage.includes('reCAPTCHA')) {
          errorMessage = 'Security verification failed. Please refresh the page and try again.';
        }
        // Check if it's a network error
        else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
      
      trackEvent('form_submission_error', { 
        error: errorMessage,
        type: error instanceof Error ? error.name : 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length < 4) return phone;
    if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  if (!isGoogleLoaded) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="animate-spin h-5 w-5" />
          <span>Loading address lookup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <div className="relative">
            <input
              ref={addressInputRef}
              type="text"
              placeholder="Enter your property address"
              className={`w-full px-4 py-3 border rounded-lg transition-colors
                ${errors.address && touched.address 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-primary'} 
                focus:ring-2 focus:border-transparent`}
              defaultValue={formData.address}
              onChange={(e) => {
                console.log('Address input changed:', e.target.value);
                setFormData(prev => ({ ...prev, address: e.target.value }));
              }}
              onBlur={() => handleBlur('address')}
              required
            />
          </div>
          {errors.address && touched.address && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.address}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="relative">
            <input
              type="tel"
              placeholder="Your phone number"
              className={`w-full px-4 py-3 border rounded-lg transition-colors
                ${errors.phone && touched.phone 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-primary'}
                focus:ring-2 focus:border-transparent`}
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData({ ...formData, phone: formatted });
                if (touched.phone) validateForm();
              }}
              onBlur={() => handleBlur('phone')}
              maxLength={14}
              required
            />
          </div>
          {errors.phone && touched.phone && (
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Processing...
            </>
          ) : (
            'Get Your Cash Offer'
          )}
        </button>
      </form>
    </div>
  );
} 