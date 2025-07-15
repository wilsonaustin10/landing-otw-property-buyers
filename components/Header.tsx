'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative w-[500px] h-[133px]">
              <Image
                src="/OTW TP.png"
                alt="OTW Property Buyers"
                fill
                style={{ objectFit: 'contain' }}
                priority
                className="hover:opacity-90 transition-opacity"
              />
            </div>
          </Link>
          <nav className="hidden md:flex space-x-10">
            <Link 
              href="/" 
              className="text-primary hover:text-accent font-semibold text-xl transition-colors"
            >
              Home
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-primary hover:text-accent font-semibold text-xl transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="#testimonials" 
              className="text-primary hover:text-accent font-semibold text-xl transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center">
            <Link
              href="/#property-form"
              className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-semibold rounded-md shadow-sm text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
            >
              Get Your Offer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 