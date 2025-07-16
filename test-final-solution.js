/**
 * Test final solution: Store phone in custom field for partial submissions
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🚀 Testing Final Solution: Phone in Custom Field\n');

// Simulate the final formatFormData function
function formatFormData(formData) {
  const isPartial = formData.submissionType === 'partial';
  const hasName = formData.firstName || formData.lastName;
  
  let firstName = formData.firstName || '';
  let lastName = formData.lastName || '';
  
  if (isPartial && !hasName && formData.address) {
    const addressParts = formData.address.split(',')[0].trim();
    firstName = addressParts;
    lastName = `Lead ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}`;
  }
  
  let email = formData.email;
  if (isPartial && !formData.email) {
    email = `lead-${formData.leadId}@partial.placeholder`;
  }
  
  const ghlData = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: formData.phone,
    source: 'Website Form',
    tags: ['Website Lead', 'PPC', isPartial ? 'Partial Lead' : 'Complete Lead'],
    customField: {
      propertyAddress: formData.address,
      submissionType: formData.submissionType,
      leadId: formData.leadId,
      submissionTimestamp: new Date().toISOString(),
      originalEmail: formData.email || 'Not provided',
    }
  };
  
  // For partial submissions, store phone in custom field instead of main phone field
  if (isPartial && formData.phone) {
    ghlData.customField.phoneNumber = formData.phone;
    delete ghlData.phone; // Remove from main phone field
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
  
  // Only include email if it exists and has value
  if (!ghlData.email || !ghlData.email.trim()) {
    delete ghlData.email;
  }
  
  return ghlData;
}

// Generate unique leadId
function generateLeadId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Test multiple partial submissions with the same phone number
async function testFinalSolution() {
  const testPhone = '(555) 888-9999';
  const testCases = [
    {
      name: 'Partial Lead 1',
      address: '1111 Solution Street, Austin, TX 78701, USA',
      phone: testPhone,
      submissionType: 'partial'
    },
    {
      name: 'Partial Lead 2',
      address: '2222 Success Avenue, Dallas, TX 75001, USA',
      phone: testPhone,
      submissionType: 'partial'
    },
    {
      name: 'Partial Lead 3',
      address: '3333 Victory Road, Houston, TX 77001, USA',
      phone: testPhone,
      submissionType: 'partial'
    }
  ];
  
  console.log(`Testing with same phone for all partial leads: ${testPhone}\n`);
  console.log('Key: Phone will be stored in customField.phoneNumber\n');
  
  const createdContacts = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    const leadId = generateLeadId();
    
    const formData = {
      address: test.address,
      phone: test.phone,
      submissionType: test.submissionType,
      leadId: leadId,
      timestamp: new Date().toISOString()
    };
    
    console.log(`\n📋 Test ${i + 1}: ${test.name}`);
    console.log(`   Address: ${test.address}`);
    console.log(`   Lead ID: ${leadId}`);
    
    const ghlData = formatFormData(formData);
    
    console.log('GHL Data:', {
      firstName: ghlData.firstName,
      lastName: ghlData.lastName,
      email: ghlData.email,
      phone: ghlData.phone || 'Not in main field',
      'customField.phoneNumber': ghlData.customField.phoneNumber || 'Not stored'
    });
    
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(ghlData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('✅ Contact created successfully');
        console.log(`   Contact ID: ${responseData.contact.id}`);
        console.log(`   Name: ${responseData.contact.firstName} ${responseData.contact.lastName}`);
        createdContacts.push({
          id: responseData.contact.id,
          name: `${responseData.contact.firstName} ${responseData.contact.lastName}`,
          customFields: responseData.contact.customField || []
        });
      } else {
        console.log('❌ Failed:', responseData);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n📊 Final Results:');
  console.log(`Created ${createdContacts.length} contacts`);
  
  const uniqueIds = new Set(createdContacts.map(c => c.id));
  if (uniqueIds.size === createdContacts.length) {
    console.log('✅ SUCCESS! All contacts have unique IDs!');
  } else {
    console.log('❌ Some contacts were updated instead of created');
  }
  
  console.log('\nContact Details:');
  createdContacts.forEach((contact, index) => {
    console.log(`${index + 1}. ${contact.name}`);
    console.log(`   ID: ${contact.id}`);
  });
  
  console.log('\n🎯 Solution Summary:');
  console.log('1. Partial submissions store phone in customField.phoneNumber');
  console.log('2. Each submission creates a unique email: lead-{id}@partial.placeholder');
  console.log('3. Property address becomes the contact name');
  console.log('4. This prevents GoHighLevel from matching/updating existing contacts');
  console.log('\n💡 Next Step: Create a GoHighLevel workflow to:');
  console.log('   - Copy customField.phoneNumber to the main phone field');
  console.log('   - Update the placeholder email with the real email when available');
}

// Run the test
testFinalSolution().catch(console.error);