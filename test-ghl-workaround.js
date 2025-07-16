/**
 * Test GoHighLevel with various workarounds for the millisecond timestamp issue
 */

require('dotenv').config();

const API_KEY = process.env.GHL_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_GHL_ENDPOINT;

// Parse JWT to get info
let locationId = '';
let payload = {};
if (API_KEY && API_KEY.startsWith('eyJ')) {
  try {
    payload = JSON.parse(Buffer.from(API_KEY.split('.')[1], 'base64').toString());
    locationId = payload.location_id || '';
  } catch (e) {}
}

console.log('🔧 Testing GHL Workarounds for Millisecond Timestamp Issue\n');
console.log(`Location ID: ${locationId}`);
console.log(`Token IAT: ${payload.iat} (${new Date(payload.iat).toISOString()})`);

// Test configurations
const tests = [
  {
    name: 'Standard request with Version header',
    endpoint: ENDPOINT,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    },
    body: {
      firstName: 'Test',
      lastName: 'Standard',
      email: `test-${Date.now()}@example.com`,
      phone: '+15551234567',
      locationId: locationId
    }
  },
  {
    name: 'Try without locationId in body',
    endpoint: ENDPOINT,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    },
    body: {
      firstName: 'Test',
      lastName: 'NoLocation',
      email: `test-${Date.now()}@example.com`,
      phone: '+15551234567'
    }
  },
  {
    name: 'Try older Version header',
    endpoint: ENDPOINT,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-04-15' // Older version
    },
    body: {
      firstName: 'Test',
      lastName: 'OldVersion',
      email: `test-${Date.now()}@example.com`,
      locationId: locationId
    }
  },
  {
    name: 'Try with companyId instead of locationId',
    endpoint: ENDPOINT,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28'
    },
    body: {
      firstName: 'Test',
      lastName: 'CompanyId',
      email: `test-${Date.now()}@example.com`,
      companyId: locationId
    }
  }
];

// Test each configuration
async function runTests() {
  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    console.log(`   Body: ${JSON.stringify(test.body)}`);
    
    try {
      const response = await fetch(test.endpoint, {
        method: 'POST',
        headers: test.headers,
        body: JSON.stringify(test.body)
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
        console.log(`   ✅ SUCCESS!`);
        console.log(`   Response:`, JSON.stringify(responseData).substring(0, 200));
      } else {
        console.log(`   ❌ Failed`);
        console.log(`   Error:`, responseData);
      }
      
      // Log response headers for debugging
      const importantHeaders = ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-request-id'];
      importantHeaders.forEach(header => {
        const value = response.headers.get(header);
        if (value) {
          console.log(`   ${header}: ${value}`);
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Network error:`, error.message);
    }
  }
  
  console.log('\n\n🔍 Analysis:');
  console.log('The issue is that GoHighLevel is generating JWT tokens with millisecond timestamps');
  console.log('but their API expects second-based timestamps. This is a bug on their end.');
  console.log('\n📋 Solutions:');
  console.log('1. Contact GoHighLevel support and report this bug');
  console.log('2. Ask for an API key instead of a JWT token');
  console.log('3. Request they fix their token generation to use seconds');
  console.log('\n📞 Tell GHL Support:');
  console.log('"My JWT tokens have timestamps in milliseconds (13 digits) instead of seconds (10 digits)."');
  console.log('"This causes Invalid JWT errors even with freshly generated tokens."');
  console.log('"Can you provide an API key or fix the token generation?"');
}

runTests();