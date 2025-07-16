# Go High Level API Key Setup Instructions

## The Issue
Your current JWT token has authentication issues in production. You need to switch to API Key authentication.

## How to Get an API Key from Go High Level

### Option 1: Through Go High Level Dashboard
1. Log into your Go High Level account
2. Navigate to **Settings** → **API Settings** or **Integrations**
3. Look for **API Keys** or **Developer Settings**
4. Create a new API key with the following permissions:
   - Contact Create
   - Contact Read
   - Contact Update
   - Custom Fields Access

### Option 2: Contact Go High Level Support
If you can't find the API key option:

1. Contact Go High Level support
2. Tell them: "I need an API key for my integration. My JWT token has millisecond timestamp issues and is failing authentication in production."
3. Request an API key for location ID: `ecoPNd0lv0NmCRDLDZHt`
4. Ask for the correct API endpoint to use with the API key

## Update Your Environment Variables

Once you have the API key, update your `.env` file:

```bash
# Replace the JWT token with your new API key
GHL_API_KEY=your-new-api-key-here

# Keep this endpoint unless GHL support tells you otherwise
NEXT_PUBLIC_GHL_ENDPOINT=https://services.leadconnectorhq.com/contacts/
```

## Deploy to Vercel

Update your Vercel environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `GHL_API_KEY` with the new API key
3. Ensure `NEXT_PUBLIC_GHL_ENDPOINT` is set correctly
4. Apply to all environments (Production, Preview, Development)

## Testing

The new implementation includes extensive logging. In your production logs, you'll see:
- `[GHL]` prefixed messages for Go High Level operations
- `[API]` prefixed messages for API route operations
- Detailed error messages if authentication fails

## Alternative: Use the Old Endpoint

If you can't get an API key immediately, try reverting to the old endpoint that worked in dev:
```bash
NEXT_PUBLIC_GHL_ENDPOINT=https://rest.gohighlevel.com/v1/contacts/
```

But note that the JWT authentication issue will likely persist.