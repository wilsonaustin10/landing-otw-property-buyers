/**
 * Test JWT Authentication with Go High Level
 * Run with: node test-jwt-auth.js
 */

require('dotenv').config();

const JWT_TOKEN = process.env.GHL_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_GHL_ENDPOINT;

console.log('🔍 Testing Go High Level JWT Authentication\n');

// Check environment variables
if (!JWT_TOKEN || !ENDPOINT) {
  console.error('❌ Missing environment variables:');
  console.error(`   GHL_API_KEY: ${JWT_TOKEN ? 'Set' : 'Not set'}`);
  console.error(`   NEXT_PUBLIC_GHL_ENDPOINT: ${ENDPOINT ? 'Set' : 'Not set'}`);
  process.exit(1);
}

// Parse JWT token
function parseJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    return { header, payload };
  } catch (error) {
    console.error('Failed to parse JWT:', error.message);
    return null;
  }
}

// Test authentication
async function testAuth() {
  console.log('📋 JWT Token Analysis:');
  console.log(`   Token length: ${JWT_TOKEN.length} characters`);
  console.log(`   Token prefix: ${JWT_TOKEN.substring(0, 20)}...`);
  
  const parsed = parseJWT(JWT_TOKEN);
  if (parsed) {
    console.log('\n   Decoded JWT:');
    console.log('   Header:', JSON.stringify(parsed.header, null, 2));
    console.log('   Payload:', JSON.stringify(parsed.payload, null, 2));
    
    // Check if token is expired
    if (parsed.payload.exp) {
      const expDate = new Date(parsed.payload.exp * 1000);
      const isExpired = expDate < new Date();
      console.log(`\n   Expiration: ${expDate.toISOString()} ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
    }
    
    // Check issued at time
    if (parsed.payload.iat) {
      const iatDate = new Date(parsed.payload.iat);
      console.log(`   Issued at: ${iatDate.toISOString()}`);
    }
  }
  
  console.log('\n📋 Endpoint Configuration:');
  console.log(`   Endpoint: ${ENDPOINT}`);
  console.log(`   Is V1: ${ENDPOINT.includes('services.leadconnectorhq.com')}`);
  console.log(`   Is V2: ${ENDPOINT.includes('api.gohighlevel.com')}`);
  
  console.log('\n🚀 Testing Authentication...\n');
  
  // Test contact creation
  const testData = {
    firstName: 'Test',
    lastName: 'Authentication',
    email: `test-${Date.now()}@example.com`,
    phone: '+1234567890',
    locationId: parsed?.payload?.location_id || '',
    source: 'JWT Test'
  };
  
  try {
    // Build headers - Both V1 and V2 require Version header
    const headers = {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': '2021-07-28' // Required for both endpoints
    };
    
    console.log('   Request headers:', JSON.stringify(headers, null, 2));
    console.log('   Request body:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(testData)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    console.log(`\n   Response status: ${response.status} ${response.statusText}`);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('   Response body:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Authentication successful! JWT token is valid.');
    } else {
      console.log('\n❌ Authentication failed!');
      
      if (response.status === 401 || (responseData && JSON.stringify(responseData).includes('Invalid JWT'))) {
        console.log('\n🔧 JWT Token appears to be invalid or expired.');
        console.log('   You need to generate a new API key from Go High Level:');
        console.log('   1. Log into your Go High Level account');
        console.log('   2. Go to Settings > API Keys');
        console.log('   3. Create a new API key for your location');
        console.log('   4. Update the GHL_API_KEY in your .env file');
      }
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message);
  }
}

// Run the test
testAuth().then(() => {
  console.log('\n✨ Test completed!');
}).catch(error => {
  console.error('\n❌ Test failed:', error);
});