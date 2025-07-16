# Google Tag Implementation Verification Guide

## Current Implementation

### Configured Tags
- **Google Ads Conversion Tracking ID 1**: AW-17359126152
- **Google Ads Conversion Tracking ID 2**: AW-17041108639
- **Google Analytics GA4**: Can be configured via `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable

## How to Verify Google Tag is Working

### 1. Using Google Tag Assistant (Chrome Extension)

1. Install the [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk) Chrome extension
2. Navigate to your website
3. Click the Tag Assistant icon in Chrome
4. Click "Enable" and refresh the page
5. You should see:
   - Green tags: Working correctly
   - Blue tags: Minor implementation issues
   - Red tags: Major implementation issues

### 2. Using Google Tag Debugger (Built-in)

In development mode, you'll see a "Show Tag Debug" button in the bottom right corner that shows:
- Whether gtag is loaded
- Configured tag IDs
- Recent events being sent
- A test event button

### 3. Browser Console Verification

Open the browser console and run these commands:

```javascript
// Check if gtag is loaded
console.log('gtag loaded:', typeof window.gtag === 'function');

// Check dataLayer
console.log('dataLayer:', window.dataLayer);

// Send a test event
if (window.gtag) {
  window.gtag('event', 'test_verification', {
    event_category: 'Test',
    event_label: 'Manual Verification'
  });
  console.log('Test event sent');
}
```

### 4. Network Tab Verification

1. Open Chrome DevTools → Network tab
2. Filter by "collect" or "gtag"
3. Refresh the page
4. You should see requests to:
   - `googletagmanager.com/gtag/js`
   - `google-analytics.com/g/collect` (if GA4 is configured)
   - `googleadservices.com` (for Google Ads)

### 5. Google Ads Verification

1. Go to your Google Ads account
2. Navigate to Tools & Settings → Measurement → Conversions
3. Find your conversion actions
4. Check the "Status" column - it should show "Recording conversions" once data is received

### 6. Real-time Testing in Google Analytics

If you have GA4 configured:
1. Go to Google Analytics
2. Navigate to Reports → Real-time
3. Visit your website in another tab
4. You should see your visit appear in real-time

## Common Issues and Solutions

### Issue: Tag Not Firing
- **Solution**: Ensure the website is deployed and not blocked by ad blockers
- **Check**: Scripts are loading in correct order using Next.js Script component

### Issue: Google Site Verification Failing
- **Solution**: Replace `google-site-verification-code` in layout.tsx with your actual verification code
- **Get code from**: Google Search Console → Settings → Ownership verification

### Issue: Events Not Tracking
- **Solution**: Check that gtag is properly initialized before events are sent
- **Verify**: Use the built-in debugger to see if events are being pushed to dataLayer

### Issue: Conversion Tracking Not Working
- **Solution**: Ensure conversion actions are properly set up in Google Ads
- **Check**: Conversion tracking tags match the IDs in your code

## Testing Checklist

- [ ] Google Tag Assistant shows green status
- [ ] Browser console shows gtag is loaded
- [ ] Network tab shows requests to Google servers
- [ ] Debug component shows events being tracked
- [ ] Test event successfully sends
- [ ] Google Ads account shows tag as active
- [ ] Real-time data appears in Google Analytics (if configured)

## Next Steps

1. **Set up Google Site Verification**:
   - Get your verification code from Google Search Console
   - Replace the placeholder in layout.tsx

2. **Configure Environment Variables**:
   - Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to your .env file if using GA4

3. **Test Form Submissions**:
   - Submit a test form to verify conversion tracking
   - Check Google Ads conversion reports after 3-4 hours

4. **Monitor Performance**:
   - Use Google PageSpeed Insights to ensure tags don't impact performance
   - Consider using Google Tag Manager for more complex implementations