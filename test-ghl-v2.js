/**
 * Test Go High Level V2 API
 * Testing different endpoint and auth methods
 */

require('dotenv').config();

const JWT_TOKEN = process.env.GHL_API_KEY;

// Test endpoints
const endpoints = [
  {
    name: 'V1 Endpoint (current)',
    url: 'https://services.leadconnectorhq.com/contacts/',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    }
  },
  {
    name: 'V2 Endpoint',
    url: 'https://api.gohighlevel.com/v2/contacts',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    }
  },
  {
    name: 'V1 without Version header',
    url: 'https://services.leadconnectorhq.com/contacts/',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    name: 'V2 without Version header',
    url: 'https://api.gohighlevel.com/v2/contacts',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
];

// Parse JWT to get location ID
let locationId = '';
try {
  const parts = JWT_TOKEN.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  locationId = payload.location_id || '';
  console.log('🔍 Extracted location ID:', locationId);
} catch (e) {
  console.error('Failed to parse JWT');
}

async function testEndpoint(config) {
  console.log(`\n📋 Testing ${config.name}...`);
  console.log(`   URL: ${config.url}`);
  
  const testData = {
    firstName: 'Test',
    lastName: 'V2API',
    email: `test-${Date.now()}@example.com`,
    phone: '+1234567890',
    locationId: locationId,
    source: 'API Test'
  };
  
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: config.headers,
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
      console.log(`   ✅ Success! Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(responseData, null, 2).substring(0, 200) + '...');
      return true;
    } else {
      console.log(`   ❌ Failed! Status: ${response.status}`);
      console.log(`   Error:`, responseData);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Network error:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Go High Level API Endpoint Tests');
  console.log('=====================================');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  }
  
  console.log('\n📝 Summary:');
  console.log('If all endpoints fail with "Invalid JWT", the token itself is the issue.');
  console.log('You may need to:');
  console.log('1. Verify you have the correct permissions in GHL');
  console.log('2. Check if the API key is for the correct location');
  console.log('3. Ensure the API key has not been revoked');
  console.log('4. Try creating a new API key with full permissions');
}

runTests();