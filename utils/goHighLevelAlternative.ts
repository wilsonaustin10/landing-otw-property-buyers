interface GHLContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  source?: string;
  customField?: Record<string, any>;
  tags?: string[];
}

// Alternative approach: Make phone numbers unique by appending a timestamp
export function makePhoneUnique(phone: string, leadId: string): string {
  // Extract just digits from phone
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Get last 4 characters of leadId for uniqueness
  const uniqueSuffix = leadId.slice(-4);
  
  // Format as phone with extension
  // This creates a unique phone for each submission
  return `${phone} x${uniqueSuffix}`;
}

// Alternative formatFormData that creates unique phone numbers
export function formatFormDataWithUniquePhone(formData: any): GHLContactData {
  // For partial submissions without name, use address as identifier
  const isPartial = formData.submissionType === 'partial';
  const hasName = formData.firstName || formData.lastName;
  
  // Create a unique identifier based on address and timestamp
  let firstName = formData.firstName || '';
  let lastName = formData.lastName || '';
  
  if (isPartial && !hasName && formData.address) {
    // Use property address as the name for partial submissions
    const addressParts = formData.address.split(',')[0].trim(); // Get street address
    firstName = addressParts;
    lastName = `Lead ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`;
  }
  
  // Make phone unique to force new contact creation
  const uniquePhone = formData.phone ? makePhoneUnique(formData.phone, formData.leadId) : '';
  
  const ghlData: GHLContactData = {
    firstName: firstName,
    lastName: lastName,
    email: formData.email,
    phone: uniquePhone, // Use unique phone
    customField: {
      originalPhone: formData.phone, // Store original phone in custom field
      propertyAddress: formData.address,
      propertyCondition: formData.propertyCondition,
      timeframe: formData.timeframe,
      askingPrice: formData.price,
      isPropertyListed: formData.isPropertyListed,
      submissionType: formData.submissionType,
      leadId: formData.leadId,
      submissionTimestamp: new Date().toISOString(),
    },
    tags: ['Website Lead', 'PPC', formData.submissionType === 'partial' ? 'Partial Lead' : 'Complete Lead'],
  };

  // Parse address if available
  if (formData.address) {
    const addressParts = formData.address.split(',').map((part: string) => part.trim());
    if (addressParts.length >= 3) {
      ghlData.address1 = addressParts[0];
      ghlData.city = addressParts[1];
      const stateZip = addressParts[2].split(' ');
      if (stateZip.length >= 2) {
        ghlData.state = stateZip[0];
        ghlData.postalCode = stateZip[1];
      }
    }
  }

  return ghlData;
}