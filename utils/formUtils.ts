import debounce from 'lodash/debounce';
import { FormState } from '../types';

interface FormData {
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  phone?: string;
  email?: string;
  propertyCondition?: string;
  timeframe?: string;
  askingPrice?: string;
}

// Track last submission time to prevent duplicate submissions
const SUBMISSION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
let lastSubmissionTime: { [key: string]: number } = {};

// Save form data to localStorage
const saveToLocalStorage = (formId: string, data: Partial<FormData>): boolean => {
  try {
    const existingData = localStorage.getItem(formId);
    const updatedData = {
      ...JSON.parse(existingData || '{}'),
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(formId, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Check if enough time has passed since last submission
const canSubmitToCRM = (formId: string): boolean => {
  const now = Date.now();
  const lastSubmission = lastSubmissionTime[formId] || 0;
  return now - lastSubmission >= SUBMISSION_COOLDOWN;
};

// Generate unique key for form data to prevent duplicate submissions
const generateDataKey = (formData: Partial<FormData>): string => {
  const relevantData = {
    address: formData.address,
    phone: formData.phone,
    email: formData.email
  };
  return JSON.stringify(relevantData);
};

// Send partial form data to CRM with retry logic
const sendToCRM = async (formData: Partial<FormData>, retryCount = 0): Promise<boolean> => {
  try {
    const response = await fetch('/api/partial-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        tempEmail: localStorage.getItem('tempEmail'),
        source: typeof window !== 'undefined' ? window.location.href : '',
        submissionType: 'partial',
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send to CRM: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    if (responseData.data?.contact?.email?.includes('@gmail.com')) {
      localStorage.setItem('tempEmail', responseData.data.contact.email);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending to CRM:', error);
    
    // Retry logic for network errors
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return sendToCRM(formData, retryCount + 1);
    }
    
    return false;
  }
};

// Track partial submission in analytics
const trackPartialSubmission = (formData: Partial<FormData>): void => {
  try {
    // Google Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'partial_form_submission', {
        event_category: 'Lead',
        event_label: 'Partial Form Submit',
        value: Object.keys(formData).length,
        nonInteraction: true
      });
    }
    
    // Facebook Pixel event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'PartialFormSubmission', {
        content_name: 'Partial Lead Form',
        content_category: 'Lead',
        num_fields: Object.keys(formData).length,
        fields_completed: Object.keys(formData).join(',')
      });
    }
  } catch (error) {
    console.error('Error tracking analytics:', error);
  }
};

// Optimize timeouts and add request batching
const AUTOSAVE_DELAY = 15000; // Reduced to 15 seconds for better UX
const BATCH_INTERVAL = 30000; // 30 seconds for batching requests
let pendingSubmissions: Partial<FormData>[] = [];

// Enhanced validation
const validateFormData = (data: Partial<FormData>): boolean => {
  if (data.phone && !/^\+?[\d\s-()]{10,}$/.test(data.phone)) return false;
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return false;
  return true;
};

// Enhanced analytics tracking
const trackFormInteraction = (formData: Partial<FormData>, action: string): void => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: 'Lead Form',
        event_label: Object.keys(formData).join(','),
        value: Object.keys(formData).length
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', action, {
        content_name: 'Lead Form',
        content_category: 'Lead',
        fields_completed: Object.keys(formData).join(',')
      });
    }

    // Hotjar
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('event', action);
      (window as any).hj('trigger', 'form_interaction');
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Optimized auto-save with batching
export const autoSaveForm = debounce(async (formId: string, formData: Partial<FormData>): Promise<void> => {
  if (!validateFormData(formData)) {
    console.warn('Invalid form data detected');
    return;
  }

  // Track interaction
  trackFormInteraction(formData, 'form_field_update');

  // Save to localStorage
  const savedLocally = saveToLocalStorage(formId, formData);
  
  if ((formData.address || formData.phone) && canSubmitToCRM(formId)) {
    pendingSubmissions.push(formData);
    
    // Process batch if it's time or we have enough submissions
    if (pendingSubmissions.length >= 3 || Date.now() - lastBatchTime >= BATCH_INTERVAL) {
      await processBatch(formId);
    }
  }
}, AUTOSAVE_DELAY);

// Batch processing
let lastBatchTime = Date.now();
const processBatch = async (formId: string): Promise<void> => {
  if (pendingSubmissions.length === 0) return;

  const submissions = [...pendingSubmissions];
  pendingSubmissions = [];
  lastBatchTime = Date.now();

  try {
    const results = await Promise.allSettled(
      submissions.map(data => sendToCRM(data))
    );
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        trackFormInteraction(submissions[index], 'partial_submission_success');
      } else {
        console.error('Batch submission failed:', result);
      }
    });
  } catch (error) {
    console.error('Batch processing error:', error);
  }
};

// Function to retrieve saved form data
export const getSavedFormData = (formId: string): Partial<FormData> => {
  try {
    const savedData = localStorage.getItem(formId);
    return savedData ? JSON.parse(savedData) : {};
  } catch {
    return {};
  }
};

// Function to clear saved form data
export const clearSavedFormData = (formId: string): void => {
  try {
    localStorage.removeItem(formId);
    localStorage.removeItem(`${formId}_submitted`);
    delete lastSubmissionTime[formId];
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
};

// Timeout duration in milliseconds
const PARTIAL_LEAD_TIMEOUT = 60000; // 1 minute

// Enhanced partial lead capture with validation
export function setupPartialLeadCapture(formState: FormState) {
  // Start capture only if we have both required fields
  if (!formState.address || !formState.phone) {
    return () => {};
  }

  let isSubmitted = false;
  const captureTimeout = 60000; // 1 minute fixed timeout for abandonment

  const timeoutId = setTimeout(async () => {
    if (isSubmitted) return;

    // Only capture if form is incomplete (no contact info)
    const isIncomplete = !formState.firstName && !formState.lastName && !formState.email;
    
    if (isIncomplete) {
      try {
        const response = await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: formState.address,
            phone: formState.phone,
            lastUpdated: new Date().toISOString(),
            submissionType: 'partial',
            captureType: 'abandoned',
            timeOnPage: Date.now() - (window as any).pageLoadTime || 0
          })
        });

        if (!response.ok) throw new Error('Failed to capture partial lead');
        
        isSubmitted = true;
        trackFormInteraction(formState, 'partial_lead_captured');
      } catch (error) {
        console.error('Partial lead capture error:', error);
        trackFormInteraction(formState, 'partial_lead_capture_failed');
      }
    }
  }, captureTimeout);

  return () => {
    clearTimeout(timeoutId);
    isSubmitted = true;
  };
}

// Calculate lead quality score based on available data
function calculateLeadScore(formState: FormState): number {
  let score = 0;
  
  // Core fields
  if (formState.address) score += 30;
  if (formState.phone) score += 30;
  
  // Additional fields
  if (formState.propertyCondition) score += 10;
  if (formState.timeframe) score += 10;
  if (formState.price) score += 10;
  
  // Contact info
  if (formState.email) score += 5;
  if (formState.firstName) score += 2.5;
  if (formState.lastName) score += 2.5;
  
  return score;
}

// Calculate dynamic timeout based on user interaction
function calculateDynamicTimeout(formState: FormState): number {
  const fieldsCompleted = Object.keys(formState).filter(key => Boolean(formState[key as keyof FormState])).length;
  const baseAdjustment = 15000; // 15 seconds per field
  return fieldsCompleted * baseAdjustment;
} 