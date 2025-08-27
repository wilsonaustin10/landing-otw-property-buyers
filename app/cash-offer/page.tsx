'use client';

import React, { useState, useEffect } from 'react';
import TestimonialsEnhanced from '../../components/TestimonialsEnhanced';
import FormModal from '../../components/FormModal';
import { Benefits } from '../../components/Benefits';
import { HowItWorks } from '../../components/HowItWorks';
import Image from 'next/image';
import { Home, Clock, DollarSign, Shield, CheckCircle, Phone, MapPin, FileText, ArrowRight } from 'lucide-react';

export default function CashOfferPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openFormModal', handleOpenModal);
    return () => window.removeEventListener('openFormModal', handleOpenModal);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Redesigned to match nationalpropertybuyer */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <Image
              src="/OTW TP.png"
              alt="OTW Property Buyers"
              width={280}
              height={75}
              className="mx-auto mb-8"
              priority
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              We Buy Houses For <span className="text-primary">CASH</span>
            </h1>
            <h2 className="text-3xl md:text-4xl text-gray-800 mb-4 font-semibold">
              Get A Fair Cash Offer In 24 Hours
            </h2>
            <h3 className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              We Buy Houses Nationwide, As-Is. No Agents. No Commissions. No Games.
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-md">
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                <span className="text-lg font-semibold">Cash Offer in 24 Hours</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-md">
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                <span className="text-lg font-semibold">Close in 7 Days</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg shadow-md">
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                <span className="text-lg font-semibold">No Repairs Needed</span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-5 px-10 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              GET MY CASH OFFER
              <ArrowRight className="inline-block ml-2 h-6 w-6" />
            </button>
            
            <p className="mt-6 text-gray-600">
              <span className="font-semibold">No Obligation</span> • <span className="font-semibold">No Fees</span> • <span className="font-semibold">No Commissions</span>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Right after hero */}
      <TestimonialsEnhanced />

      {/* Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-lg text-gray-600">Houses Purchased</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">$50M+</div>
              <div className="text-lg text-gray-600">Cash Paid Out</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">7 Days</div>
              <div className="text-lg text-gray-600">Average Closing</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">A+ BBB</div>
              <div className="text-lg text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Why Sell Your House To OTW Property Buyers?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <DollarSign className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-3">Fair Cash Offers</h3>
              <p className="text-gray-600">
                We provide competitive cash offers based on current market conditions and your property's value.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <Clock className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-3">Fast Closing</h3>
              <p className="text-gray-600">
                Close on your timeline - as fast as 7 days or on a date that works best for you.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <Shield className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-3">Guaranteed Sale</h3>
              <p className="text-gray-600">
                No showings, no open houses, no uncertainty. Get a guaranteed cash offer with no contingencies.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              GET MY CASH OFFER
            </button>
          </div>
        </div>
      </section>

      {/* Detailed Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Selling The Traditional Way vs. Selling To Us
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-lg p-8 border-2 border-red-200">
              <h3 className="text-2xl font-bold mb-6 text-red-700">Traditional Sale</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-xl">✗</span>
                  <span>6% realtor commissions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-xl">✗</span>
                  <span>Months of showings and open houses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-xl">✗</span>
                  <span>Expensive repairs and staging</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-xl">✗</span>
                  <span>Deal can fall through</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2 text-xl">✗</span>
                  <span>Average 60-90 days to close</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-8 border-2 border-green-200">
              <h3 className="text-2xl font-bold mb-6 text-green-700">Sell To Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span>No commissions or fees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span>No showings needed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span>We buy as-is, no repairs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span>Guaranteed cash offer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-xl">✓</span>
                  <span>Close in as little as 7 days</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-xl text-gray-700 mb-6">See why homeowners choose the easy way</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              GET MY CASH OFFER
            </button>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* We Buy Any House Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            We Buy Houses In Any Situation
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Facing Foreclosure',
              'Inherited Property',
              'Divorce',
              'Job Relocation',
              'Tax Liens',
              'Bad Tenants',
              'Major Repairs Needed',
              'Behind on Payments',
              'Downsizing'
            ].map((situation, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-secondary transition-colors hover:shadow-lg">
                <Home className="h-8 w-8 text-secondary mx-auto mb-3" />
                <p className="font-semibold text-gray-800">{situation}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-xl text-gray-700 mb-6">Whatever your situation, we can help</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              GET MY CASH OFFER
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get Your Fair Cash Offer Today!
          </h2>
          <p className="text-xl mb-8">
            No obligations, no fees, no commissions. Get started in less than 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              GET MY CASH OFFER NOW
            </button>
            <div className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              <span>Or Call: (555) 123-4567</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Modal */}
      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}