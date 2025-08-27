'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative w-[100px] md:w-[600px] h-[80px] md:h-[160px]">
              <Image
                src="/Nexstep Red White Blue 1024px.png"
                alt="NexStep HomeBuyers LLC"
                fill
                sizes="(max-width: 768px) 100px, 600px"
                style={{ objectFit: 'contain' }}
                priority
                className="hover:opacity-90 transition-opacity"
              />
            </div>
          </Link>
          <nav className="hidden md:flex space-x-5">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center">
            <Link
              href="/#property-form"
              className="inline-flex items-center px-2 py-2 text-sm md:px-4 md:text-base font-medium rounded shadow-sm text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all whitespace-nowrap"
            >
              Get Your Offer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 