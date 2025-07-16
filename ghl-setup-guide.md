# GoHighLevel Integration Setup Guide

## Current Issue
Your JWT token is being rejected with "Invalid JWT" error. This typically happens when:
1. The token has been revoked in GoHighLevel
2. The token was created with incorrect permissions
3. The API access method has changed for your account

## Solution Options

### Option 1: Get a New JWT Token (Recommended First)
1. Log into GoHighLevel
2. Navigate to **Settings > Integrations > API**
3. Find your location: `ecoPNd0lv0NmCRDLDZHt`
4. Click "Generate New API Key"
5. Select "Private Integration" type
6. Grant all necessary permissions (Contacts: Write)
7. Copy the entire JWT token
8. Update `.env` file: `GHL_API_KEY=your-new-jwt-token`

### Option 2: Use API Key Instead of JWT
Some GoHighLevel accounts use API keys instead of JWT tokens:

1. In GoHighLevel, go to **Settings > API Keys**
2. Create a new API key (not JWT)
3. Copy the API key (it won't start with 'eyJ')
4. Update your `.env` file:
   ```
   GHL_API_KEY=your-api-key-here
   GHL_LOCATION_ID=ecoPNd0lv0NmCRDLDZHt
   ```

### Option 3: Use the Fixed Service (Temporary)
Replace the import in your API routes:
```typescript
// In app/api/submit-partial/route.ts and app/api/submit-form/route.ts
import { goHighLevel } from '@/utils/goHighLevelFixed';
```

## Testing Your Fix

1. **Test the token directly:**
   ```bash
   node test-jwt-auth.js
   ```

2. **Test different endpoints:**
   ```bash
   node test-ghl-v2.js
   ```

3. **Update token helper:**
   ```bash
   node update-ghl-token.js
   ```

## Common Issues

### "Invalid JWT" Error
- Token has been revoked
- Wrong permissions
- Using JWT when account requires API key

### "Version header not found" Error
- Already fixed in code (Version header is now included)

### 404 Not Found on V2 endpoints
- V2 API might not be enabled for your account
- Stick with V1 endpoint (already configured)

## Contact GoHighLevel Support
If none of the above works, contact GHL support with:
- Your location ID: `ecoPNd0lv0NmCRDLDZHt`
- The error: "401 Invalid JWT"
- Request: Help generating a valid API token for the REST API