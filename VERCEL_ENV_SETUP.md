# Vercel Environment Variables Setup

## Required Environment Variables for Production

You need to add the following environment variables to your Vercel project:

### 1. Go High Level Integration
```
NEXT_PUBLIC_GHL_ENDPOINT=https://services.leadconnectorhq.com/contacts/
GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImVjb1BOZDBsdjBObUNSRExEWkh0IiwidmVyc2lvbiI6MSwiaWF0IjoxNzUyNjc2MTQ0Mjk1LCJzdWIiOiJzeDBxOXVRRXMzYnYyQkhIaHZReSJ9.dNHgv2lRwDWVgIAXD7utWwrVJu2Iw3XHXqJpM4LUlhg
```

### 2. Google Maps API
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCF--irB1Ja8RLSDoA49sxB1LtZG0YcCPg
```

### 3. Optional: Zapier Integration
```
ZAPIER_WEBHOOK_URL=YOUR_ZAPIER_WEBHOOK_URL
```
(You can leave this as the placeholder value if you're not using Zapier)

## How to Add to Vercel

### Option 1: Via Vercel Dashboard
1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable:
   - Key: Variable name (e.g., `GHL_API_KEY`)
   - Value: The value from your .env file
   - Environment: Select all (Production, Preview, Development)
5. Click "Save" for each variable

### Option 2: Via Vercel CLI
```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Add environment variables
vercel env add NEXT_PUBLIC_GHL_ENDPOINT
vercel env add GHL_API_KEY
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

## Important Notes

1. **NEXT_PUBLIC_ prefix**: Variables that start with `NEXT_PUBLIC_` are exposed to the browser
2. **GHL_API_KEY**: This is server-side only (no prefix) for security
3. **Redeploy Required**: After adding environment variables, you need to redeploy your application

## Verify Environment Variables

After adding the variables, you can verify they're set correctly:

1. In Vercel Dashboard: Settings → Environment Variables
2. Check that all variables are listed
3. Redeploy your application

## Troubleshooting

If you're still getting errors after adding environment variables:

1. **Check Variable Names**: Ensure they match exactly (case-sensitive)
2. **Redeploy**: Trigger a new deployment after adding variables
3. **Check Logs**: View function logs in Vercel dashboard for specific errors
4. **Test Locally First**: Ensure it works on localhost before deploying