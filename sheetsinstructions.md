# Google Sheets Integration Framework

## Environment Setup

1. Required Environment Variables:
```env
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
```

2. Required Dependencies:
```json
{
  "dependencies": {
    "googleapis": "latest"
  }
}
```

## Sheet Structure

Column layout (A to Q):
1. timestamp - Submission time (A)
2. leadId - Unique identifier (B)
3. address - Property address (C)
4. streetAddress - Street address component (D)
5. city - City component (E)
6. state - State component (F)
7. postalCode - Postal code (G)
8. phone - Contact phone (H)
9. placeId - Google Places ID (I)
10. firstName - First name (J)
11. lastName - Last name (K)
12. email - Email address (L)
13. isPropertyListed - Property listing status (M)
14. propertyCondition - Property condition (N)
15. timeframe - Selling timeframe (O)
16. price - Asking price (P)
17. lastUpdated - Last modification time (Q)

## Implementation

1. Authentication Setup:
```typescript
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
```

2. Sheet Connection:
```typescript
const sheets = google.sheets({ version: 'v4', auth });
```

3. Data Submission:
```typescript
const response = await sheets.spreadsheets.values.append({
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  range: 'Sheet1!A:K',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [row]
  }
});
```

## Lead Capture Flow

1. Initial Submission (Partial Lead):
- Triggered by first "Get Cash Offer" click
- Captures address and phone
- Generates unique leadId
- Marks as 'partial' submission

2. Complete Submission:
- Includes all form fields
- Uses existing leadId
- Updates previous entry if exists
- Marks as 'complete' submission

## Error Handling

1. Environment Validation:
```typescript
if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
  throw new Error('Missing required Google Sheets credentials');
}
```

2. Response Validation:
```typescript
if (response.status !== 200) {
  throw new Error('Failed to append to sheet');
}
```

3. Error Response Format:
```typescript
return { 
  success: false, 
  error: error instanceof Error ? error.message : 'Failed to append to sheet' 
};
```

## Best Practices

1. Data Formatting:
- Use ISO strings for dates
- Clean and standardize inputs
- Handle missing fields gracefully

2. Performance:
- Minimize API calls
- Use batch operations when possible
- Implement connection caching

3. Security:
- Validate all inputs
- Use service account authentication
- Implement rate limiting
- Store credentials securely

4. Maintenance:
- Log all operations
- Monitor API quotas
- Regular backup procedures
- Document all changes