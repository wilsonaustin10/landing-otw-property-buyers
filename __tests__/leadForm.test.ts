/**
 * Tests for lead form submission with address parsing and price handling
 */

import { parsePrice, formatPhoneForStorage, validateAndTransformLead } from '../lib/validation/leadSchema';
import { parseAddressComponents, validateAddress } from '../lib/addresses/composeFullAddress';

describe('Price Parsing', () => {
  it('should parse numeric strings correctly', () => {
    expect(parsePrice('425000')).toBe(425000);
    expect(parsePrice('250000')).toBe(250000);
    expect(parsePrice('1000000')).toBe(1000000);
  });

  it('should handle formatted prices with commas', () => {
    expect(parsePrice('425,000')).toBe(425000);
    expect(parsePrice('1,250,000')).toBe(1250000);
    expect(parsePrice('25,000')).toBe(25000);
  });

  it('should handle prices with dollar signs', () => {
    expect(parsePrice('$425000')).toBe(425000);
    expect(parsePrice('$425,000')).toBe(425000);
    expect(parsePrice('$ 425,000')).toBe(425000);
  });

  it('should handle K/M suffixes', () => {
    expect(parsePrice('425K')).toBe(425000);
    expect(parsePrice('425k')).toBe(425000);
    expect(parsePrice('1.5M')).toBe(1500000);
    expect(parsePrice('2.5m')).toBe(2500000);
  });

  it('should return null for invalid inputs', () => {
    expect(parsePrice('')).toBe(null);
    expect(parsePrice(null)).toBe(null);
    expect(parsePrice(undefined)).toBe(null);
    expect(parsePrice('abc')).toBe(null);
    expect(parsePrice('not a price')).toBe(null);
  });

  it('should handle numeric inputs', () => {
    expect(parsePrice(425000)).toBe(425000);
    expect(parsePrice(0)).toBe(0);
  });
});

describe('Phone Formatting', () => {
  it('should format 10-digit phone numbers correctly', () => {
    expect(formatPhoneForStorage('5055605532')).toBe('(505) 560-5532');
    expect(formatPhoneForStorage('1234567890')).toBe('(123) 456-7890');
  });

  it('should return non-10-digit numbers as-is', () => {
    expect(formatPhoneForStorage('123456')).toBe('123456');
    expect(formatPhoneForStorage('12345678901')).toBe('12345678901');
    expect(formatPhoneForStorage('(505) 560-5532')).toBe('(505) 560-5532');
  });
});

describe('Address Parsing', () => {
  it('should parse complete address components', () => {
    const mockComponents: google.maps.GeocoderAddressComponent[] = [
      { long_name: '1600', short_name: '1600', types: ['street_number'] },
      { long_name: 'Pennsylvania Avenue NW', short_name: 'Pennsylvania Ave NW', types: ['route'] },
      { long_name: 'Washington', short_name: 'Washington', types: ['locality'] },
      { long_name: 'District of Columbia', short_name: 'DC', types: ['administrative_area_level_1'] },
      { long_name: '20500', short_name: '20500', types: ['postal_code'] }
    ];

    const result = parseAddressComponents(mockComponents);
    
    expect(result.addressLine1).toBe('1600 Pennsylvania Avenue NW');
    expect(result.city).toBe('Washington');
    expect(result.state).toBe('DC');
    expect(result.postalCode).toBe('20500');
  });

  it('should handle missing street number', () => {
    const mockComponents: google.maps.GeocoderAddressComponent[] = [
      { long_name: 'Main Street', short_name: 'Main St', types: ['route'] },
      { long_name: 'Springfield', short_name: 'Springfield', types: ['locality'] },
      { long_name: 'Illinois', short_name: 'IL', types: ['administrative_area_level_1'] },
      { long_name: '62701', short_name: '62701', types: ['postal_code'] }
    ];

    const result = parseAddressComponents(mockComponents);
    
    expect(result.addressLine1).toBe('Main Street');
    expect(result.city).toBe('Springfield');
    expect(result.state).toBe('IL');
  });

  it('should use fallback for city when locality is missing', () => {
    const mockComponents: google.maps.GeocoderAddressComponent[] = [
      { long_name: '123', short_name: '123', types: ['street_number'] },
      { long_name: 'Oak Avenue', short_name: 'Oak Ave', types: ['route'] },
      { long_name: 'Brooklyn', short_name: 'Brooklyn', types: ['sublocality'] },
      { long_name: 'New York', short_name: 'NY', types: ['administrative_area_level_1'] }
    ];

    const result = parseAddressComponents(mockComponents);
    
    expect(result.city).toBe('Brooklyn');
  });
});

describe('Address Validation', () => {
  it('should validate complete addresses', () => {
    const address = {
      addressLine1: '1600 Pennsylvania Ave NW',
      city: 'Washington',
      state: 'DC',
      postalCode: '20500'
    };

    const result = validateAddress(address);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation for missing street address', () => {
    const address = {
      addressLine1: '',
      city: 'Washington',
      state: 'DC'
    };

    const result = validateAddress(address);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Street address is required');
  });

  it('should fail validation for missing city', () => {
    const address = {
      addressLine1: '123 Main St',
      city: '',
      state: 'DC'
    };

    const result = validateAddress(address);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('City is required');
  });

  it('should fail validation for missing state', () => {
    const address = {
      addressLine1: '123 Main St',
      city: 'Washington',
      state: ''
    };

    const result = validateAddress(address);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('State is required');
  });

  it('should pass validation even without postal code', () => {
    const address = {
      addressLine1: '123 Main St',
      city: 'Washington',
      state: 'DC',
      postalCode: ''
    };

    const result = validateAddress(address);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Lead Data Validation', () => {
  it('should validate and transform complete lead data', () => {
    const leadData = {
      address: '1600 Pennsylvania Ave NW, Washington, DC 20500',
      addressLine1: '1600 Pennsylvania Ave NW',
      city: 'Washington',
      state: 'DC',
      postalCode: '20500',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      propertyCondition: 'good',
      timeline: '30days',
      askingPrice: '$425,000'
    };

    const result = validateAndTransformLead(leadData, true);
    
    expect(result.address).toBe('1600 Pennsylvania Ave NW, Washington, DC 20500');
    expect(result.addressLine1).toBe('1600 Pennsylvania Ave NW');
    expect(result.city).toBe('Washington');
    expect(result.state).toBe('DC');
    expect(result.postalCode).toBe('20500');
    expect(result.price).toBe(425000);
  });

  it('should validate partial lead data', () => {
    const leadData = {
      address: '1600 Pennsylvania Ave NW, Washington, DC 20500',
      phone: '(555) 123-4567',
      consent: true
    };

    const result = validateAndTransformLead(leadData, false);
    
    expect(result.address).toBe('1600 Pennsylvania Ave NW, Washington, DC 20500');
    expect(result.phone).toBe('(555) 123-4567');
    expect(result.consent).toBe(true);
  });

  it('should throw validation error for missing required fields', () => {
    const leadData = {
      address: '1600 Pennsylvania Ave NW',
      // Missing required fields
    };

    expect(() => validateAndTransformLead(leadData, true)).toThrow();
  });

  it('should throw validation error for invalid email', () => {
    const leadData = {
      address: '123 Main St',
      fullName: 'John Doe',
      email: 'not-an-email',
      phone: '(555) 123-4567',
      propertyCondition: 'good',
      timeline: '30days'
    };

    expect(() => validateAndTransformLead(leadData, true)).toThrow();
  });
});

describe('Integration: Form Submission Payload', () => {
  it('should create correct payload for API submission', () => {
    const formData = {
      address: '1600 Pennsylvania Ave NW, Washington, DC 20500',
      addressLine1: '1600 Pennsylvania Ave NW',
      city: 'Washington',
      state: 'DC',
      postalCode: '20500',
      placeId: 'ChIJGVtI4by3t4kRr51d_Qm_x58',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      propertyCondition: 'excellent',
      timeline: 'asap',
      askingPrice: '$425,000',
      source: 'offer-page',
      timestamp: '2024-01-01T00:00:00Z'
    };

    const validated = validateAndTransformLead(formData, true);
    
    // Check that all required fields are present
    expect(validated).toMatchObject({
      address: '1600 Pennsylvania Ave NW, Washington, DC 20500',
      addressLine1: '1600 Pennsylvania Ave NW',
      city: 'Washington',
      state: 'DC',
      postalCode: '20500',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      propertyCondition: 'excellent',
      timeline: 'asap',
      price: 425000
    });
  });
});