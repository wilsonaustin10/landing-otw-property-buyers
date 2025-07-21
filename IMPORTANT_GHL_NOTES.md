# Important: Go High Level Integration Notes

## Current Status (Updated: July 21, 2025)

### NEW: Duplicate Contact Handling
The integration now automatically handles duplicate contacts:
- When a duplicate is detected (by phone number), the existing contact is updated instead of failing
- All new tags are added to the existing contact
- Contact information is updated with the latest data
- This ensures no leads are lost due to duplicate submissions

## API Limitations

The Go High Level V2 API has strict limitations on what fields can be sent during contact creation.

### Allowed Fields for Contact Creation:
- `firstName`
- `lastName` 
- `email`
- `phone`
- `address1`
- `city`
- `state`
- `postalCode`
- `country`
- `source`
- `tags` (array of strings)
- `companyName`
- `locationId` (required)

### NOT Allowed:
- `customField` or `customFields`
- `notes`
- `description`
- Any other custom properties

## Current Solution

We're using the following workarounds to store property information:

1. **Tags**: Property details are converted to descriptive tags:
   - `Condition: poor/fair/good/excellent`
   - `Timeline: immediately/30days/60days/90days/over90days`
   - `Price: Under 100k / 100k-200k / 200k-300k / 300k-500k / Over 500k`
   - `Listed / Not Listed`

2. **Company Name**: We use the property address as the company name field

3. **Lead Type Tags**: 
   - `Website Lead`
   - `PPC`
   - `Partial Lead` or `Complete Lead`

## Recommended Next Steps

To properly store all property details in Go High Level:

1. **Create Custom Fields in GHL**:
   - Log into Go High Level
   - Go to Settings > Custom Fields
   - Create the following contact custom fields:
     - Property Address (text)
     - Property Condition (dropdown)
     - Timeline to Sell (dropdown)
     - Asking Price (number)
     - Is Property Listed (yes/no)
     - Lead ID (text)
     - Submission Type (text)

2. **Use GHL Workflows**:
   - Create a workflow that triggers on the tag "Website Lead"
   - Use the workflow to update the custom fields based on the tags
   - Or use GHL's API to update the contact after creation with custom field values

3. **Alternative: Use GHL Webhooks**:
   - Set up a webhook in GHL that captures new contacts
   - Create an endpoint that receives the webhook and updates the contact with custom field data

## API Configuration

- Endpoint: `https://services.leadconnectorhq.com/contacts/`
- Authentication: Bearer token (API Key)
- Required Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_API_KEY`
  - `Version: 2021-07-28`

## Testing

Use the `test-ghl-connection.js` script to verify your API connection:

```bash
node test-ghl-connection.js
```

This will create a test contact and confirm your API key and location ID are properly configured.