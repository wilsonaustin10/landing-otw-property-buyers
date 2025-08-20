import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '../components/ClientLayout';
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
        {/* Google Site Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="google-site-verification-code" />
        
        {/* CRITICAL: Google Tag (gtag.js) - MUST be in <head> for Google to detect it */}
        {/* Using standard script tags as Google requires - not Next.js Script component */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17359126152"
        />
        <script
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
              
              // Google Tag Manager
              gtag('config', 'GT-5R7D6GDF', {
                'page_path': window.location.pathname,
              });
              
              // Google Analytics (if you have a GA4 property)
              ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');` : ''}
              
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
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
} 