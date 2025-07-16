/**
 * Test the new naming convention and update functionality
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🧪 Testing New Naming Convention and Update Flow\n');

// Generate unique leadId
function generateLeadId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simulate the formatFormData function
function formatFormData(formData) {
  const isPartial = formData.submissionType === 'partial';
  const hasName = formData.firstName || formData.lastName;
  
  let firstName = formData.firstName || '';
  let lastName = formData.lastName || '';
  
  if (isPartial && !hasName) {
    // Use a simple numbering system for partial submissions
    const leadIdNumbers = formData.leadId.match(/\d+/g);
    const uniqueNumber = leadIdNumbers ? leadIdNumbers[0].slice(-6) : Date.now().toString().slice(-6);
    
    firstName = `New${uniqueNumber}`;
    lastName = `Lead${uniqueNumber}`;
  }
  
  // Handle email for different submission types
  let email = formData.email;
  if (isPartial && !formData.email) {
    email = `lead-${formData.leadId}@partial.placeholder`;
  } else if (!isPartial && formData.leadId && formData.submissionType === 'complete') {
    // For complete submissions, use the same placeholder email to update the partial lead
    email = `lead-${formData.leadId}@partial.placeholder`;
  }
  
  const ghlData = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: formData.phone,
    source: 'Website Form',
    tags: ['Website Lead', 'PPC', formData.submissionType === 'partial' ? 'Partial Lead' : 'Complete Lead'],
    customField: {
      propertyAddress: formData.address,
      propertyCondition: formData.propertyCondition || '',
      timeframe: formData.timeframe || '',
      askingPrice: formData.price || '',
      isPropertyListed: formData.isPropertyListed || false,
      submissionType: formData.submissionType,
      leadId: formData.leadId,
      submissionTimestamp: new Date().toISOString(),
      originalEmail: formData.email || 'Not provided',
      realEmail: (!isPartial && formData.submissionType === 'complete' && formData.email) ? formData.email : undefined,
    }
  };
  
  // For partial submissions, store phone in custom field
  if (isPartial && formData.phone) {
    ghlData.customField.phoneNumber = formData.phone;
    delete ghlData.phone;
  } else if (!isPartial && formData.submissionType === 'complete') {
    // For complete submissions, include the real phone
    ghlData.phone = formData.phone;
    ghlData.customField.submissionType = 'complete';
    ghlData.tags = ['Website Lead', 'PPC', 'Complete Lead'];
  }
  
  // Parse address
  if (formData.address) {
    const addressParts = formData.address.split(',').map(part => part.trim());
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
  
  // Only include fields with values
  Object.keys(ghlData).forEach(key => {
    if (ghlData[key] === '' || ghlData[key] === undefined) {
      delete ghlData[key];
    }
  });
  
  return ghlData;
}

// Test the complete flow
async function testCompleteFlow() {
  const leadId = generateLeadId();
  const testAddress = '5555 Update Test Lane, Austin, TX 78701, USA';
  const testPhone = '(512) 555-1234';
  
  console.log(`Testing with Lead ID: ${leadId}\n`);
  
  // Step 1: Create partial lead
  console.log('📋 Step 1: Creating Partial Lead');
  const partialData = {
    address: testAddress,
    phone: testPhone,
    submissionType: 'partial',
    leadId: leadId,
    timestamp: new Date().toISOString()
  };
  
  const partialGhlData = formatFormData(partialData);
  console.log('Partial Lead Data:', {
    firstName: partialGhlData.firstName,
    lastName: partialGhlData.lastName,
    email: partialGhlData.email,
    phone: partialGhlData.phone || 'In custom field',
    'customField.phoneNumber': partialGhlData.customField.phoneNumber
  });
  
  let contactId;
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(partialGhlData)
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      contactId = responseData.contact.id;
      console.log('✅ Partial lead created successfully');
      console.log(`   Contact ID: ${contactId}`);
      console.log(`   Name: ${responseData.contact.firstName} ${responseData.contact.lastName}`);
    } else {
      console.log('❌ Failed to create partial lead:', responseData);
      return;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 2: Complete the form
  console.log('\n📋 Step 2: Completing the Form (Full Submission)');
  const completeData = {
    address: testAddress,
    phone: testPhone,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    propertyCondition: 'Good',
    timeframe: '1-3 months',
    price: '$350,000',
    isPropertyListed: false,
    submissionType: 'complete',
    leadId: leadId, // Same leadId to link with partial
    timestamp: new Date().toISOString()
  };
  
  const completeGhlData = formatFormData(completeData);
  console.log('Complete Form Data:', {
    firstName: completeGhlData.firstName,
    lastName: completeGhlData.lastName,
    email: completeGhlData.email,
    phone: completeGhlData.phone,
    submissionType: completeGhlData.customField.submissionType
  });
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(completeGhlData)
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Form completed successfully');
      console.log(`   Contact ID: ${responseData.contact.id}`);
      console.log(`   Name: ${responseData.contact.firstName} ${responseData.contact.lastName}`);
      console.log(`   Email: ${responseData.contact.email}`);
      
      // Check if it's the same contact or a new one
      if (responseData.contact.id === contactId) {
        console.log('   ✅ SUCCESS: Same contact was updated!');
      } else {
        console.log('   ⚠️  WARNING: A new contact was created instead of updating');
      }
    } else {
      console.log('❌ Failed to complete form:', responseData);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n📊 Summary:');
  console.log('- Partial leads use format: New123456 Lead123456');
  console.log('- Complete forms should update the partial lead with real name/email');
  console.log('- The placeholder email links partial and complete submissions');
  console.log('\n💡 Note: GoHighLevel will match by email, so the complete form');
  console.log('   submission will update the partial lead if using the same email format.');
}

// Run the test
testCompleteFlow().catch(console.error);