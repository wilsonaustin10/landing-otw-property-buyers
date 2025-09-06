import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get a Cash Offer for Your House - OTW Property Buyers',
  description: 'Sell your house fast for cash. Get a fair offer in 24 hours. No repairs needed, no fees, close in 7 days. Local cash home buyers you can trust.',
  keywords: 'sell house fast, cash home buyers, we buy houses, sell house for cash, quick house sale',
  authors: [{ name: 'OTW Property Buyers' }],
  creator: 'OTW Property Buyers',
  publisher: 'OTW Property Buyers',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://otwpropertybuyers.com'),
  alternates: {
    canonical: '/offer',
  },
  openGraph: {
    title: 'Get a Cash Offer for Your House - OTW Property Buyers',
    description: 'Sell your house fast for cash. Get a fair offer in 24 hours. No repairs, no fees.',
    url: 'https://otwpropertybuyers.com/offer',
    siteName: 'OTW Property Buyers',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OTW Property Buyers - We Buy Houses for Cash',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get a Cash Offer for Your House - OTW Property Buyers',
    description: 'Sell your house fast for cash. Get a fair offer in 24 hours.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};