/**
 * Interface for Google Places address data
 * Matches the structure returned by the Places API
 */
export interface AddressData {
  // Required fields
  formattedAddress: string;

  // Optional fields from address components
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;

  // Optional location data
  location?: google.maps.LatLng;
}

declare global {
  namespace google.maps.places {
    interface Autocomplete {
      Autocomplete: new (
        input: HTMLInputElement,
        opts?: google.maps.places.AutocompleteOptions
      ) => google.maps.places.Autocomplete;
    }
    
    interface AutocompleteOptions {
      types?: string[];
      componentRestrictions?: google.maps.places.ComponentRestrictions;
      fields?: string[];
    }
  }
}

export {};