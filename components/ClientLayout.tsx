'use client';

import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import GoogleTagDebugger from '../components/GoogleTagDebugger';
import GooglePlacesDebugger from '../components/GooglePlacesDebugger';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('Google Maps script loaded');
        }}
        onError={(e) => {
          console.error('Error loading Google Maps script:', e);
        }}
      />
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