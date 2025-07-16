/**
 * Update Go High Level API Token
 * 
 * Steps to get a new token:
 * 1. Log into Go High Level
 * 2. Navigate to Settings > API Keys
 * 3. Create a new API key for your location
 * 4. Copy the token and run this script
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Go High Level Token Update Tool\n');
console.log('This tool will help you update your GHL API token in the .env file.\n');
console.log('Steps to get a new token:');
console.log('1. Log into Go High Level');
console.log('2. Navigate to Settings > API Keys');
console.log('3. Create a new API key for your location');
console.log('4. Copy the entire JWT token\n');

rl.question('Please paste your new GHL API token: ', (token) => {
  // Validate token format
  if (!token || !token.startsWith('eyJ')) {
    console.error('\n❌ Invalid token format. JWT tokens should start with "eyJ"');
    rl.close();
    return;
  }
  
  // Parse token to extract location ID
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('\n✅ Token validated successfully!');
    console.log(`   Location ID: ${payload.location_id || 'Not found'}`);
    
    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update the GHL_API_KEY
    envContent = envContent.replace(/GHL_API_KEY=.*/, `GHL_API_KEY=${token}`);
    
    // Write back to .env
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Token updated in .env file!');
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your development server if running');
    console.log('2. Test the integration with: node test-jwt-auth.js');
    console.log('3. Deploy to production and update environment variables there');
    
  } catch (error) {
    console.error('\n❌ Failed to parse token:', error.message);
  }
  
  rl.close();
});