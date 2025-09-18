import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '../components/ClientLayout';
import GoogleTagManagerOptimized from '../components/GoogleTagManagerOptimized';
import dynamic from 'next/dynamic';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

const PerformanceMonitor = dynamic(
  () => import('../components/PerformanceMonitor'),
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
        
        {/* Google Site Verification - Replace with your actual verification code */}
        <meta name="google-site-verification" content="google-site-verification-code" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <GoogleTagManagerOptimized />
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
      </body>
    </html>
  );
}