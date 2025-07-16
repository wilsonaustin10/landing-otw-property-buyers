'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager - Load First for Detection */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17359126152"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17359126152');
              gtag('config', 'AW-17041108639');
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
      </head>
      <body className={inter.className}>
        <FormProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </FormProvider>
      </body>
    </html>
  );
} 