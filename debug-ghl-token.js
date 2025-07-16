/**
 * Comprehensive Go High Level JWT Token Debug Script
 * This script performs detailed analysis of JWT tokens and GHL API authentication
 * Run with: node debug-ghl-token.js
 */

require('dotenv').config();

const JWT_TOKEN = process.env.GHL_API_KEY;
const ENDPOINT = process.env.NEXT_PUBLIC_GHL_ENDPOINT;

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

// Parse JWT token with detailed analysis
function parseAndAnalyzeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error(`Invalid JWT format: Expected 3 parts, got ${parts.length}`);
    }
    
    // Decode header and payload
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const signature = parts[2];
    
    return { header, payload, signature, raw: token };
  } catch (error) {
    log(`Failed to parse JWT: ${error.message}`, 'red');
    return null;
  }
}

// Analyze timestamp format (milliseconds vs seconds)
function analyzeTimestamp(timestamp, fieldName) {
  if (!timestamp) {
    log(`   ${fieldName}: Not present`, 'yellow');
    return null;
  }

  const now = Date.now();
  const nowSeconds = Math.floor(now / 1000);
  
  // Check if timestamp is likely in milliseconds
  const isMilliseconds = timestamp > 1000000000000;
  
  // Convert to date
  const dateFromSeconds = new Date(timestamp * 1000);
  const dateFromMilliseconds = new Date(timestamp);
  
  // Determine which format makes more sense
  const secondsDiff = Math.abs(nowSeconds - timestamp);
  const millisecondsDiff = Math.abs(now - timestamp);
  
  log(`   ${fieldName}: ${timestamp}`, 'cyan');
  
  if (isMilliseconds) {
    log(`     Format: Likely MILLISECONDS (13+ digits)`, 'yellow');
    log(`     As Date (ms): ${dateFromMilliseconds.toISOString()}`, 'cyan');
    log(`     As Date (sec): ${dateFromSeconds.toISOString()} (unlikely - far future)`, 'gray');
  } else {
    log(`     Format: Likely SECONDS (10 digits)`, 'green');
    log(`     As Date (sec): ${dateFromSeconds.toISOString()}`, 'cyan');
    log(`     As Date (ms): ${dateFromMilliseconds.toISOString()} (unlikely - 1970)`, 'gray');
  }
  
  // Check if reasonable
  const date = isMilliseconds ? dateFromMilliseconds : dateFromSeconds;
  const yearDiff = Math.abs(date.getFullYear() - new Date().getFullYear());
  
  if (yearDiff > 10) {
    log(`     ⚠️  WARNING: Date seems unreasonable (${yearDiff} years difference)`, 'red');
  }
  
  return {
    value: timestamp,
    isMilliseconds,
    date: date,
    formatted: date.toISOString()
  };
}

// Test different authentication methods
async function testAuthenticationMethods(parsed) {
  logSection('TESTING AUTHENTICATION METHODS');
  
  const locationId = parsed?.payload?.location_id || parsed?.payload?.locationId || '';
  
  // Prepare test data
  const testData = {
    firstName: 'Debug',
    lastName: 'Test',
    email: `debug-${Date.now()}@test.com`,
    phone: '+1234567890',
    locationId: locationId,
    source: 'Debug Script'
  };
  
  // Different header configurations to test
  const headerConfigs = [
    {
      name: 'Standard Bearer Token with Version Header',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28'
      }
    },
    {
      name: 'Bearer Token without Version Header',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    {
      name: 'Token without Bearer Prefix',
      headers: {
        'Authorization': JWT_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28'
      }
    },
    {
      name: 'Using X-API-Key Header',
      headers: {
        'X-API-Key': JWT_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Version': '2021-07-28'
      }
    }
  ];
  
  for (const config of headerConfigs) {
    console.log(`\n📝 Testing: ${config.name}`);
    log(`   Headers: ${JSON.stringify(config.headers, null, 2)}`, 'cyan');
    
    try {
      const response = await fetch(ENDPOINT, {
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
        log(`   ✅ SUCCESS: ${response.status} ${response.statusText}`, 'green');
      } else {
        log(`   ❌ FAILED: ${response.status} ${response.statusText}`, 'red');
      }
      
      log(`   Response: ${JSON.stringify(responseData).substring(0, 200)}...`, 'gray');
      
    } catch (error) {
      log(`   ❌ ERROR: ${error.message}`, 'red');
    }
  }
}

// Test with different location IDs
async function testLocationIdVariations(parsed) {
  logSection('TESTING LOCATION ID VARIATIONS');
  
  const tokenLocationId = parsed?.payload?.location_id || parsed?.payload?.locationId || '';
  
  log(`Token Location ID: ${tokenLocationId || 'NOT FOUND'}`, tokenLocationId ? 'green' : 'red');
  
  // Different location ID scenarios to test
  const locationTests = [
    {
      name: 'Using token location ID',
      locationId: tokenLocationId
    },
    {
      name: 'Using empty location ID',
      locationId: ''
    },
    {
      name: 'Using null location ID',
      locationId: null
    },
    {
      name: 'Omitting location ID',
      locationId: undefined
    }
  ];
  
  for (const test of locationTests) {
    console.log(`\n📍 Testing: ${test.name}`);
    
    const testData = {
      firstName: 'LocationTest',
      lastName: 'Debug',
      email: `location-test-${Date.now()}@test.com`,
      phone: '+1234567890',
      source: 'Location ID Test'
    };
    
    // Only add locationId if it's defined
    if (test.locationId !== undefined) {
      testData.locationId = test.locationId;
    }
    
    log(`   Request body: ${JSON.stringify(testData, null, 2)}`, 'cyan');
    
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Version': '2021-07-28'
        },
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
        log(`   ✅ SUCCESS: ${response.status} ${response.statusText}`, 'green');
      } else {
        log(`   ❌ FAILED: ${response.status} ${response.statusText}`, 'red');
      }
      
      // Check for location ID mismatch errors
      if (responseData && typeof responseData === 'object') {
        if (responseData.error && responseData.error.includes('location')) {
          log(`   ⚠️  Location ID Error: ${responseData.error}`, 'yellow');
        }
      }
      
    } catch (error) {
      log(`   ❌ ERROR: ${error.message}`, 'red');
    }
  }
}

// Compare with expected GHL token structure
function compareWithExpectedStructure(parsed) {
  logSection('COMPARING WITH EXPECTED GHL TOKEN STRUCTURE');
  
  const expectedFields = {
    header: {
      alg: 'Algorithm (usually HS256 or RS256)',
      typ: 'Type (usually JWT)'
    },
    payload: {
      location_id: 'GHL Location ID',
      locationId: 'Alternative location ID field',
      sub: 'Subject (user/app ID)',
      iat: 'Issued At timestamp',
      exp: 'Expiration timestamp (optional)',
      version: 'API version (optional)',
      scopes: 'Permissions/scopes (optional)',
      type: 'Token type (optional)',
      userId: 'User ID (optional)',
      companyId: 'Company ID (optional)'
    }
  };
  
  log('Expected Header Fields:', 'bright');
  for (const [field, description] of Object.entries(expectedFields.header)) {
    const hasField = parsed?.header && field in parsed.header;
    const status = hasField ? '✅' : '❌';
    const value = hasField ? parsed.header[field] : 'MISSING';
    log(`   ${status} ${field}: ${value} (${description})`, hasField ? 'green' : 'red');
  }
  
  log('\nExpected Payload Fields:', 'bright');
  for (const [field, description] of Object.entries(expectedFields.payload)) {
    const hasField = parsed?.payload && field in parsed.payload;
    const status = hasField ? '✅' : '⚠️';
    const value = hasField ? JSON.stringify(parsed.payload[field]) : 'NOT PRESENT';
    const color = hasField ? 'green' : (field === 'location_id' || field === 'locationId' ? 'red' : 'yellow');
    log(`   ${status} ${field}: ${value} (${description})`, color);
  }
  
  // Check for unexpected fields
  log('\nAdditional Fields Found:', 'bright');
  if (parsed?.payload) {
    const allExpectedFields = Object.keys(expectedFields.payload);
    const actualFields = Object.keys(parsed.payload);
    const additionalFields = actualFields.filter(f => !allExpectedFields.includes(f));
    
    if (additionalFields.length > 0) {
      additionalFields.forEach(field => {
        log(`   ℹ️  ${field}: ${JSON.stringify(parsed.payload[field])}`, 'cyan');
      });
    } else {
      log('   None', 'gray');
    }
  }
}

// Main debug function
async function debugGHLToken() {
  log('🔍 GO HIGH LEVEL JWT TOKEN COMPREHENSIVE DEBUG SCRIPT', 'bright');
  log(`Started at: ${new Date().toISOString()}`, 'cyan');
  
  // Check environment variables
  logSection('ENVIRONMENT VARIABLES CHECK');
  
  if (!JWT_TOKEN) {
    log('❌ GHL_API_KEY is not set in .env file!', 'red');
    log('   Please add: GHL_API_KEY=your_jwt_token', 'yellow');
    process.exit(1);
  }
  
  if (!ENDPOINT) {
    log('❌ NEXT_PUBLIC_GHL_ENDPOINT is not set in .env file!', 'red');
    log('   Please add: NEXT_PUBLIC_GHL_ENDPOINT=https://services.leadconnectorhq.com/contacts/', 'yellow');
    process.exit(1);
  }
  
  log('✅ GHL_API_KEY: Set', 'green');
  log('✅ NEXT_PUBLIC_GHL_ENDPOINT: Set', 'green');
  
  // Analyze JWT token
  logSection('JWT TOKEN ANALYSIS');
  
  log(`Token Length: ${JWT_TOKEN.length} characters`, 'cyan');
  log(`Token Preview: ${JWT_TOKEN.substring(0, 30)}...${JWT_TOKEN.substring(JWT_TOKEN.length - 10)}`, 'cyan');
  
  const parsed = parseAndAnalyzeJWT(JWT_TOKEN);
  
  if (!parsed) {
    log('\n❌ Failed to parse JWT token. Token may be malformed.', 'red');
    process.exit(1);
  }
  
  log('\nDecoded Header:', 'bright');
  log(JSON.stringify(parsed.header, null, 2), 'cyan');
  
  log('\nDecoded Payload:', 'bright');
  log(JSON.stringify(parsed.payload, null, 2), 'cyan');
  
  // Analyze timestamps
  logSection('TIMESTAMP ANALYSIS');
  
  if (parsed.payload.iat) {
    log('\nIssued At (iat):', 'bright');
    const iatAnalysis = analyzeTimestamp(parsed.payload.iat, 'iat');
    
    if (iatAnalysis && iatAnalysis.isMilliseconds) {
      log('\n⚠️  WARNING: iat appears to be in milliseconds!', 'red');
      log('   GHL typically expects seconds. This could cause authentication issues.', 'yellow');
    }
  }
  
  if (parsed.payload.exp) {
    log('\nExpiration (exp):', 'bright');
    const expAnalysis = analyzeTimestamp(parsed.payload.exp, 'exp');
    
    if (expAnalysis) {
      const isExpired = expAnalysis.date < new Date();
      log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`, isExpired ? 'red' : 'green');
      
      if (expAnalysis.isMilliseconds) {
        log('\n⚠️  WARNING: exp appears to be in milliseconds!', 'red');
        log('   GHL typically expects seconds. This could cause authentication issues.', 'yellow');
      }
    }
  }
  
  // Analyze endpoint
  logSection('ENDPOINT ANALYSIS');
  
  log(`Endpoint: ${ENDPOINT}`, 'cyan');
  
  const isV1 = ENDPOINT.includes('services.leadconnectorhq.com');
  const isV2 = ENDPOINT.includes('api.gohighlevel.com');
  
  if (isV1) {
    log('✅ Using V1 API endpoint (services.leadconnectorhq.com)', 'green');
    log('   This endpoint requires the Version header', 'yellow');
  } else if (isV2) {
    log('✅ Using V2 API endpoint (api.gohighlevel.com)', 'green');
    log('   This endpoint also requires the Version header', 'yellow');
  } else {
    log('⚠️  Using unknown endpoint format', 'yellow');
  }
  
  // Compare with expected structure
  compareWithExpectedStructure(parsed);
  
  // Test authentication methods
  await testAuthenticationMethods(parsed);
  
  // Test location ID variations
  await testLocationIdVariations(parsed);
  
  // Final recommendations
  logSection('RECOMMENDATIONS');
  
  const issues = [];
  
  // Check for common issues
  if (!parsed.payload.location_id && !parsed.payload.locationId) {
    issues.push('Token is missing location_id field');
  }
  
  if (parsed.payload.iat && parsed.payload.iat > 1000000000000) {
    issues.push('iat timestamp appears to be in milliseconds (should be seconds)');
  }
  
  if (parsed.payload.exp && parsed.payload.exp > 1000000000000) {
    issues.push('exp timestamp appears to be in milliseconds (should be seconds)');
  }
  
  if (parsed.payload.exp && new Date(parsed.payload.exp * 1000) < new Date()) {
    issues.push('Token has expired');
  }
  
  if (issues.length > 0) {
    log('🔧 Issues Found:', 'red');
    issues.forEach(issue => {
      log(`   • ${issue}`, 'yellow');
    });
    
    log('\n📋 To fix these issues:', 'bright');
    log('   1. Log into Go High Level', 'cyan');
    log('   2. Navigate to Settings > API Keys', 'cyan');
    log('   3. Generate a new API key for your location', 'cyan');
    log('   4. Make sure to select the correct location', 'cyan');
    log('   5. Copy the entire JWT token', 'cyan');
    log('   6. Update GHL_API_KEY in your .env file', 'cyan');
  } else {
    log('✅ No obvious issues found with the token structure', 'green');
    log('\nIf you\'re still having issues:', 'bright');
    log('   • Check API rate limits', 'cyan');
    log('   • Verify the location ID matches your GHL account', 'cyan');
    log('   • Ensure your GHL account has API access enabled', 'cyan');
    log('   • Check if the API endpoint is correct for your region', 'cyan');
  }
  
  log('\n✨ Debug analysis complete!', 'bright');
}

// Run the debug script
debugGHLToken().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});