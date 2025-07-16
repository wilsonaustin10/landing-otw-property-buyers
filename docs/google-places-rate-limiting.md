# Google Places API Rate Limiting Implementation

## Current Rate Limiting Features

### 1. **Built-in Google SDK Debouncing**
The Google Places Autocomplete widget has built-in debouncing. It doesn't make API calls on every keystroke but waits for the user to pause typing.

### 2. **Minimum Character Requirement**
- Autocomplete is disabled for inputs shorter than 3 characters
- This prevents unnecessary API calls for partial addresses like "1" or "12"

### 3. **Session Tokens**
- Each autocomplete session uses a unique token
- Groups autocomplete requests and place details into a single billable session
- New token is generated after each place selection

### 4. **Single Initialization**
- The autocomplete widget is initialized only once per component mount
- `isInitializedRef` prevents duplicate instances
- Proper cleanup on unmount

### 5. **Memoized Callbacks**
- `useCallback` prevents function recreation on re-renders
- Stable references prevent unnecessary re-initializations

### 6. **API Call Monitoring**
- Real-time monitoring of API calls
- Visual indicators when usage is high
- Detailed logging for debugging

## How It Works

```javascript
// Minimum 3 characters before enabling autocomplete
useGooglePlaces(inputRef, handleAddressSelect, !readOnly, 3);

// Built-in features:
- Session tokens for billing optimization
- Input event filtering for short inputs
- Initialization guards to prevent duplicates
- Proper cleanup on component unmount
```

## Monitoring Tools

### Google Places Monitor (Bottom Right)
- Shows total API calls
- Session duration
- Average calls per minute
- Recent activity log
- Visual timeline of calls

### Google Places Debugger (Bottom Left)
- API key validation status
- Library loading status
- Error messages
- Configuration details

## Best Practices

1. **Don't Add Custom Debouncing**: Google's SDK already handles this efficiently
2. **Use Session Tokens**: Already implemented - reduces costs significantly
3. **Monitor Usage**: Use the built-in monitor to track API calls
4. **Check for Re-renders**: If seeing high API usage, check component re-rendering

## Cost Optimization

With session tokens properly implemented:
- Autocomplete requests: Free (up to the session limit)
- Place Details: $0.017 per request
- Sessions are billed as one Place Details request

## Troubleshooting High API Usage

If you see excessive API calls:

1. **Check the Monitor**: Look for patterns in the timeline
2. **Verify Single Initialization**: Console should show "Initializing Google Places Autocomplete" only once
3. **Check Component Re-renders**: Parent components might be causing re-mounts
4. **Review Error Logs**: Failed initializations might cause retries

## Fixed Issues

1. **verifyGoogleApiKey Spam**: Fixed by caching the verification result
2. **Excessive Polling**: Reduced interval frequency and added early exit conditions
3. **Multiple Instances**: Added initialization guards and proper cleanup