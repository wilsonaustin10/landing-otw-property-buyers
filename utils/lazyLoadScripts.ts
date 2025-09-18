interface ScriptLoadOptions {
  src?: string;
  innerHTML?: string;
  id?: string;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const loadedScripts = new Map<string, Promise<void>>();

export const loadScript = (options: ScriptLoadOptions): Promise<void> => {
  const scriptId = options.id || options.src || 'inline-script';
  
  if (loadedScripts.has(scriptId)) {
    return loadedScripts.get(scriptId)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    
    if (options.id) script.id = options.id;
    if (options.src) script.src = options.src;
    if (options.innerHTML) script.innerHTML = options.innerHTML;
    if (options.async !== undefined) script.async = options.async;
    if (options.defer !== undefined) script.defer = options.defer;

    script.onload = () => {
      options.onLoad?.();
      resolve();
    };

    script.onerror = () => {
      const error = new Error(`Failed to load script: ${options.src || 'inline'}`);
      options.onError?.(error);
      reject(error);
    };

    document.head.appendChild(script);

    if (!options.src) {
      resolve();
    }
  });

  loadedScripts.set(scriptId, promise);
  return promise;
};

export const lazyLoadGoogleMaps = (): Promise<void> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  return loadScript({
    id: 'google-maps-script',
    src: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`,
    async: true,
    defer: true,
    onLoad: () => {
      if (typeof window !== 'undefined') {
        (window as any).googleMapsLoaded = true;
      }
    },
  }).then(() => {
    return loadScript({
      id: 'google-maps-init',
      innerHTML: `
        function initMap() {
          console.log('Google Maps initialized');
          if (typeof window !== 'undefined') {
            window.googleMapsReady = true;
            window.dispatchEvent(new Event('google-maps-ready'));
          }
        }
        if (typeof window !== 'undefined') {
          window.initMap = initMap;
          if (window.google && window.google.maps) {
            initMap();
          }
        }
      `,
    });
  });
};

export const lazyLoadRecaptcha = (): Promise<void> => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    return Promise.reject(new Error('reCAPTCHA site key not configured'));
  }

  return loadScript({
    id: 'recaptcha-script',
    src: `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`,
    async: true,
    defer: true,
    onLoad: () => {
      console.log('reCAPTCHA loaded');
    },
  });
};

export const lazyLoadGoogleTagManager = (): Promise<void> => {
  const promises: Promise<void>[] = [];

  promises.push(
    loadScript({
      id: 'gtag-script',
      src: 'https://www.googletagmanager.com/gtag/js?id=AW-17359126152',
      async: true,
      onLoad: () => {
        console.log('Google Tag Manager loaded');
      },
    })
  );

  promises.push(
    loadScript({
      id: 'gtag-config',
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        gtag('config', 'AW-17359126152', {
          'page_path': window.location.pathname,
          'transport_type': 'beacon',
          'event_timeout': 3000
        });
        gtag('config', 'AW-17041108639', {
          'page_path': window.location.pathname,
          'transport_type': 'beacon',
          'event_timeout': 3000
        });
        gtag('config', 'GT-5R7D6GDF', {
          'page_path': window.location.pathname,
          'transport_type': 'beacon',
          'event_timeout': 3000
        });
        
        ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {'transport_type': 'beacon'});` : ''}
        
        window.gtag_report_conversion = function(url) {
          var callback = function () {
            if (typeof(url) != 'undefined') {
              window.location = url;
            }
          };
          gtag('event', 'conversion', {
            'send_to': 'AW-17359126152/ySOKCIbjj4obEIj9vNVA',
            'value': 1.0,
            'currency': 'USD',
            'event_callback': callback
          });
          return false;
        }
      `,
    })
  );

  return Promise.all(promises).then(() => undefined);
};