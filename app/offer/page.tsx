'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Home, DollarSign, Clock, Wrench, Phone, MessageSquare, 
  CheckCircle, Star, MapPin, Shield, Award, TrendingUp,
  ChevronDown, ChevronUp, ArrowRight, MoreHorizontal
} from 'lucide-react';
import Script from 'next/script';
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
const phoneNumber = '(505) 560-3532';

function OfferPageContent() {
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

    window.addEventListener('scroll', handleScroll);
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

  const testimonials = [
    {
      name: 'Sarah M.',
      location: hasLocation ? `${city}, ${state}` : 'Dallas, TX',
      rating: 5,
      text: 'Sold my inherited property in just 10 days. No repairs, no hassle, and they handled everything professionally.',
      timeAgo: '1 week ago',
      initials: 'SM',
      bgColor: 'bg-red-500'
    },
    {
      name: 'Michael R.',
      location: 'Fort Worth, TX',
      rating: 5,
      text: 'Facing foreclosure and needed to sell fast. OTW Property Buyers gave me a fair offer and closed in a week. Saved my credit!',
      timeAgo: '2 months ago',
      initials: 'MR',
      bgColor: 'bg-blue-500'
    },
    {
      name: 'Jennifer L.',
      location: 'Arlington, TX',
      rating: 5,
      text: 'The house needed too many repairs to list traditionally. They bought it as-is and the process was incredibly smooth.',
      timeAgo: '4 months ago',
      initials: 'JL',
      bgColor: 'bg-green-500'
    },
    {
      name: 'David K.',
      location: 'Plano, TX',
      rating: 5,
      text: 'Had to relocate for work urgently. OTW offered a fair price and closed in 5 days. No realtor fees or hassles!',
      timeAgo: '3 weeks ago',
      initials: 'DK',
      bgColor: 'bg-purple-500'
    },
    {
      name: 'Linda P.',
      location: 'Houston, TX',
      rating: 5,
      text: 'Dealt with a difficult divorce situation. They were compassionate, professional, and made everything simple. Highly recommend!',
      timeAgo: '6 weeks ago',
      initials: 'LP',
      bgColor: 'bg-indigo-500'
    },
    {
      name: 'Robert T.',
      location: 'Austin, TX',
      rating: 5,
      text: 'Property had foundation issues and water damage. They still gave me a great offer and handled all the paperwork. Amazing service!',
      timeAgo: '2 weeks ago',
      initials: 'RT',
      bgColor: 'bg-orange-500'
    }
  ];

  return (
    <>
      <Script 
        id="structured-data" 
        type="application/ld+json"
        strategy="lazyOnload">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": companyName,
          "image": "/OTW TP.png",
          "url": typeof window !== 'undefined' ? window.location.origin : 'https://otwpropertybuyers.com',
          "telephone": phoneNumber,
          "areaServed": hasLocation ? `${metro} Metroplex` : "United States",
          "address": hasLocation ? {
            "@type": "PostalAddress",
            "addressLocality": city,
            "addressRegion": state,
            "addressCountry": "US"
          } : {
            "@type": "PostalAddress",
            "addressCountry": "US"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127"
          }
        })}
      </Script>


      {/* Hero Section */}
      <section id="hero" className="bg-gradient-to-br from-primary to-accent text-white py-6 sm:py-12 lg:py-16 px-4" role="banner" aria-label="Hero section">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout - Form First */}
          <div className="lg:hidden">
            {/* Compact header for mobile */}
            <div className="mb-4 text-center">
              <Image
                src="/OTW TP.png"
                alt="OTW Property Buyers"
                width={150}
                height={40}
                className="object-contain mx-auto mb-3"
                priority
                quality={85}
                sizes="150px"
              />
              <h1 className="text-2xl font-bold mb-2 leading-tight">
                Sell Your House for Cash {hasLocation ? `in ${city}` : 'Fast'}
              </h1>
              <p className="text-sm text-white/90">
                Get a fair cash offer in 24 hours
              </p>
            </div>

            {/* Form - Priority on mobile */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto mb-6">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-text mb-1">Get Your Cash Offer</h2>
                <p className="text-sm text-gray-600">Takes less than 2 minutes</p>
              </div>
              <div className="p-4">
                <MultiStepPropertyForm />
              </div>
            </div>

            {/* Additional info below form on mobile */}
            <div className="text-center">
              <div className="flex items-center justify-center bg-white/10 backdrop-blur rounded-lg px-3 py-2 mb-4">
                <Shield className="w-4 h-4 mr-2 text-highlight" />
                <span className="text-xs">{hasLocation ? `Local ${city} Company` : 'Nationwide Cash Buyer'}</span>
              </div>
              
              {/* Mobile CTA Buttons */}
              <div className="flex gap-3">
                <a 
                  href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
                  onClick={handlePhoneClick}
                  className="flex-1 bg-secondary text-white py-2.5 px-3 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-colors flex items-center justify-center"
                  aria-label="Call OTW Property Buyers"
                >
                  <Phone className="w-4 h-4 mr-1.5" />
                  Call Now
                </a>
                <a 
                  href={`sms:${phoneNumber.replace(/[^\d]/g, '')}`}
                  onClick={handleSmsClick}
                  className="flex-1 bg-accent text-white py-2.5 px-3 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-colors flex items-center justify-center"
                  aria-label="Text OTW Property Buyers"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Text Us
                </a>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Original Grid */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6 flex justify-center md:justify-start">
                <Image
                  src="/OTW TP.png"
                  alt="OTW Property Buyers"
                  width={200}
                  height={53}
                  className="object-contain"
                  priority
                  quality={85}
                  sizes="200px"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Sell Your House for Cash {hasLocation ? `in ${city}` : 'Fast'}
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-white/90">
                Get a fair cash offer in 24 hours. No repairs needed, no fees, and we can close in as little as 7 days.
              </p>
              
              {/* Trust Badge */}
              <div className="mb-8">
                <div className="flex justify-center md:justify-start">
                  <div className="flex items-center bg-white/10 backdrop-blur rounded-lg px-4 py-2">
                    <Shield className="w-5 h-5 mr-2 text-highlight" />
                    <span className="text-sm">{hasLocation ? `Local ${city} Company` : 'Nationwide Cash Buyer'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto lg:max-w-none">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-text mb-2">Get Your Cash Offer</h2>
                <p className="text-gray-600">Takes less than 2 minutes - No obligations</p>
              </div>
              <div className="p-6 md:p-8">
                <MultiStepPropertyForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      {isSticky && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 z-50 shadow-lg" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full bg-secondary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            aria-label="Scroll to form"
          >
            Get My Cash Offer
          </button>
        </div>
      )}

      {/* Value Props */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50" aria-label="Our value proposition">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Closing</h3>
              <p className="text-gray-600">Close in as little as 7 days or on your timeline</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Repairs Needed</h3>
              <p className="text-gray-600">We buy houses in any condition, as-is</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">We Pay Closing Costs</h3>
              <p className="text-gray-600">No fees, no commissions, no hidden costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 px-4" aria-label="How it works">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: 1, title: 'Submit Property Info', desc: 'Fill out our simple form with your property details' },
              { step: 2, title: 'Get Your Offer', desc: 'Receive a fair cash offer within 24 hours' },
              { step: 3, title: 'Accept & Schedule', desc: 'Accept the offer and pick your closing date' },
              { step: 4, title: 'Get Paid', desc: 'Close on your timeline and get your cash' }
            ].map((item, index) => (
              <div key={item.step} className="text-center relative">
                <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < 3 && (
                  <ArrowRight className="hidden lg:block absolute top-6 -right-4 w-8 h-8 text-gray-300" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust and Certification Section */}
      <section className="py-10 sm:py-12 px-4 bg-white" aria-label="Trust and certifications">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">Trusted & Certified</h2>
            <div className="flex flex-wrap gap-8 justify-center items-center">
              <div className="flex items-center">
                <Image 
                  src="/5Star.png" 
                  alt="5 Star Rating" 
                  width={120} 
                  height={100} 
                  className="object-contain"
                  loading="lazy"
                  quality={75}
                  sizes="120px"
                />
              </div>
              <div className="flex items-center">
                <Image 
                  src="/SatGuar.png" 
                  alt="Satisfaction Guaranteed" 
                  width={120} 
                  height={100} 
                  className="object-contain"
                  loading="lazy"
                  quality={75}
                  sizes="120px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50" aria-label="Customer testimonials">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Sellers Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Review Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Profile Picture */}
                      <div className={`w-10 h-10 rounded-full ${testimonial.bgColor} flex items-center justify-center text-white font-semibold text-sm`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                        <p className="text-xs text-gray-500">{testimonial.location}</p>
                      </div>
                    </div>
                    {/* More Options */}
                    <button className="text-gray-400 hover:text-gray-600" aria-label="More options">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Rating and Time */}
                <div className="px-4 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{testimonial.timeAgo}</span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="px-4 pb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">{testimonial.text}</p>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-end space-x-4">
                    <button className="text-xs text-gray-600 hover:text-blue-600">Helpful</button>
                    <button className="text-xs text-gray-600 hover:text-blue-600">Share</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Credibility */}
      <section className="py-12 sm:py-16 px-4" aria-label="Local presence">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            {hasLocation ? `We Buy Houses in ${city} Neighborhoods` : 'We Buy Houses Nationwide'}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {hasLocation 
              ? `Serving the entire ${metro} metroplex including Downtown ${city}, Uptown, Oak Lawn, Highland Park, Preston Hollow, Lake Highlands, and all surrounding areas.`
              : 'We have local partners across all 50 states ready to make you a fair cash offer. No matter where your property is located, we can help you sell fast.'}
          </p>
          <div className="flex items-center justify-center text-secondary">
            <MapPin className="w-6 h-6 mr-2" />
            <span className="font-semibold">
              {hasLocation ? `Local ${city} Company Since 2015` : 'Nationwide Network Since 2015'}
            </span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50" aria-label="Frequently asked questions">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={expandedFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div id={`faq-answer-${index}`} className="px-4 sm:px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-12 sm:py-16 px-4 bg-accent text-white" aria-label="Call to action">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Sell Your {hasLocation ? `${city} ` : ''}House?
          </h2>
          <p className="text-lg sm:text-xl mb-8">Get your no-obligation cash offer today. It only takes 2 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-secondary text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-colors inline-flex items-center justify-center"
              aria-label="Scroll to form to get cash offer"
            >
              Get My Cash Offer
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <a 
              href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
              onClick={handlePhoneClick}
              className="bg-white text-accent py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              aria-label="Call OTW Property Buyers"
            >
              <Phone className="mr-2 w-5 h-5" />
              Call {phoneNumber}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default function OfferPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    }>
      <OfferPageContent />
    </Suspense>
  );
}