'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../../context/FormContext';
import { trackEvent } from '../../../utils/analytics';
import { Loader2, AlertCircle } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function LandingBStep2Page() {
  const router = useRouter();
  const { formState, updateFormData } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const propertyConditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs significant repairs'];
  const sellingTimeframes = ['ASAP', 'Within 1 month', '1-2 Months', '3-6 Months', 'Flexible', 'Just curious'];

  const validateStep2 = () => {
    if (!formState.propertyCondition) {
      setError('Please select the property condition.');
      return false;
    }
    if (!formState.timeframe) {
      setError('Please select your selling timeframe.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    if (!executeRecaptcha) {
      console.error('Execute reCAPTCHA not yet available');
      setError('reCAPTCHA not ready. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recaptchaToken = await executeRecaptcha('submit_form');

      const dataToSubmit = {
        ...formState,
        lastUpdated: new Date().toISOString(),
        recaptchaToken: recaptchaToken,
      };

      console.log('Submitting form data:', dataToSubmit);
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API error response:', errorResponse);
        const message = errorResponse.error || `API error: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save form data');
      }

      trackEvent('form_submitted', {
        ...formState,
        leadId: result.leadId || formState.leadId,
      });

      router.push('/thank-you');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  }, [formState, updateFormData, router, executeRecaptcha]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-2">
          Almost There!
        </h1>
        <p className="text-gray-600 text-center mb-8">Help us understand your property better.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is the property currently listed with a real estate agent?
            </label>
            <div className="flex space-x-4 mt-2">
              {[ { label: 'Yes', value: true }, { label: 'No', value: false }].map((option) => (
                <label key={String(option.value)} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isPropertyListed"
                    checked={formState.isPropertyListed === option.value}
                    onChange={() => updateFormData({ isPropertyListed: option.value })}
                    className="focus:ring-accent h-4 w-4 text-accent border-gray-300"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="propertyCondition" className="block text-sm font-medium text-gray-700 mb-1">
              What is the general condition of the property?
            </label>
            <select
              id="propertyCondition"
              name="propertyCondition"
              value={formState.propertyCondition || ''}
              onChange={(e) => updateFormData({ propertyCondition: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent mt-1"
              required
            >
              <option value="" disabled>Select condition...</option>
              {propertyConditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
              How soon are you looking to sell?
            </label>
            <select
              id="timeframe"
              name="timeframe"
              value={formState.timeframe || ''}
              onChange={(e) => updateFormData({ timeframe: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent mt-1"
              required
            >
              <option value="" disabled>Select timeframe...</option>
              {sellingTimeframes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              What is your asking price for the property? (Optional)
            </label>
            <input
              id="price"
              name="price"
              type="text"
              value={formState.price || ''}
              onChange={(e) => updateFormData({ price: e.target.value })}
              placeholder="e.g., $250,000 or Negotiable"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent mt-1"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-gray-700 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 ease-in-out"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 flex items-center space-x-2 transition-colors duration-150 ease-in-out"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Complete & Get Offer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 