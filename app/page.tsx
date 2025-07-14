import React from 'react';
import PropertyForm from '../components/PropertyForm';
import Testimonials from '../components/Testimonials';
import TrustBadges from '../components/TrustBadges';  // Kept for future use
import { CheckCircle } from 'lucide-react';
import { Benefits } from '../components/Benefits';
import { HowItWorks } from '../components/HowItWorks';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section id="property-form" className="pt-20 pb-16 px-4 bg-gradient-to-br from-primary to-secondary bg-opacity-90">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              The fastest and easiest way to sell your house
            </h1>
            <p className="text-xl text-white mb-8">
              Sell your house in as little as 7 days - no repairs, no fees, and we cover closing costs
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <PropertyForm />
          </div>
          <Benefits className="mx-auto mt-12" />
        </div>
      </section>

      {/* TrustBadges component removed but kept for future use */}
      {/* <TrustBadges /> */}
      
      {/* Benefits Section */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary">
            Why Sell Your House To Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fast Closing',
                description: 'Close in as little as 7 days or on your timeline'
              },
              {
                title: 'No Repairs Needed',
                description: 'We buy houses in any condition - you won\'t need to fix anything'
              },
              {
                title: 'No Fees or Commissions',
                description: 'Save thousands in realtor fees and closing costs'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-lg shadow-lg bg-white border-t-4 border-secondary">
                <h3 className="text-xl font-semibold mb-3 text-primary">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 bg-gray-100">
        <Testimonials />
      </section>
    </main>
  );
} 