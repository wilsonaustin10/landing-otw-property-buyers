'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import GoogleTagDebugger from '../components/GoogleTagDebugger';
import GooglePlacesDebugger from '../components/GooglePlacesDebugger';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Site Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="google-site-verification-code" />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager - Using Next.js Script for better performance */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17359126152"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Google Ads Conversion Tracking
              gtag('config', 'AW-17359126152', {
                'page_path': window.location.pathname,
              });
              gtag('config', 'AW-17041108639', {
                'page_path': window.location.pathname,
              });
              
              // Google Analytics (if you have a GA4 property)
              ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');` : ''}
            `,
          }}
        />
        
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
      </body>
    </html>
  );
} 