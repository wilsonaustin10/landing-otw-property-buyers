import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '../components/ClientLayout';
import Script from 'next/script';

// Optimize font loading with display swap and subset
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Critical Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Preconnect to optimize third-party resources */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="google-site-verification-code" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        
        {/* Move analytics to end of body with async loading */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-17359126152"
        />
        
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Defer non-critical tracking
              if (document.readyState === 'complete') {
                initTracking();
              } else {
                window.addEventListener('load', initTracking);
              }
              
              function initTracking() {
                // Google Ads Conversion Tracking
                gtag('config', 'AW-17359126152', {
                  'page_path': window.location.pathname,
                  'send_page_view': false
                });
                gtag('config', 'AW-17041108639', {
                  'page_path': window.location.pathname,
                  'send_page_view': false
                });
                
                // Google Tag Manager
                gtag('config', 'GT-5R7D6GDF', {
                  'page_path': window.location.pathname,
                });
                
                ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `
                // Google Analytics
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  'page_path': window.location.pathname,
                });` : ''}
              }
              
              // Phone call conversion tracking function
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
          }}
        />
      </body>
    </html>
  );
}