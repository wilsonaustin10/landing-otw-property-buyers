# Go High Level Only - Vercel Setup Guide

## ✅ Changes Made
1. Removed all Zapier integration code
2. Go High Level is now the ONLY CRM integration
3. Simplified error messages

## 🔧 Required Vercel Environment Variables

You MUST have exactly these environment variables in Vercel:

### 1. **GHL_API_KEY** (Required)
```
GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImVjb1BOZDBsdjBObUNSRExEWkh0IiwidmVyc2lvbiI6MSwiaWF0IjoxNzUyNjc2MTQ0Mjk1LCJzdWIiOiJzeDBxOXVRRXMzYnYyQkhIaHZReSJ9.dNHgv2lRwDWVgIAXD7utWwrVJu2Iw3XHXqJpM4LUlhg
```

### 2. **NEXT_PUBLIC_GHL_ENDPOINT** (Required)
```
NEXT_PUBLIC_GHL_ENDPOINT=https://services.leadconnectorhq.com/contacts/
```

### 3. **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY** (Required for address autocomplete)
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCF--irB1Ja8RLSDoA49sxB1LtZG0YcCPg
```

## ❌ Remove These Variables from Vercel

Delete these if they exist:
- `GO_HIGH_LEVEL_CONTACT_ENDPOINT` 
- `GO_HIGH_LEVEL_LOCATION_ID`
- `ZAPIER_WEBHOOK_URL`

## 📝 Step-by-Step Fix

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: landing-otw-property-buyers
3. **Go to**: Settings → Environment Variables
4. **Delete unused variables** (listed above)
5. **Ensure the 3 required variables are set** for all environments
6. **Redeploy your application**

## 🐛 What the Error Messages Mean

### "Go High Level integration is not configured"
- Missing `GHL_API_KEY` or `NEXT_PUBLIC_GHL_ENDPOINT`
- Check Vercel environment variables

### "Go High Level integration failed: [error]"
- API key might be invalid or expired
- Endpoint might be wrong
- Check with Go High Level support

## 🧪 Test Your Setup

After redeploying, check the Vercel Function logs for this output:
```
Environment check: {
  hasGhlApiKey: true,      // MUST be true
  hasGhlEndpoint: true,    // MUST be true
  ghlEndpoint: "https://services.leadconnectorhq.com/contacts/",
  ghlEnabled: true         // MUST be true
}
```

If any of these are `false`, the corresponding environment variable is missing.

## 🚀 Summary

Your app now ONLY uses Go High Level. No Zapier needed.
Make sure the 3 required environment variables are set in Vercel and redeploy!