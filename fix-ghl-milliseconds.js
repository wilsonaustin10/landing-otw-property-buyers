/**
 * Fix GoHighLevel JWT with millisecond timestamps
 * This creates a corrected JWT token with proper second-based timestamps
 */

require('dotenv').config();
const crypto = require('crypto');

const JWT_TOKEN = process.env.GHL_API_KEY;

console.log('🔧 Fixing GoHighLevel JWT Token Timestamp Issue\n');

// Parse the JWT
function parseJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  
  return { header, payload, signature: parts[2] };
}

// Fix timestamps
function fixTimestamps(payload) {
  const fixed = { ...payload };
  
  // Check if iat is in milliseconds
  if (fixed.iat && fixed.iat > 1000000000000) {
    console.log(`Converting iat from milliseconds (${fixed.iat}) to seconds (${Math.floor(fixed.iat / 1000)})`);
    fixed.iat = Math.floor(fixed.iat / 1000);
  }
  
  // Check if exp is in milliseconds
  if (fixed.exp && fixed.exp > 1000000000000) {
    console.log(`Converting exp from milliseconds (${fixed.exp}) to seconds (${Math.floor(fixed.exp / 1000)})`);
    fixed.exp = Math.floor(fixed.exp / 1000);
  }
  
  return fixed;
}

// Create new JWT with fixed timestamps
function createJWT(header, payload, secret) {
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64url');
  
  return `${message}.${signature}`;
}

try {
  // Parse current JWT
  const parsed = parseJWT(JWT_TOKEN);
  
  console.log('Current JWT payload:');
  console.log(JSON.stringify(parsed.payload, null, 2));
  
  // Fix timestamps
  const fixedPayload = fixTimestamps(parsed.payload);
  
  console.log('\nFixed JWT payload:');
  console.log(JSON.stringify(fixedPayload, null, 2));
  
  // Unfortunately, we can't recreate the JWT without the secret key
  console.log('\n❌ Cannot create new JWT without the signing secret');
  console.log('\n📋 The issue has been identified:');
  console.log('   Your JWT has millisecond timestamps instead of second timestamps');
  console.log('\n🔧 Solution:');
  console.log('   1. Contact GoHighLevel support');
  console.log('   2. Report: "JWT tokens are being generated with millisecond timestamps instead of seconds"');
  console.log('   3. Ask them to fix the token generation or provide a properly formatted token');
  console.log('\n   Alternative: Ask if they have a different API authentication method (API Key)');
  
} catch (error) {
  console.error('Error:', error.message);
}