'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../context/FormContext';
import { trackEvent } from '../../utils/analytics';

export default function PropertyDetailsPage() {
  const router = useRouter();
  const { formState, updateFormData } = useForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('property_details_submitted');
    router.push('/timeline');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Tell Us About Your Property
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
          {/* Commented out for now as per requirements
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                value={formState.bedrooms || ''}
                onChange={(e) => updateFormData({ bedrooms: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select bedrooms</option>
                {[1, 2, 3, 4, 5, '6+'].map((num) => (
                  <option key={num} value={num}>{num} bedrooms</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <select
                value={formState.bathrooms || ''}
                onChange={(e) => updateFormData({ bathrooms: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select bathrooms</option>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, '4+'].map((num) => (
                  <option key={num} value={num}>{num} bathrooms</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Square Feet
              </label>
              <input
                type="number"
                value={formState.squareFeet || ''}
                onChange={(e) => updateFormData({ squareFeet: e.target.value })}
                placeholder="Approximate square footage"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          */}

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