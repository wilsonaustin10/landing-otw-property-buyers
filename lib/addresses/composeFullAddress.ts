/**
 * Address parsing and composition utilities
 */

export interface AddressParts {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface ParsedAddress extends AddressParts {
  streetNumber?: string;
  route?: string;
  placeId?: string;
  formattedAddress?: string;
}

/**
 * Parse Google Places result into address components
 */
export function addressFromPlace(place: google.maps.places.PlaceResult): ParsedAddress {
  const get = (type: string, useShort = false) => {
    const component = place.address_components?.find(c => c.types.includes(type));
    return component?.[useShort ? 'short_name' : 'long_name'] || '';
  };

  const streetNumber = get('street_number');
  const route = get('route');
  
  // Combine street number and route to form full street address
  const addressLine1 = [streetNumber, route].filter(Boolean).join(' ').trim();
  
  return {
    streetNumber,
    route,
    addressLine1,
    city: get('locality') || get('sublocality') || get('postal_town') || get('administrative_area_level_2'),
    state: get('administrative_area_level_1', true),
    postalCode: get('postal_code'),
    placeId: place.place_id,
    formattedAddress: place.formatted_address
  };
}

/**
 * Parse address components from Google Places Autocomplete
 */
export function parseAddressComponents(components: google.maps.GeocoderAddressComponent[]): ParsedAddress {
  const parsed: Partial<ParsedAddress> = {};
  
  components.forEach(component => {
    const types = component.types;
    
    if (types.includes('street_number')) {
      parsed.streetNumber = component.long_name;
    }
    if (types.includes('route')) {
      parsed.route = component.long_name;
    }
    if (types.includes('locality')) {
      parsed.city = component.long_name;
    }
    if (types.includes('sublocality') && !parsed.city) {
      parsed.city = component.long_name;
    }
    if (types.includes('postal_town') && !parsed.city) {
      parsed.city = component.long_name;
    }
    if (types.includes('administrative_area_level_2') && !parsed.city) {
      // County as fallback
      parsed.city = component.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      parsed.state = component.short_name;
    }
    if (types.includes('postal_code')) {
      parsed.postalCode = component.long_name;
    }
  });
  
  // Combine street number and route
  const addressLine1 = [parsed.streetNumber, parsed.route].filter(Boolean).join(' ').trim();
  
  return {
    streetNumber: parsed.streetNumber || '',
    route: parsed.route || '',
    addressLine1,
    city: parsed.city || '',
    state: parsed.state || '',
    postalCode: parsed.postalCode || '',
    placeId: parsed.placeId,
    formattedAddress: parsed.formattedAddress
  };
}

/**
 * Validate that address has minimum required fields
 */
export function validateAddress(address: Partial<ParsedAddress>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!address.addressLine1?.trim()) {
    errors.push('Street address is required');
  }
  
  if (!address.city?.trim()) {
    errors.push('City is required');
  }
  
  if (!address.state?.trim()) {
    errors.push('State is required');
  }
  
  // Postal code is optional but warn if missing
  if (!address.postalCode?.trim()) {
    console.warn('Address is missing postal code');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}