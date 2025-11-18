'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Home, DollarSign, Clock, Wrench, Phone, MessageSquare, 
  CheckCircle, Star, MapPin, Shield, Award, TrendingUp,
  ChevronDown, ChevronUp, ArrowRight, MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';

// Lazy load form component
const MultiStepPropertyForm = dynamic(
  () => import('../../components/MultiStepPropertyForm'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);

const companyName = 'OTW Property Buyers';
const phoneNumber = '(575)500-7490';

export default function OfferClient() {
  const searchParams = useSearchParams();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  
  // Dynamic location based on URL parameters with fallbacks
  const city = searchParams.get('city') || searchParams.get('utm_city') || searchParams.get('fb_city') || '';
  const state = searchParams.get('state') || searchParams.get('utm_state') || searchParams.get('fb_state') || '';
  const metro = searchParams.get('metro') || searchParams.get('utm_metro') || searchParams.get('fb_metro') || city;
  
  // Check if we have location data or should use nationwide messaging
  const hasLocation = city && state;

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById('hero')?.offsetHeight || 600;
      setIsSticky(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const phoneUrl = `tel:${phoneNumber.replace(/[^\d]/g, '')}`;
    
    // Track with dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'cta_click', type: 'phone' });
    }
    
    // Track phone call conversion
    if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
      (window as any).gtag_report_conversion(phoneUrl);
    } else {
      // Fallback if conversion tracking isn't loaded
      window.location.href = phoneUrl;
    }
  };

  const handleSmsClick = () => {
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'cta_click', type: 'sms' });
    }
  };

  const faqs = [
    {
      question: `How fast can you close on my ${hasLocation ? `${city} ` : ''}property?`,
      answer: 'We can typically close in as little as 7-14 days, depending on your timeline. If you need more time, we\'re flexible and can work with your schedule.'
    },
    {
      question: 'Will I need to make any repairs before selling?',
      answer: 'No repairs needed! We buy houses in any condition - from move-in ready to properties that need major repairs. We handle all the work after purchase.'
    },
    {
      question: 'Are there any fees or commissions?',
      answer: 'Zero fees or commissions! Unlike traditional real estate sales, you keep 100% of the offer price. We even cover closing costs.'
    },
    {
      question: 'How do you determine your offer price?',
      answer: 'We evaluate comparable sales in your area, the property condition, and current market conditions to make a fair, competitive cash offer.'
    },
    {
      question: hasLocation ? `What areas of ${city} do you serve?` : 'What areas do you serve?',
      answer: hasLocation 
        ? `We buy houses throughout the entire ${metro} metroplex, including all surrounding suburbs and neighborhoods.`
        : 'We buy houses nationwide! We have local partners in all 50 states who can help you sell your property quickly.'
    }
  ];

  const scrollToForm = () => {
    const formElement = document.getElementById('property-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-b from-primary/5 to-white py-6 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {hasLocation 
                ? `Sell Your ${city}, ${state} House Fast`
                : 'Sell Your House Fast, Nationwide'
              }
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Get a Fair Cash Offer in 24 Hours • Close in 7 Days • No Fees or Commissions
            </p>
            
            {/* CTA Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 max-w-md mx-auto">
              <button
                onClick={scrollToForm}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                Get Offer <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
                onClick={handlePhoneClick}
                className="bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" /> {phoneNumber}
              </a>
            </div>
          </div>

          {/* Form Section - Above the fold on mobile */}
          <div id="property-form" className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-center mb-6">
                Get Offer Today!
              </h2>
              <MultiStepPropertyForm />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Choose {companyName}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <DollarSign className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Fair Cash Offers</h3>
              <p className="text-gray-600">Get a competitive cash offer based on current market values</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Fast Closing</h3>
              <p className="text-gray-600">Close in as little as 7 days or on your timeline</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Wrench className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Repairs Needed</h3>
              <p className="text-gray-600">We buy houses as-is, no matter the condition</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Zero Fees</h3>
              <p className="text-gray-600">No commissions, no closing costs, no hidden fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            How It Works - 3 Simple Steps
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold text-xl mb-2">Submit Your Info</h3>
                <p className="text-gray-600">Fill out our simple form or call us directly</p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold text-xl mb-2">Get Your Offer</h3>
                <p className="text-gray-600">Receive a fair cash offer within 24 hours</p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold text-xl mb-2">Close & Get Paid</h3>
                <p className="text-gray-600">Choose your closing date and get your cash</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full bg-white p-4 rounded-lg shadow-md text-left flex justify-between items-center hover:shadow-lg transition-shadow"
                >
                  <span className="font-semibold">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="bg-white px-4 pb-4 rounded-b-lg shadow-md -mt-1">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Sell Your House Fast?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get your no-obligation cash offer today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToForm}
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Offer
            </button>
            <a
              href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
              onClick={handlePhoneClick}
              className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" /> Call {phoneNumber}
            </a>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      {isSticky && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 md:hidden">
          <div className="flex">
            <button
              onClick={scrollToForm}
              className="flex-1 bg-primary text-white py-3 font-semibold hover:bg-primary-dark transition-colors"
            >
              Get Offer
            </button>
            <a
              href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
              onClick={handlePhoneClick}
              className="flex-1 bg-secondary text-white py-3 font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> Call Now
            </a>
          </div>
        </div>
      )}
    </>
  );
}