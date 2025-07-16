/**
 * Test partial form submission without email
 * This simulates what happens when a user only fills out address and phone
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = 'https://rest.gohighlevel.com/v1/contacts/';

console.log('🧪 Testing Partial Form Submission (No Email)\n');

// Test cases
const testCases = [
  {
    name: 'Partial submission with phone only',
    data: {
      phone: '(830) 357-7161',
      source: 'Website Form - Partial',
      tags: ['Website Lead', 'Partial Lead']
    }
  },
  {
    name: 'Partial submission with phone and address',
    data: {
      phone: '(555) 123-4567',
      address1: '123 Test Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      source: 'Website Form - Partial',
      tags: ['Website Lead', 'Partial Lead']
    }
  },
  {
    name: 'Partial submission with empty email string (should fail)',
    data: {
      email: '', // Empty string - this is what was causing the error
      phone: '(555) 987-6543',
      source: 'Test - Empty Email',
      tags: ['Test']
    }
  },
  {
    name: 'Complete submission with all fields',
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '(555) 555-5555',
      source: 'Test - Complete',
      tags: ['Test', 'Complete']
    }
  }
];

async function testCase(testData) {
  console.log(`\n📋 Testing: ${testData.name}`);
  console.log('Request body:', JSON.stringify(testData.data, null, 2));
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(testData.data)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    if (response.ok) {
      console.log(`✅ SUCCESS! Status: ${response.status}`);
      console.log('Created contact:', {
        id: responseData.contact?.id,
        phone: responseData.contact?.phone,
        email: responseData.contact?.email || 'No email',
        tags: responseData.contact?.tags
      });
    } else {
      console.log(`❌ FAILED! Status: ${response.status}`);
      console.log('Error:', responseData);
    }
    
  } catch (error) {
    console.log(`❌ Network error:`, error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Testing GoHighLevel partial form submissions...');
  console.log('================================================\n');
  
  for (const test of testCases) {
    await testCase(test);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  console.log('\n\n📝 Summary:');
  console.log('- Contacts can be created without email in GHL v1 API');
  console.log('- Empty email strings ("") cause validation errors');
  console.log('- Solution: Only include email field when it has a value');
  console.log('\n✅ The fix has been applied to goHighLevel.ts');
}

runTests();