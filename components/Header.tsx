'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-1.5 md:py-1">
        <div className="flex flex-col md:flex-row items-center md:justify-between space-y-1.5 md:space-y-0">
          <Link href="/" className="flex items-center w-full md:w-auto justify-center md:justify-start">
            <div className="relative w-[140px] xs:w-[160px] sm:w-[150px] md:w-[200px] lg:w-[250px] h-[37px] xs:h-[42px] sm:h-[40px] md:h-[53px] lg:h-[66px]">
              <Image
                src="/optimized/OTW Banner.png"
                alt="OTW Property Buyers"
                fill
                sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 200px, 250px"
                style={{ objectFit: 'contain' }}
                priority
                className="hover:opacity-90 transition-opacity"
              />
            </div>
          </Link>
          <nav className="hidden md:flex space-x-5">
            <Link 
              href="/" 
              className="text-primary hover:text-accent font-semibold text-sm transition-colors"
            >
              Home
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-primary hover:text-accent font-semibold text-sm transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="#testimonials" 
              className="text-primary hover:text-accent font-semibold text-sm transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center w-full md:w-auto justify-center md:justify-end">
            <Link
              href="/#property-form"
              className="inline-flex items-center px-3 xs:px-4 sm:px-2 md:px-3 py-1.5 xs:py-1.5 sm:py-1 md:py-1.5 border border-transparent text-xs xs:text-sm sm:text-xs md:text-sm font-semibold rounded-md shadow-sm text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors transform hover:scale-105 md:hover:scale-100"
            >
              <span>Get Offer</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 