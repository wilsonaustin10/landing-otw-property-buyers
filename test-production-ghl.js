/**
 * Production Go High Level Integration Test
 * Run this to test your production API endpoints
 */

const PRODUCTION_URL = 'https://www.otwhomebuyers.com';
const LOCAL_URL = 'http://localhost:3000';

// Test data
const testData = {
  address: "123 Test Street, Los Angeles, CA 90001",
  phone: "(555) 123-4567"
};

async function testEndpoint(baseUrl, endpoint) {
  console.log(`\n📋 Testing ${endpoint} at ${baseUrl}...`);
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse response as JSON:', responseText);
      return false;
    }
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.error('❌ Request failed with status:', response.status);
      console.error('Error:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Go High Level Production Test Suite');
  console.log('=====================================\n');
  
  // Test production
  console.log('🌐 PRODUCTION TESTS:');
  await testEndpoint(PRODUCTION_URL, '/api/submit-partial');
  
  console.log('\n💡 Debugging Tips:');
  console.log('1. Check Vercel Function Logs for "Environment check" output');
  console.log('2. Verify these environment variables in Vercel:');
  console.log('   - GHL_API_KEY (server-side only)');
  console.log('   - NEXT_PUBLIC_GHL_ENDPOINT');
  console.log('   - ZAPIER_WEBHOOK_URL (or set to placeholder)');
  console.log('3. Make sure to redeploy after changing environment variables');
  
  console.log('\n📝 Expected Environment Check Output:');
  console.log('{');
  console.log('  hasGhlApiKey: true,');
  console.log('  hasGhlEndpoint: true,');
  console.log('  ghlEndpoint: "https://services.leadconnectorhq.com/contacts/",');
  console.log('  hasZapierUrl: true,');
  console.log('  ghlEnabled: true');
  console.log('}');
}

// Run the tests
runTests().then(() => {
  console.log('\n✨ Tests completed!');
}).catch(error => {
  console.error('\n❌ Test suite failed:', error);
});