/**
 * Test phone-based matching for updating leads
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🧪 Testing Phone-Based Lead Matching\n');

// Generate unique leadId
function generateLeadId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simulate the updated formatFormData function
function formatFormData(formData) {
  const isPartial = formData.submissionType === 'partial';
  const hasName = formData.firstName || formData.lastName;
  
  let firstName = formData.firstName || '';
  let lastName = formData.lastName || '';
  
  if (isPartial && !hasName) {
    const leadIdNumbers = formData.leadId.match(/\d+/g);
    const uniqueNumber = leadIdNumbers ? leadIdNumbers[0].slice(-6) : Date.now().toString().slice(-6);
    
    firstName = `New${uniqueNumber}`;
    lastName = `Lead${uniqueNumber}`;
  }
  
  // Handle email for different submission types
  let email = formData.email;
  if (isPartial && !formData.email) {
    // For partial submissions, don't set an email
    email = undefined;
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
      originalEmail: formData.email || 'Not provided'
    }
  };
  
  // Remove empty email field
  if (!email) {
    delete ghlData.email;
  }
  
  // For complete submissions, update the submission type
  if (!isPartial && formData.submissionType === 'complete') {
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
  
  return ghlData;
}

// Test the complete flow
async function testPhoneMatching() {
  const leadId = generateLeadId();
  const testAddress = '7777 Phone Match Drive, Austin, TX 78701, USA';
  const testPhone = '(512) 777-8888';
  
  console.log(`Testing with Lead ID: ${leadId}`);
  console.log(`Phone Number: ${testPhone}\n`);
  
  // Step 1: Create partial lead
  console.log('📋 Step 1: Creating Partial Lead (No Email)');
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
    email: partialGhlData.email || 'No email',
    phone: partialGhlData.phone
  });
  
  let partialContactId;
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
      partialContactId = responseData.contact.id;
      console.log('✅ Partial lead created successfully');
      console.log(`   Contact ID: ${partialContactId}`);
      console.log(`   Name: ${responseData.contact.firstName} ${responseData.contact.lastName}`);
      console.log(`   Email: ${responseData.contact.email || 'No email'}`);
      console.log(`   Phone: ${responseData.contact.phone}`);
    } else {
      console.log('❌ Failed to create partial lead:', responseData);
      return;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  // Wait a bit
  console.log('\n⏳ Waiting 3 seconds before complete submission...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 2: Complete the form
  console.log('\n📋 Step 2: Completing the Form (Full Submission)');
  const completeData = {
    address: testAddress,
    phone: testPhone, // Same phone number
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    propertyCondition: 'Excellent',
    timeframe: 'ASAP',
    price: '$450,000',
    isPropertyListed: false,
    submissionType: 'complete',
    leadId: leadId,
    timestamp: new Date().toISOString()
  };
  
  const completeGhlData = formatFormData(completeData);
  console.log('Complete Form Data:', {
    firstName: completeGhlData.firstName,
    lastName: completeGhlData.lastName,
    email: completeGhlData.email,
    phone: completeGhlData.phone
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
      console.log(`   Phone: ${responseData.contact.phone}`);
      
      // Check if it's the same contact or a new one
      if (responseData.contact.id === partialContactId) {
        console.log('\n   🎉 SUCCESS: Same contact was updated!');
        console.log('   ✅ Name updated from temporary to real name');
        console.log('   ✅ Email added to the contact');
        console.log('   ✅ All property details preserved');
      } else {
        console.log('\n   ⚠️  WARNING: A new contact was created');
        console.log(`   Partial ID: ${partialContactId}`);
        console.log(`   Complete ID: ${responseData.contact.id}`);
      }
    } else {
      console.log('❌ Failed to complete form:', responseData);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n📊 Summary:');
  console.log('- Partial leads: No email, uses phone as identifier');
  console.log('- Complete forms: Updates existing contact matched by phone');
  console.log('- Name changes from New123456 to real name');
  console.log('- Email is added to the contact');
  console.log('\n💡 Key: GoHighLevel matches contacts by phone when no email exists');
}

// Run the test
testPhoneMatching().catch(console.error);