/**
 * Test alternative GoHighLevel authentication methods
 * Some accounts use API keys instead of JWT tokens
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_GHL_ENDPOINT;

// Extract location ID from JWT if it's a JWT
let locationId = 'ecoPNd0lv0NmCRDLDZHt'; // Your known location ID
if (API_KEY && API_KEY.startsWith('eyJ')) {
  try {
    const payload = JSON.parse(Buffer.from(API_KEY.split('.')[1], 'base64').toString());
    locationId = payload.location_id || locationId;
  } catch (e) {}
}

console.log('🔍 Testing Alternative GHL Authentication Methods\n');
console.log(`Location ID: ${locationId}`);
console.log(`API Key type: ${API_KEY.startsWith('eyJ') ? 'JWT Token' : 'API Key'}\n`);

// Test data
const testData = {
  firstName: 'Test',
  lastName: 'Alternative',
  email: `test-${Date.now()}@example.com`,
  phone: '+15551234567',
  locationId: locationId,
  source: 'Alternative Auth Test'
};

// Different authentication approaches
const authMethods = [
  {
    name: 'API Key as Bearer Token',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    name: 'API Key in Custom Header',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    name: 'API Key as Token (no Bearer)',
    headers: {
      'Authorization': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    name: 'Using Location ID in Authorization',
    headers: {
      'Authorization': `Bearer ${locationId}:${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
];

// Test OAuth2 endpoint
async function testOAuth2() {
  console.log('📋 Testing OAuth2 Token Endpoint...\n');
  
  const oauth2Endpoints = [
    'https://services.leadconnectorhq.com/oauth/token',
    'https://api.gohighlevel.com/oauth/token',
    'https://rest.gohighlevel.com/v1/oauth/token'
  ];
  
  for (const endpoint of oauth2Endpoints) {
    console.log(`Testing: ${endpoint}`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'client_id': locationId,
          'client_secret': API_KEY
        })
      });
      
      const data = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }
}

// Test different auth methods
async function testAuthMethods() {
  console.log('📋 Testing Authentication Methods...\n');
  
  for (const method of authMethods) {
    console.log(`Testing: ${method.name}`);
    
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: method.headers,
        body: JSON.stringify(testData)
      });
      
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS! Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(responseData).substring(0, 100) + '...');
      } else {
        console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
        console.log(`   Error:`, JSON.stringify(responseData).substring(0, 100));
      }
    } catch (error) {
      console.log(`   ❌ Network error:`, error.message);
    }
    console.log('');
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Go High Level Alternative Authentication Tests');
  console.log('================================================\n');
  
  // Test OAuth2 first
  await testOAuth2();
  
  // Then test direct API methods
  await testAuthMethods();
  
  console.log('\n📝 Recommendations:');
  console.log('1. If all methods fail, the issue is likely:');
  console.log('   - The API key/token format is incorrect for your account type');
  console.log('   - Your account uses a different authentication method');
  console.log('   - The location ID is incorrect');
  console.log('2. Contact GHL support and ask:');
  console.log('   - "What authentication method should I use for API access?"');
  console.log('   - "Is my account using JWT tokens or API keys?"');
  console.log('   - "Are millisecond timestamps expected in JWT tokens?"');
  console.log('3. Try using their API documentation:');
  console.log('   https://highlevel.stoplight.io/docs/integrations/');
}

runTests();