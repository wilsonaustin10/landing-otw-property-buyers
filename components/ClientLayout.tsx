'use client';

import { FormProvider } from '../context/FormContext';
import Header from './Header';
import Footer from './Footer';
import Script from 'next/script';
import GoogleTagDebugger from './GoogleTagDebugger';
import GooglePlacesDebugger from './GooglePlacesDebugger';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Google Maps script loaded successfully');
          // Set a global flag to indicate the script is loaded
          if (typeof window !== 'undefined') {
            (window as any).googleMapsLoaded = true;
          }
        }}
        onError={(e) => {
          console.error('Error loading Google Maps script:', e);
        }}
      />
      <Script id="google-maps-init" strategy="afterInteractive">
        {`
          function initMap() {
            console.log('Google Maps initialized');
            if (typeof window !== 'undefined') {
              window.googleMapsReady = true;
              // Dispatch a custom event to notify components
              window.dispatchEvent(new Event('google-maps-ready'));
            }
          }
          // Also set initMap on window for Google to call
          if (typeof window !== 'undefined') {
            window.initMap = initMap;
          }
        `}
      </Script>
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="beforeInteractive"
      />
      
      <FormProvider>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <GoogleTagDebugger />
        <GooglePlacesDebugger />
      </FormProvider>
    </>
  );
}