/**
 * Test using timestamp-based unique emails for creating unique leads
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🧪 Testing Unique Lead Creation with Timestamp Emails\n');

// Simulate the updated formatFormData function
function formatFormData(formData) {
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
  
  // For partial submissions, create a unique email using timestamp to force new contact creation
  let email = formData.email;
  if (isPartial && !formData.email) {
    // Create a unique email using leadId (which includes timestamp)
    // This ensures each partial submission creates a new contact
    email = `lead-${formData.leadId}@partial.placeholder`;
  }
  
  const ghlData = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: formData.phone,
    source: 'Website Form',
    tags: ['Website Lead', 'PPC', 'Partial Lead'],
    customField: {
      propertyAddress: formData.address,
      submissionType: formData.submissionType,
      leadId: formData.leadId,
      submissionTimestamp: new Date().toISOString(),
      originalEmail: formData.email || 'Not provided',
    }
  };
  
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
  
  return ghlData;
}

// Generate unique leadId like the API does
function generateLeadId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Test multiple partial submissions with the same phone number
async function testUniqueLeads() {
  const testPhone = '(555) 000-0002';
  const addresses = [
    '111 First Street, Austin, TX 78701, USA',
    '222 Second Avenue, Dallas, TX 75001, USA',
    '333 Third Road, Houston, TX 77001, USA'
  ];
  
  console.log(`Testing with same phone for all: ${testPhone}\n`);
  
  const createdContacts = [];
  
  for (let i = 0; i < addresses.length; i++) {
    const leadId = generateLeadId();
    const formData = {
      address: addresses[i],
      phone: testPhone,
      submissionType: 'partial',
      leadId: leadId,
      timestamp: new Date().toISOString()
    };
    
    console.log(`\n📋 Test ${i + 1}: Creating lead for ${addresses[i]}`);
    console.log(`   Lead ID: ${leadId}`);
    
    // Format the data
    const ghlData = formatFormData(formData);
    
    console.log('Formatted data:', {
      firstName: ghlData.firstName,
      lastName: ghlData.lastName,
      email: ghlData.email,
      phone: ghlData.phone,
      address1: ghlData.address1
    });
    
    // Send to GoHighLevel
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
        console.log('✅ Lead created successfully');
        console.log(`   Contact ID: ${responseData.contact.id}`);
        console.log(`   Name: ${responseData.contact.firstName} ${responseData.contact.lastName}`);
        console.log(`   Email: ${responseData.contact.email}`);
        createdContacts.push({
          id: responseData.contact.id,
          name: `${responseData.contact.firstName} ${responseData.contact.lastName}`,
          email: responseData.contact.email
        });
      } else {
        console.log('❌ Failed to create lead:', responseData);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    // Wait between submissions
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n📊 Results Summary:');
  console.log(`Created ${createdContacts.length} contacts:`);
  
  // Check if all contact IDs are unique
  const uniqueIds = new Set(createdContacts.map(c => c.id));
  if (uniqueIds.size === createdContacts.length) {
    console.log('✅ All contacts have unique IDs - SUCCESS!');
  } else {
    console.log('❌ Some contacts share the same ID - they were updated instead of created');
  }
  
  console.log('\nCreated contacts:');
  createdContacts.forEach((contact, index) => {
    console.log(`${index + 1}. ${contact.name} - ${contact.email} (ID: ${contact.id})`);
  });
  
  console.log('\n💡 Key Points:');
  console.log('- Each partial submission gets a unique placeholder email');
  console.log('- The email format is: lead-{leadId}@partial.placeholder');
  console.log('- This forces GoHighLevel to create new contacts');
  console.log('- The original email (if any) is stored in customField.originalEmail');
}

// Run the test
testUniqueLeads().catch(console.error);