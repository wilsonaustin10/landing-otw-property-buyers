'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../context/FormContext';
import AddressInput from '../../components/AddressInput';
import type { AddressData } from '../../types/GooglePlacesTypes';
import { trackEvent } from '../../utils/analytics';
import { Loader2, CheckCircle, Users, Award, TrendingUp, MessageSquare, Star } from 'lucide-react';

export default function LandingBPage() {
  const router = useRouter();
  const { formState, updateFormData } = useForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localFullName, setLocalFullName] = useState(
    formState.firstName || formState.lastName ? `${formState.firstName || ''} ${formState.lastName || ''}`.trim() : ''
  );

  useEffect(() => {
    const globalFullName = formState.firstName || formState.lastName ? `${formState.firstName || ''} ${formState.lastName || ''}`.trim() : '';
    if (globalFullName !== localFullName) {
      setLocalFullName(globalFullName);
    }
  }, [formState.firstName, formState.lastName]);

  const handleAddressSelect = useCallback((addressData: AddressData) => {
    updateFormData({
      address: addressData.formattedAddress,
      streetAddress: addressData.street,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      placeId: addressData.placeId,
    });
    setLocalErrors(prev => ({ ...prev, address: '' }));
  }, [updateFormData]);

  const handleLocalFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFullName(e.target.value);
    if (localErrors.fullName) {
      setLocalErrors(prev => ({ ...prev, fullName: '' }));
    }
  };

  const syncGlobalNameFromLocal = () => {
    const nameParts = localFullName.trim().split(/\s+/);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');
    updateFormData({ firstName, lastName });
    return { firstName, lastName };
  };

  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    updateFormData({ phone: formattedPhoneNumber });
    if (localErrors.phone) {
      setLocalErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateFirstStep = () => {
    const { firstName, lastName } = syncGlobalNameFromLocal();
    const errors: Record<string, string> = {};
    if (!formState.address?.trim()) errors.address = 'Address is required.';
    if (!firstName && !lastName) errors.fullName = 'Full name is required.';
    if (!formState.phone?.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formState.phone)) {
      errors.phone = 'Invalid phone format.';
    }
    if (!formState.email?.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formState.email)) {
      errors.email = 'Invalid email format.';
    }
    if (!formState.consent) errors.consent = 'You must agree to the terms.';
    
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    syncGlobalNameFromLocal();
    if (!validateFirstStep()) {
      return;
    }

    setLocalErrors({});
    setIsSubmitting(true);
    
    try {
      // Submit partial data to API for phone verification
      const response = await fetch('/api/submit-partial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formState.address,
          phone: formState.phone,
          consent: formState.consent,
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
          setLocalErrors(prev => ({
            ...prev,
            phone: errorMessage
          }));
          return;
        }
        
        throw new Error(errorMessage);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify contact information');
      }

      // Store leadId if provided
      if (result.leadId) {
        updateFormData({ leadId: result.leadId });
      }

      trackEvent('step1_next', {
        hasAddress: !!formState.address,
        hasFullName: !!(formState.firstName || formState.lastName),
        hasPhone: !!formState.phone,
        hasEmail: !!formState.email,
      });
      
      router.push('/landing-b/step-2');
    } catch (error) {
      console.error('Form submission error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if it's a rate limit error
        if (errorMessage.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
      }
      
      setLocalErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const howItWorksSteps = [
    {
      icon: <MessageSquare className="h-12 w-12 text-accent" />,
      title: 'Tell Us About Your Home',
      description: 'Fill out our simple online form with your property address and contact information. It only takes a few minutes!',
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-accent" />,
      title: 'Get a Fair Cash Offer',
      description: 'We analyze your property details and local market data to provide you with a competitive, no-obligation cash offer quickly.',
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-accent" />,
      title: 'Close On Your Schedule',
      description: 'If you accept our offer, you choose the closing date that works best for you. We handle the paperwork and make it hassle-free.',
    },
  ];

  const testimonials = [
    {
      quote: "The team was professional and made the entire selling process incredibly smooth. I got my cash offer fast and closed without any issues. Highly recommend!",
      name: "Sarah L.",
      location: "Phoenix, AZ",
      avatar: "/images/testimonial-1.jpg" // Generic placeholder image path
    },
    {
      quote: "I needed to sell my inherited property quickly. They gave me a fair offer and handled everything. It was a huge relief during a difficult time.",
      name: "Michael B.",
      location: "Dallas, TX",
      avatar: "/images/testimonial-2.jpg" // Generic placeholder image path
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16 md:mb-24">
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Get Your Cash Offer Today
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Fast, fair & hassle-free home selling
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Property Address
              </label>
              <AddressInput
                onAddressSelect={handleAddressSelect}
                defaultValue={formState.address || ''}
                className="mt-1"
                error={localErrors.address}
              />
              {localErrors.address && <p className="mt-1 text-xs text-red-600">{localErrors.address}</p>}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={localFullName}
                onChange={handleLocalFullNameChange}
                onBlur={syncGlobalNameFromLocal}
                placeholder="e.g., John Doe"
                className={`mt-1 block w-full px-3 py-2 border ${localErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm`}
                required
              />
              {localErrors.fullName && <p className="mt-1 text-xs text-red-600">{localErrors.fullName}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formState.phone || ''}
                onChange={handlePhoneInputChange}
                placeholder="(555) 123-4567"
                maxLength={14}
                className={`mt-1 block w-full px-3 py-2 border ${localErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm`}
                required
              />
              {localErrors.phone && <p className="mt-1 text-xs text-red-600">{localErrors.phone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formState.email || ''}
                onChange={(e) => {
                  updateFormData({ email: e.target.value });
                  setLocalErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="you@example.com"
                className={`mt-1 block w-full px-3 py-2 border ${localErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm`}
                required
              />
              {localErrors.email && <p className="mt-1 text-xs text-red-600">{localErrors.email}</p>}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={formState.consent || false}
                  onChange={(e) => {
                    updateFormData({ consent: e.target.checked });
                    setLocalErrors(prev => ({ ...prev, consent: '' }));
                  }}
                  className="focus:ring-accent h-4 w-4 text-accent border-gray-300 rounded"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="consent" className="font-medium text-gray-700">
                  I agree to be contacted about my property.
                </label>
                {localErrors.consent && <p className="mt-1 text-xs text-red-600">{localErrors.consent}</p>}
              </div>
            </div>

            {localErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{localErrors.submit}</p>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Verifying...
                  </>
                ) : (
                  'Get Your Cash Offer'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-12">
          {/* How It Works Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h2>
            <div className="space-y-8">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{step.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">What Our Customers Say</h2>
            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={testimonial.avatar}
                        alt={`${testimonial.name}'s avatar`}
                      />
                    </div>
                    <div>
                      <p className="text-gray-600 italic">{testimonial.quote}</p>
                      <div className="mt-2">
                        <p className="font-medium text-gray-900">{testimonial.name}</p>
                        <p className="text-gray-500 text-sm">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 