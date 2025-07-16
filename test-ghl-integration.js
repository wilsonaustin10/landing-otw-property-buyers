/**
 * Test script for Go High Level Integration
 * Run with: node test-ghl-integration.js
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const partialLeadData = {
  address: "123 Main Street, Los Angeles, CA 90001",
  phone: "(555) 123-4567"
};

const completeLeadData = {
  address: "456 Oak Avenue, San Francisco, CA 94110",
  phone: "(555) 987-6543",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  propertyCondition: "Good",
  timeframe: "3-6 months",
  price: "$500,000",
  isPropertyListed: false,
  leadId: `test_lead_${Date.now()}`
};

// Test partial submission
async function testPartialSubmission() {
  console.log('\n📋 Testing Partial Form Submission...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/submit-partial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partialLeadData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Partial submission successful!');
      console.log('Lead ID:', data.leadId);
      return data.leadId;
    } else {
      console.error('❌ Partial submission failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing partial submission:', error);
    return null;
  }
}

// Test complete submission
async function testCompleteSubmission(leadId) {
  console.log('\n📋 Testing Complete Form Submission...');
  
  const dataWithLeadId = leadId ? { ...completeLeadData, leadId } : completeLeadData;
  
  try {
    const response = await fetch(`${BASE_URL}/api/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataWithLeadId)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Complete submission successful!');
      console.log('Lead ID:', data.leadId);
    } else {
      console.error('❌ Complete submission failed:', data);
    }
  } catch (error) {
    console.error('❌ Error testing complete submission:', error);
  }
}

// Check environment setup
function checkEnvironment() {
  console.log('🔍 Checking Environment Setup...\n');
  
  const requiredVars = [
    'NEXT_PUBLIC_GHL_ENDPOINT',
    'GHL_API_KEY',
    'ZAPIER_WEBHOOK_URL'
  ];

  console.log('Required environment variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? 'Set' : 'Not set'}`);
  });

  console.log('\n💡 Make sure to set these in your .env file:');
  console.log('NEXT_PUBLIC_GHL_ENDPOINT=https://api.gohighlevel.com/v2/contacts');
  console.log('GHL_API_KEY=your-api-key-here');
  console.log('ZAPIER_WEBHOOK_URL=your-zapier-webhook-url');
}

// Run tests
async function runTests() {
  console.log('🚀 Go High Level Integration Test Suite');
  console.log('=====================================');
  
  checkEnvironment();
  
  console.log('\n⏳ Starting API tests in 3 seconds...');
  console.log('Make sure your Next.js development server is running on port 3000\n');
  
  setTimeout(async () => {
    // Test partial submission
    const leadId = await testPartialSubmission();
    
    // Wait a bit before testing complete submission
    setTimeout(async () => {
      await testCompleteSubmission(leadId);
      
      console.log('\n✨ Tests completed!');
      console.log('\n📝 Next steps:');
      console.log('1. Check your server logs for Go High Level integration messages');
      console.log('2. Verify data appears in your Go High Level CRM');
      console.log('3. Check Zapier webhook logs as well');
    }, 2000);
  }, 3000);
}

// Run the tests
runTests();