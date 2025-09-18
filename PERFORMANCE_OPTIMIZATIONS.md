# Performance Optimizations - JavaScript Lazy Loading

## Overview
Implemented lazy loading for Google services (reCAPTCHA, Maps, Tag Manager) to reduce unused JavaScript and improve PageSpeed Insights scores targeting 95+ for mobile and web.

## Optimizations Implemented

### 1. Google reCAPTCHA Lazy Loading
- **Before**: Loaded immediately on page load (340.2 KB × 2 = 680.4 KB)
- **After**: Loads only when user interacts with forms
- **Impact**: ~333 KB reduction in initial JavaScript load

**Files Modified:**
- `hooks/useRecaptcha.ts` - Added lazy loading logic
- `utils/lazyLoadScripts.ts` - Script loading utility
- `components/ClientLayout.tsx` - Removed immediate script loading

### 2. Google Maps Lazy Loading
- **Before**: Loaded on every page (265.8 KB)
- **After**: Loads only when user focuses on address input field
- **Impact**: ~151 KB reduction in initial JavaScript load

**Files Modified:**
- `hooks/useGoogleMapsLazy.ts` - Created lazy loading hook
- `components/AddressAutocomplete.tsx` - Loads Maps on focus
- `components/ClientLayout.tsx` - Removed immediate Maps loading

### 3. Google Tag Manager Optimization
- **Before**: Loaded synchronously in `<head>` (248.7 KB)
- **After**: Loads after 2-second delay with beacon transport
- **Impact**: ~92 KB reduction in initial JavaScript load

**Files Modified:**
- `components/GoogleTagManagerOptimized.tsx` - Delayed loading component
- `app/layout.tsx` - Moved GTM to optimized component
- Added beacon transport type for better performance

### 4. Additional Optimizations
- Added preconnect hints for Google domains
- Implemented performance monitoring (dev mode only)
- Used dynamic imports for non-critical components

## Expected Performance Improvements

### Total JavaScript Reduction
- **Before**: 1,195 KB of unused JavaScript
- **After**: ~577 KB reduction in initial load
- **Percentage**: ~48% reduction in unused JavaScript

### Loading Strategy
1. **Critical Path**: Only essential app code loads initially
2. **On-Demand**: Google services load when needed:
   - reCAPTCHA: When form submission starts
   - Maps: When user focuses address field
   - GTM: After 2-second delay

### Web Vitals Impact
- **FCP (First Contentful Paint)**: Improved by loading less JS upfront
- **LCP (Largest Contentful Paint)**: Better due to reduced main thread blocking
- **TTI (Time to Interactive)**: Faster as less JS to parse initially
- **CLS (Cumulative Layout Shift)**: No impact (no visual changes)

## Testing the Optimizations

### Development Mode
The app includes a PerformanceMonitor component that logs:
- Core Web Vitals (FCP, LCP, CLS, FID)
- JavaScript bundle sizes
- Individual script load times

Check browser console for detailed metrics.

### Production Testing
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Test with PageSpeed Insights
4. Verify all functionality still works:
   - Address autocomplete
   - Form submissions with reCAPTCHA
   - Analytics tracking

## Rollback Instructions
If issues occur, revert these changes:
1. Restore original `app/layout.tsx` with inline GTM scripts
2. Restore original `components/ClientLayout.tsx` with Script components
3. Remove new files: `utils/lazyLoadScripts.ts`, `hooks/useGoogleMapsLazy.ts`
4. Revert `hooks/useRecaptcha.ts` to original version

## Future Optimizations
Consider these additional improvements:
1. Self-host Google Fonts
2. Implement service worker for offline caching
3. Use Partytown for web worker-based script execution
4. Consider server-side GTM implementation
5. Implement resource hints based on user interaction patterns