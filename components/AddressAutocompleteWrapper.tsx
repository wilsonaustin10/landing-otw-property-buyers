'use client';

import dynamic from 'next/dynamic';
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

interface AddressAutocompleteWrapperProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (addressData: AddressData) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  error?: string;
}

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

export default function AddressAutocompleteWrapper(props: AddressAutocompleteWrapperProps) {
  return <AddressAutocomplete {...props} />;
}