# Vercel Environment Variables Fix Guide

## ❌ Current Issues
Your Vercel environment has these variables:
- `GO_HIGH_LEVEL_CONTACT_ENDPOINT` ❌ (not used)
- `GO_HIGH_LEVEL_LOCATION_ID` ❌ (not used) 
- `GHL_API_KEY` ✅
- `NEXT_PUBLIC_GHL_ENDPOINT` ✅
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` ✅

Missing:
- `ZAPIER_WEBHOOK_URL` ❌

## ✅ Required Variables

### 1. Delete These Unused Variables:
- `GO_HIGH_LEVEL_CONTACT_ENDPOINT`
- `GO_HIGH_LEVEL_LOCATION_ID`

### 2. Add This Missing Variable:
```
ZAPIER_WEBHOOK_URL=YOUR_ZAPIER_WEBHOOK_URL
```
(Set it to the placeholder value if you're not using Zapier)

### 3. Verify These Are Set Correctly:
```
GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImVjb1BOZDBsdjBObUNSRExEWkh0IiwidmVyc2lvbiI6MSwiaWF0IjoxNzUyNjc2MTQ0Mjk1LCJzdWIiOiJzeDBxOXVRRXMzYnYyQkhIaHZReSJ9.dNHgv2lRwDWVgIAXD7utWwrVJu2Iw3XHXqJpM4LUlhg

NEXT_PUBLIC_GHL_ENDPOINT=https://services.leadconnectorhq.com/contacts/

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCF--irB1Ja8RLSDoA49sxB1LtZG0YcCPg
```

## 📝 Step-by-Step Instructions

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Select Your Project
Click on "landing-otw-property-buyers"

### 3. Navigate to Settings → Environment Variables

### 4. Delete Unused Variables
- Find `GO_HIGH_LEVEL_CONTACT_ENDPOINT` → Click "..." → Delete
- Find `GO_HIGH_LEVEL_LOCATION_ID` → Click "..." → Delete

### 5. Add Missing Variable
Click "Add Variable":
- Key: `ZAPIER_WEBHOOK_URL`
- Value: `YOUR_ZAPIER_WEBHOOK_URL`
- Environment: ✓ Production, ✓ Preview, ✓ Development

### 6. Verify Existing Variables
Make sure these are set for ALL environments (Production, Preview, Development):
- `GHL_API_KEY`
- `NEXT_PUBLIC_GHL_ENDPOINT`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 7. Redeploy
After making changes:
1. Go to the "Deployments" tab
2. Click the three dots on the latest deployment
3. Select "Redeploy"
4. Click "Redeploy" in the dialog

## 🐛 Debug Checklist

After redeployment, if still having issues:

1. **Check Function Logs in Vercel:**
   - Go to Functions tab → View logs for `/api/submit-partial`
   - Look for console logs showing if GHL is enabled

2. **Verify API Key is Valid:**
   - Your JWT token might be expired
   - Check with Go High Level support

3. **Test Locally First:**
   ```bash
   # Test with production variables locally
   vercel env pull .env.production
   npm run build
   npm run start
   ```

## 🔍 What Should Happen

When correctly configured:
1. Form submission attempts Go High Level first
2. If GHL fails or isn't configured, tries Zapier
3. Success if either works
4. Only fails if both fail

The error "All CRM integrations failed" means both are failing, which happens when:
- GHL is disabled (missing env vars)
- Zapier fails (missing ZAPIER_WEBHOOK_URL)