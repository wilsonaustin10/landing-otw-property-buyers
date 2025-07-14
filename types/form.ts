/**
 * Interface for form data based on actual data collection fields
 */
export interface LeadFormData {
  // Address fields (required)
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;

  // Contact information (required)
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;

  // Property details
  bedrooms?: string;
  bathrooms?: string;
  squareFeet?: string;
  isPropertyListed?: boolean;
  propertyCondition?: string;
  timeframe?: string;
  price?: string;

  // System tracking
  timestamp?: string;
  lastUpdated?: string;
  leadId?: string;
}

/**
 * Type for tracking form submission metadata
 */
export interface FormSubmissionContext {
  timestamp: string;
  requestId: string;
  ipAddress?: string;
  leadId?: string;
}

export interface FormErrors {
  address?: string;
  phone?: string;
  consent?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  propertyCondition?: string;
  timeframe?: string;
  price?: string;
} 