/**
 * Test that partial submissions create unique leads in GoHighLevel
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🧪 Testing Unique Lead Creation\n');

// Simulate the formatFormData function
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
  
  const ghlData = {
    firstName: firstName,
    lastName: lastName,
    phone: formData.phone,
    source: 'Website Form',
    tags: ['Website Lead', 'PPC', 'Partial Lead'],
    customField: {
      propertyAddress: formData.address,
      submissionType: formData.submissionType,
      leadId: formData.leadId,
      submissionTimestamp: new Date().toISOString(),
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
  
  // Only include email if it exists
  if (formData.email && formData.email.trim()) {
    ghlData.email = formData.email;
  }
  
  return ghlData;
}

// Test multiple partial submissions with the same phone number
async function testUniqueLeads() {
  const testPhone = '(555) 000-0001';
  const addresses = [
    '123 Main Street, Austin, TX 78701, USA',
    '456 Oak Avenue, Dallas, TX 75001, USA',
    '789 Pine Road, Houston, TX 77001, USA'
  ];
  
  console.log(`Testing with phone: ${testPhone}\n`);
  
  for (let i = 0; i < addresses.length; i++) {
    const formData = {
      address: addresses[i],
      phone: testPhone,
      submissionType: 'partial',
      leadId: `test_${Date.now()}_${i}`,
      timestamp: new Date().toISOString()
    };
    
    console.log(`\n📋 Test ${i + 1}: Creating lead for ${addresses[i]}`);
    
    // Format the data
    const ghlData = formatFormData(formData);
    
    console.log('Formatted data:', {
      firstName: ghlData.firstName,
      lastName: ghlData.lastName,
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
      } else {
        console.log('❌ Failed to create lead:', responseData);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    // Wait between submissions
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n📝 Summary:');
  console.log('Each partial submission should create a unique lead with:');
  console.log('- Property address as the first name');
  console.log('- "Lead [timestamp]" as the last name');
  console.log('- This prevents GoHighLevel from updating existing leads');
  console.log('\nCheck your GoHighLevel dashboard to verify all leads were created separately.');
}

// Run the test
testUniqueLeads().catch(console.error);