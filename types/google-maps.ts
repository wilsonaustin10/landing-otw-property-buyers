declare global {
  namespace google.maps {
    interface PlacesLibrary {
      PlaceAutocompleteElement: {
        new(): HTMLElement & {
          addEventListener(
            type: 'gmp-placeselect',
            listener: (event: { detail: { place: Place } }) => void
          ): void;
        };
      };
    }

    interface Place {
      fetchFields(options: { fields: string[] }): Promise<void>;
      toJSON(): PlaceResult;
    }

    interface PlaceResult {
      address_components?: google.maps.GeocoderAddressComponent[];
      formatted_address?: string;
      geometry?: {
        location: google.maps.LatLng;
        viewport: google.maps.LatLngBounds;
      };
      place_id?: string;
      displayName?: string;
      formattedAddress?: string;
      addressComponents?: Array<{
        longText: string;
        shortText: string;
        types: string[];
      }>;
      location?: google.maps.LatLng;
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }
  }
}

export interface AddressData {
    streetNumber: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    formattedAddress: string;
  }
  
  export interface ExtendedPlaceResult extends google.maps.PlaceResult {
    addressData?: AddressData;
  }

  // Ensure this is recognized as a module
  export {};