'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Home, Phone, User, Mail, Clock, CheckCircle } from 'lucide-react';
import { formatPhoneNumber, isValidPhoneNumber } from '../utils/phoneFormatter';
import dynamic from 'next/dynamic';

// Dynamically import AddressAutocomplete to avoid SSR issues with Google Maps
const AddressAutocomplete = dynamic(
  () => import('./AddressAutocomplete'),
  { 
    ssr: false,
    loading: () => (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Home className="inline w-4 h-4 mr-1" />
          What's the property address?
        </label>
        <input
          type="text"
          placeholder="Enter your property address"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900"
          disabled
        />
        <p className="text-xs text-gray-500 mt-1">Loading address autocomplete...</p>
      </div>
    )
  }
);

interface FormData {
  address: string;
  phone: string;
  fullName: string;
  email: string;
  propertyCondition: string;
  timeline: string;
}

const MultiStepPropertyForm = React.memo(function MultiStepPropertyForm() {
  const router = useRouter();
  
  // Load saved progress from localStorage
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('formProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        const timeDiff = Date.now() - parsed.timestamp;
        // Clear data if older than 24 hours
        if (timeDiff < 24 * 60 * 60 * 1000) {
          return parsed.currentStep || 1;
        }
      }
    }
    return 1;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  
  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('formProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        const timeDiff = Date.now() - parsed.timestamp;
        // Use saved data if less than 24 hours old
        if (timeDiff < 24 * 60 * 60 * 1000 && parsed.formData) {
          return parsed.formData;
        }
      }
    }
    return {
      address: '',
      phone: '',
      fullName: '',
      email: '',
      propertyCondition: '',
      timeline: ''
    };
  });

  const totalSteps = 4;

  // Save progress to localStorage whenever form data or step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const progressData = {
        formData,
        currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem('formProgress', JSON.stringify(progressData));
    }
  }, [formData, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev: number) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev: number) => prev - 1);
    }
  }, [currentStep]);

  const handleClearProgress = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('formProgress');
      setFormData({
        address: '',
        phone: '',
        fullName: '',
        email: '',
        propertyCondition: '',
        timeline: ''
      });
      setCurrentStep(1);
      setErrors({});
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = useCallback((phone: string) => {
    return isValidPhoneNumber(phone);
  }, []);

  const isStepValid = useCallback(() => {
    const newErrors: Partial<FormData> = {};
    
    switch (currentStep) {
      case 1:
        if (formData.address.trim() === '') {
          newErrors.address = 'Address is required';
        }
        break;
      case 2:
        if (formData.fullName.trim() === '') {
          newErrors.fullName = 'Name is required';
        }
        if (formData.phone.trim() === '') {
          newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
          newErrors.phone = 'Please enter a valid phone number';
        }
        break;
      case 3:
        if (formData.email.trim() === '') {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      case 4:
        if (formData.propertyCondition === '') {
          newErrors.propertyCondition = 'Please select property condition';
        }
        if (formData.timeline === '') {
          newErrors.timeline = 'Please select a timeline';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  const handleSubmit = useCallback(async () => {
    if (!isStepValid()) return;
    
    setIsSubmitting(true);
    try {
      // Clear saved progress on successful submission
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'offer-page',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Track conversion if gtag is available
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
            'value': 1.0,
            'currency': 'USD'
          });
        }
        // Clear saved progress
        if (typeof window !== 'undefined') {
          localStorage.removeItem('formProgress');
        }
        router.push('/thank-you');
      } else {
        console.error('Form submission failed');
        alert('There was an error submitting your form. Please try again or call us directly.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your form. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isStepValid, router]);

  const renderProgressBar = useMemo(() => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                step < currentStep
                  ? 'bg-secondary text-white'
                  : step === currentStep
                  ? 'bg-primary text-white scale-110'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    );
  }, [currentStep, totalSteps]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, address: value }));
                if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
              }}
              placeholder="Enter your property address"
              className={`w-full px-4 py-3 border-2 ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900`}
              autoFocus
              error={errors.address}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                What's your name?
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, fullName: e.target.value }));
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border-2 ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900`}
                autoFocus
                aria-label="Full name"
                aria-required="true"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'name-error' : undefined}
              />
              {errors.fullName && (
                <p id="name-error" className="text-xs text-red-500 mt-1" role="alert">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Best phone number to reach you?
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData(prev => ({ ...prev, phone: formatted }));
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                }}
                placeholder="(555) 123-4567"
                className={`w-full px-4 py-3 border-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900`}
                aria-label="Phone number"
                aria-required="true"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="text-xs text-red-500 mt-1" role="alert">{errors.phone}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                What's your email address?
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900`}
                autoFocus
                aria-label="Email address"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : 'email-hint'}
              />
              {errors.email ? (
                <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">{errors.email}</p>
              ) : (
                <p id="email-hint" className="text-xs text-gray-500 mt-1">We'll send your cash offer details here</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Condition
              </label>
              <select
                name="propertyCondition"
                id="propertyCondition"
                value={formData.propertyCondition}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, propertyCondition: e.target.value }));
                  if (errors.propertyCondition) setErrors(prev => ({ ...prev, propertyCondition: '' }));
                }}
                className={`w-full px-4 py-3 border-2 ${errors.propertyCondition ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900`}
                aria-label="Property condition"
                aria-required="true"
                aria-invalid={!!errors.propertyCondition}
                aria-describedby={errors.propertyCondition ? 'condition-error' : undefined}
              >
                <option value="">Select condition</option>
                <option value="excellent">Excellent - Move-in ready</option>
                <option value="good">Good - Minor repairs needed</option>
                <option value="fair">Fair - Some repairs needed</option>
                <option value="poor">Poor - Major repairs needed</option>
              </select>
              {errors.propertyCondition && (
                <p id="condition-error" className="text-xs text-red-500 mt-1" role="alert">{errors.propertyCondition}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                How soon do you need to sell?
              </label>
              <select
                name="timeline"
                id="timeline"
                value={formData.timeline}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, timeline: e.target.value }));
                  if (errors.timeline) setErrors(prev => ({ ...prev, timeline: '' }));
                }}
                className={`w-full px-4 py-3 border-2 ${errors.timeline ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-900`}
                aria-label="Selling timeline"
                aria-required="true"
                aria-invalid={!!errors.timeline}
                aria-describedby={errors.timeline ? 'timeline-error' : undefined}
              >
                <option value="">Select timeline</option>
                <option value="asap">ASAP</option>
                <option value="30days">Within 30 days</option>
                <option value="60days">Within 60 days</option>
                <option value="90days">Within 90 days</option>
                <option value="flexible">I'm flexible</option>
              </select>
              {errors.timeline && (
                <p id="timeline-error" className="text-xs text-red-500 mt-1" role="alert">{errors.timeline}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if there's saved progress
  const hasSavedProgress = currentStep > 1 || Object.values(formData).some(value => value !== '');

  return (
    <div>
      {renderProgressBar}
      
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Step {currentStep} of {totalSteps}
            </h3>
            <p className="text-sm text-gray-600">
              {currentStep === 1 && "Let's start with your property details"}
              {currentStep === 2 && "Tell us how to contact you"}
              {currentStep === 3 && "Almost there! Just need your email"}
              {currentStep === 4 && "Last step - property details"}
            </p>
          </div>
          {hasSavedProgress && currentStep === 1 && (
            <button
              type="button"
              onClick={handleClearProgress}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              aria-label="Start over with a fresh form"
            >
              Start Fresh
            </button>
          )}
        </div>
        {hasSavedProgress && currentStep > 1 && (
          <p className="text-xs text-green-600 mt-2">✓ Your progress is saved</p>
        )}
      </div>

      <form onSubmit={(e) => { 
        e.preventDefault(); 
        if (isStepValid()) {
          currentStep === totalSteps ? handleSubmit() : handleNext();
        }
      }} noValidate>
        {renderStep()}
        
        <div className="flex gap-3 mt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
              aria-label="Go back to previous step"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
              !isSubmitting
                ? 'bg-secondary text-white hover:bg-opacity-90 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label={currentStep === totalSteps ? 'Submit form and get cash offer' : 'Continue to next step'}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : currentStep === totalSteps ? (
              <>
                Get My Cash Offer
                <CheckCircle className="w-5 h-5 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          🔒 Your information is secure and will never be shared
        </p>
      </div>
    </div>
  );
});

export default MultiStepPropertyForm;