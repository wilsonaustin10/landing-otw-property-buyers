'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../context/FormContext';
import { trackEvent } from '../../utils/analytics';

export default function TimelinePage() {
  const router = useRouter();
  const { formState, updateFormData } = useForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('timeline_details_submitted');
    try {
      trackEvent('timeline_submitted');
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/contact');
    } catch (err) {
      console.error('Error submitting timeline:', err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          A Couple More Questions
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeframe
              </label>
              <select
                value={formState.timeframe || ''}
                onChange={(e) => updateFormData({ timeframe: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select timeframe</option>
                <option value="immediately">As soon as possible</option>
                <option value="1-3months">1-3 months</option>
                <option value="3-6months">3-6 months</option>
                <option value="6+months">6+ months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Condition
              </label>
              <select
                value={formState.propertyCondition || ''}
                onChange={(e) => updateFormData({ propertyCondition: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select condition</option>
                <option value="excellent">Excellent - Move-in ready</option>
                <option value="good">Good - Minor repairs needed</option>
                <option value="fair">Fair - Some major repairs needed</option>
                <option value="poor">Poor - Needs significant work</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How much are you looking to get for the property?
              </label>
              <input
                type="range"
                min="0"
                max="800000"
                step="10000"
                value={formState.price || 0}
                onChange={(e) => updateFormData({ price: e.target.value })}
                className="w-full"
              />
              <div className="text-center mt-2">
                <span>${Number(formState.price || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 