# Go High Level Integration Setup Guide

## Overview
This landing page now supports sending form submissions directly to Go High Level CRM in addition to the existing Zapier webhook integration.

## Configuration

### 1. Environment Variables
Add the following variables to your `.env` file:

```env
# Go High Level Integration
NEXT_PUBLIC_GHL_ENDPOINT=https://api.gohighlevel.com/v2/contacts
GHL_API_KEY=your-go-high-level-api-key-here
```

### 2. Getting Your Go High Level API Key
1. Log into your Go High Level account
2. Navigate to Settings → Integrations → API
3. Create a new API key with appropriate permissions
4. Copy the API key and add it to your `.env` file

### 3. API Endpoint
The default endpoint for creating contacts is:
- `https://api.gohighlevel.com/v2/contacts`

If you need to use a different endpoint (e.g., for a specific location), update the `NEXT_PUBLIC_GHL_ENDPOINT` variable.

## How It Works

### Dual Integration Strategy
The system maintains both Zapier and Go High Level integrations:
- **Primary**: Zapier webhook (existing functionality)
- **Secondary**: Go High Level API (new functionality)

### Data Flow
1. User submits form (partial or complete)
2. Data is sent to Zapier webhook first
3. If Go High Level is configured, data is also sent there (non-blocking)
4. Form submission succeeds even if Go High Level fails

### Form Fields Mapping
The integration maps form fields to Go High Level contact fields:

| Form Field | Go High Level Field |
|------------|-------------------|
| firstName | firstName |
| lastName | lastName |
| email | email |
| phone | phone |
| address | address1, city, state, postalCode (parsed) |
| propertyCondition | customField.propertyCondition |
| timeframe | customField.timeframe |
| price | customField.askingPrice |
| isPropertyListed | customField.isPropertyListed |
| leadId | customField.leadId |

### Tags
Leads are automatically tagged with:
- "Website Lead"
- "Partial Lead" (for initial submissions)
- "Complete Lead" (for full submissions)

## Testing

### 1. Test Script
Run the included test script to verify the integration:

```bash
node test-ghl-integration.js
```

### 2. Manual Testing
1. Ensure your Next.js dev server is running
2. Submit a test form on the landing page
3. Check your server logs for success/error messages
4. Verify the contact appears in Go High Level

### 3. Debugging
Enable debug logging by checking the server console for:
- "Successfully sent to Go High Level" - Integration working
- "Failed to send to Go High Level: [error]" - Check API key and endpoint
- No Go High Level messages - Check if environment variables are set

## Error Handling

### Retry Logic
- The system automatically retries failed requests up to 3 times
- Uses exponential backoff (2s, 4s, 8s)
- Does not retry on authentication errors (401/403)

### Non-Blocking Design
- Go High Level failures don't prevent form submission
- Users always see success if Zapier webhook succeeds
- Errors are logged but don't affect user experience

## Security Considerations

1. **API Key**: Never commit your API key to version control
2. **CORS**: The API key is only used server-side
3. **Rate Limits**: Go High Level has rate limits (100 req/10s)
4. **Data Privacy**: Ensure compliance with data protection regulations

## Troubleshooting

### Integration Not Working
1. Check environment variables are set correctly
2. Verify API key has correct permissions
3. Check server logs for specific error messages
4. Test with the provided test script

### Common Errors
- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: API key lacks required permissions
- **404 Not Found**: Incorrect endpoint URL
- **429 Too Many Requests**: Rate limit exceeded

## Support
For Go High Level API documentation, visit:
- https://highlevel.stoplight.io/docs/integrations/
- https://developers.gohighlevel.com/