'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 md:py-2">
        <div className="flex flex-col md:flex-row items-center md:justify-between space-y-3 md:space-y-0">
          <Link href="/" className="flex items-center w-full md:w-auto justify-center md:justify-start">
            <div className="relative w-[280px] xs:w-[320px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[75px] xs:h-[85px] sm:h-[80px] md:h-[106px] lg:h-[133px]">
              <Image
                src="/OTW TP.png"
                alt="OTW Property Buyers"
                fill
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 400px, 500px"
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
          <div className="flex items-center w-full md:w-auto justify-center md:justify-end">
            <Link
              href="/#property-form"
              className="inline-flex items-center px-6 xs:px-8 sm:px-4 md:px-6 py-2.5 xs:py-3 sm:py-2.5 md:py-3 border border-transparent text-base xs:text-lg sm:text-base md:text-lg font-semibold rounded-md shadow-sm text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors transform hover:scale-105 md:hover:scale-100"
            >
              <span className="hidden xs:inline sm:inline">Get Your Offer</span>
              <span className="xs:hidden">Get Offer</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 