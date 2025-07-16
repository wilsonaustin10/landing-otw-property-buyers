declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', gaId);
    
    // Also configure Google Ads tag
    if (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
    }
  }
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Track a Google Ads conversion
export const trackConversion = (conversionId: string, conversionLabel: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${conversionId}/${conversionLabel}`,
      ...params
    });
  }
};

// Track the main lead form submission conversion (the one Google Ads is monitoring)
export const trackLeadFormSubmission = (additionalParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // This is the conversion Google Ads is looking for
    window.gtag('event', 'conversion', {
      'send_to': 'AW-17359126152/c162CKD-jfIaEIj9vNVA',
      'value': 1.0,
      'currency': 'USD',
      ...additionalParams
    });
  }
}; 