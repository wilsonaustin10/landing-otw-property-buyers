import { Metadata } from 'next';
import { Suspense } from 'react';
import OfferClient from './OfferClient';

export const metadata: Metadata = {
  title: 'Sell Your House Fast | Get Cash Offer in 24 Hours | OTW Property Buyers',
  description: 'Get a fair cash offer for your house in 24 hours. We buy houses as-is, close in 7 days. No fees, no commissions. Call (505) 560-3532 for instant offer.',
  keywords: 'sell house fast, cash home buyers, we buy houses, sell my house, cash offer',
  openGraph: {
    title: 'Sell Your House Fast - Get Cash Offer Today',
    description: 'Fair cash offers, fast closing, no repairs needed. We buy houses in any condition.',
    type: 'website',
  },
};

export default function OfferPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <OfferClient />
    </Suspense>
  );
}