/**
 * Test GoHighLevel V1 API with correct endpoint and format
 * Based on official GHL documentation
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🚀 Testing GoHighLevel V1 API\n');
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`API Key: ${API_KEY.substring(0, 20)}...${API_KEY.substring(API_KEY.length - 10)}\n`);

// Test simple contact creation
async function testSimpleContact() {
  console.log('📋 Test 1: Simple Contact Creation');
  
  const contactData = {
    firstName: 'Test',
    lastName: 'Contact',
    email: `test-${Date.now()}@example.com`,
    phone: '+15551234567',
    source: 'V1 API Test'
  };
  
  console.log('Request body:', JSON.stringify(contactData, null, 2));
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(contactData)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Success! Contact created.');
      return true;
    } else {
      console.log('❌ Failed to create contact.');
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

// Test with full contact data
async function testFullContact() {
  console.log('\n\n📋 Test 2: Full Contact with Address and Tags');
  
  const contactData = {
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe-${Date.now()}@example.com`,
    phone: '(555) 123-4567',
    address1: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90001',
    source: 'Website Form',
    tags: ['Website Lead', 'Partial Lead'],
    customField: {
      propertyAddress: '123 Main Street, Los Angeles, CA 90001',
      propertyCondition: 'Good',
      timeframe: '3-6 months',
      askingPrice: '$500,000'
    }
  };
  
  console.log('Request body:', JSON.stringify(contactData, null, 2));
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(contactData)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Success! Full contact created.');
      return true;
    } else {
      console.log('❌ Failed to create full contact.');
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

// Test partial form submission
async function testPartialSubmission() {
  console.log('\n\n📋 Test 3: Partial Form Submission');
  
  const contactData = {
    phone: '(830) 357-7161',
    address1: '444444 Northridge Dr',
    city: 'Vinita',
    state: 'OK',
    postalCode: '74301',
    source: 'Website Form - Partial',
    tags: ['Website Lead', 'Partial Lead']
  };
  
  console.log('Request body:', JSON.stringify(contactData, null, 2));
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(contactData)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    console.log(`\nStatus: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ Success! Partial submission created.');
      return true;
    } else {
      console.log('❌ Failed to create partial submission.');
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  await testSimpleContact();
  await testFullContact();
  await testPartialSubmission();
  
  console.log('\n\n📝 Summary:');
  console.log('If tests are failing with "Invalid JWT", the issue is still the millisecond timestamps.');
  console.log('If tests are failing with other errors, check the error messages for clues.');
  console.log('\n🔧 Next Steps:');
  console.log('1. If all tests pass, restart your Next.js dev server to use the new endpoint');
  console.log('2. If tests fail, contact GHL support about the timestamp issue');
  console.log('3. Consider using their OAuth2 flow or requesting a non-JWT API key');
}

runTests();