# AAA-LANDING PAGE-TEMPLATE

A responsive landing page for collecting property information from potential sellers, integrated with Zapier for lead management.

## Environment Variables

The application uses environment variables for configuration. Copy the `.env.example` file to `.env` and fill in the appropriate values:

```bash
cp .env.example .env
```

### Required Environment Variables

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key with Places API enabled
- `ZAPIER_WEBHOOK_URL`: URL for the Zapier webhook to receive form submissions

### Optional Environment Variables

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics measurement ID
- `NEXT_PUBLIC_FB_PIXEL_ID`: Facebook Pixel ID for conversion tracking
- `NEXT_PUBLIC_HOTJAR_ID`: Hotjar site ID for user behavior tracking
- `NEXT_PUBLIC_SERVICE_AREAS`: Array of service areas as a JSON string

## API Key Security

- Never commit actual API keys to the repository
- The `.env` file is included in `.gitignore` to prevent accidental commits
- For production, set environment variables through your hosting provider (Vercel)
- Restrict API keys to specific domains and services when possible:
  - Google Maps API key should have website restrictions set to your domain
  - Set appropriate quotas to prevent unexpected billing

## Google Maps Integration

For the Google Maps/Places API integration to work:

1. Create a project in Google Cloud Console
2. Enable the Maps JavaScript API and Places API
3. Create an API key with HTTP referrer restrictions
4. Add your domain(s) to the allowed referrers list
5. Add the API key to your environment variables

## Zapier Integration

The form submissions are sent to Zapier for processing:

1. Create a Zap with a Webhook trigger (Catch Hook)
2. Copy the webhook URL to your environment variables
3. Configure Zapier actions to handle the form data (e.g., add to CRM, send notifications) 