/**
 * Test Go High Level with correct V2 endpoint structure
 * V2 endpoints require the location ID in the URL
 */

require('dotenv').config();

const JWT_TOKEN = process.env.GHL_API_KEY;

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

// Test data
const testData = {
  firstName: 'Test',
  lastName: 'Contact',
  email: `test-${Date.now()}@example.com`,
  phone: '+15555551234',
  source: 'API Test',
  tags: ['test', 'api']
};

// Different endpoint configurations to test
const endpoints = [
  {
    name: 'V2 with location in URL',
    url: `https://api.gohighlevel.com/v2/locations/${locationId}/contacts`,
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    },
    body: testData
  },
  {
    name: 'V2 contacts endpoint (no location in URL)',
    url: 'https://api.gohighlevel.com/v2/contacts/',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    },
    body: { ...testData, locationId }
  },
  {
    name: 'V1 endpoint with simplified data',
    url: 'https://services.leadconnectorhq.com/contacts/',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    },
    body: {
      firstName: 'Test',
      lastName: 'Simple',
      email: `simple-${Date.now()}@example.com`,
      locationId: locationId
    }
  },
  {
    name: 'V1 endpoint with phone formatting',
    url: 'https://services.leadconnectorhq.com/contacts/',
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    },
    body: {
      firstName: 'Test',
      lastName: 'Phone',
      phone: '(555) 123-4567', // Formatted phone
      locationId: locationId
    }
  }
];

async function testEndpoint(config) {
  console.log(`\n📋 Testing ${config.name}...`);
  console.log(`   URL: ${config.url}`);
  console.log(`   Body:`, JSON.stringify(config.body, null, 2));
  
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(config.body)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log(`   ✅ Success!`);
      console.log(`   Response:`, JSON.stringify(responseData, null, 2).substring(0, 300) + '...');
      return true;
    } else {
      console.log(`   ❌ Failed!`);
      console.log(`   Error:`, responseData);
      
      // Check specific error types
      if (response.status === 401) {
        console.log(`   💡 Authentication issue - check JWT token`);
      } else if (response.status === 400) {
        console.log(`   💡 Bad request - check data format`);
      } else if (response.status === 404) {
        console.log(`   💡 Endpoint not found - check URL structure`);
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Network error:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Go High Level API Tests (Corrected V2)');
  console.log('==========================================');
  
  if (!JWT_TOKEN) {
    console.error('❌ No JWT token found in environment');
    return;
  }
  
  if (!locationId) {
    console.error('❌ Could not extract location ID from JWT token');
    return;
  }
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
  }
  
  console.log('\n📝 Recommendations:');
  console.log('1. If getting "Invalid JWT" on all endpoints:');
  console.log('   - The token may be revoked or invalid');
  console.log('   - Try generating a new API key in GHL');
  console.log('   - Ensure the API key has proper permissions');
  console.log('2. If V2 endpoints return 404:');
  console.log('   - The V2 API might not be enabled for your account');
  console.log('   - Stick with V1 endpoints');
  console.log('3. Check GHL dashboard for API logs/errors');
}

runTests();