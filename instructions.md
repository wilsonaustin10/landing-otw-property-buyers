# Lead Capture Implementation

## Overview
The lead capture system is implemented as a two-step process to maximize lead collection while ensuring data integrity.

## Initial Lead Capture
1. Component: `PropertyForm.tsx`
2. Endpoint: `/api/submit-partial`
3. Function: Creates new lead in Google Sheets
4. Required Fields:
   - Property Address
   - Phone Number
   - Contact Consent

### Flow
1. User enters address (Google Places autocomplete)
2. User enters phone number
3. User accepts contact consent
4. On "Get Cash Offer" click:
   - Validates required fields
   - Generates unique leadId
   - Creates new row in Google Sheets
   - Stores leadId in form state
   - Redirects to property details

## Complete Lead Submission
1. Component: `Contact/page.tsx`
2. Endpoint: `/api/submit-form`
3. Function: Updates existing lead in Google Sheets
4. Required Fields:
   - First Name
   - Last Name
   - Email
   - Property Condition
   - Timeframe
   - Price

### Flow
1. User completes all form steps
2. On final submission:
   - Uses stored leadId
   - Validates all required fields
   - Updates existing row in Google Sheets
   - No duplicate rows created
   - Redirects to thank you page

## Google Sheets Integration
1. Utility: `googleSheets.ts`
2. Functions:
   - `appendLeadToSheet`: Handles both new rows and updates
   - Uses A1 notation for ranges
   - Maintains consistent column structure
   - Records timestamps for all changes

## Data Structure
1. Column Layout:
   - A: timestamp
   - B: leadId
   - C: address
   - D: streetAddress
   - E: city
   - F: state
   - G: postalCode
   - H: phone
   - I: placeId
   - J: firstName
   - K: lastName
   - L: email
   - M: isPropertyListed
   - N: propertyCondition
   - O: timeframe
   - P: price
   - Q: lastUpdated

## Error Handling
1. Field Validation:
   - Phone format: (XXX) XXX-XXXX
   - Required fields check
   - Email format validation
2. API Responses:
   - 200: Success
   - 400: Invalid data
   - 429: Rate limit exceeded
   - 500: Server error

## Best Practices
1. Always generate leadId at first step
2. Update existing rows instead of creating duplicates
3. Maintain data integrity with proper validation
4. Handle errors gracefully with user feedback
5. Track all form interactions for analytics
