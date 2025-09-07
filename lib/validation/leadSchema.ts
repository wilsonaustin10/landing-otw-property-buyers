import { z } from 'zod';

/**
 * Parse and sanitize price input
 * Accepts: "425000", "425,000", "$425,000", "425K", etc.
 * Returns: numeric value or null
 */
export function parsePrice(input: string | number | undefined | null): number | null {
  if (input === undefined || input === null || input === '') {
    return null;
  }
  
  if (typeof input === 'number') {
    return input;
  }
  
  // Remove currency symbols, commas, and spaces
  let cleaned = input.toString()
    .replace(/[$,\s]/g, '')
    .trim();
  
  // Handle K/M suffixes
  const multipliers: Record<string, number> = {
    'k': 1000,
    'K': 1000,
    'm': 1000000,
    'M': 1000000
  };
  
  const lastChar = cleaned.slice(-1);
  if (multipliers[lastChar]) {
    cleaned = cleaned.slice(0, -1);
    const baseValue = parseFloat(cleaned);
    if (!isNaN(baseValue)) {
      return baseValue * multipliers[lastChar];
    }
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Format phone number to standard format
 */
export function formatPhoneForStorage(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // Return as-is if not 10 digits
}

/**
 * Zod schema for address validation
 */
export const addressSchema = z.object({
  addressLine1: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().optional(),
  placeId: z.string().optional(),
  formattedAddress: z.string().optional()
});

/**
 * Zod schema for complete lead submission (/offer page)
 */
export const completeLeadSchema = z.object({
  // Address fields
  address: z.string().min(1, 'Address is required'),
  addressLine1: z.string().optional(), // Will be extracted from address
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  placeId: z.string().optional(),
  
  // Contact fields
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  
  // Property details
  propertyCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
  timeline: z.enum(['asap', '30days', '60days', '90days', 'flexible']),
  askingPrice: z.string().optional(),
  
  // Metadata
  source: z.string().optional(),
  timestamp: z.string().optional()
});

/**
 * Zod schema for partial lead submission (initial form)
 */
export const partialLeadSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  placeId: z.string().optional(),
  
  phone: z.string().min(10, 'Phone number is required'),
  consent: z.boolean().refine(val => val === true, {
    message: 'Consent is required'
  }),
  
  lastUpdated: z.string().optional(),
  leadId: z.string().optional()
});

/**
 * Transform and validate lead data
 */
export function validateAndTransformLead(data: any, isComplete = true) {
  const schema = isComplete ? completeLeadSchema : partialLeadSchema;
  
  // Parse the data with Zod
  const validated = schema.parse(data);
  
  // Transform price if present
  if ('askingPrice' in validated && validated.askingPrice) {
    const numericPrice = parsePrice(validated.askingPrice);
    return {
      ...validated,
      price: numericPrice,
      askingPrice: validated.askingPrice // Keep original for reference
    };
  }
  
  return validated;
}

export type CompleteLeadData = z.infer<typeof completeLeadSchema> & {
  price?: number | null;
};

export type PartialLeadData = z.infer<typeof partialLeadSchema>;