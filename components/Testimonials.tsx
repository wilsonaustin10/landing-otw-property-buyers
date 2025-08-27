'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Jason & Mary",
    location: "Dallas, TX",
    text: "We needed to sell our house fast due to a job relocation. NexStep HomeBuyers LLC helped us with a fair cash offer and closed in just 8 days!",
    rating: 5
  },
  {
    name: "Robert Smith",
    location: "Cleveland, OH",
    text: "I inherited a property that needed too many repairs. NexStep HomeBuyers LLC bought it as-is and handled everything. No hassle, just cash in my pocket.",
    rating: 5
  },
  {
    name: "Sarah Johnson",
    location: "Jacksonville, FL",
    text: "After trying to sell with a realtor for 6 months, I contacted NexStep HomeBuyers LLC. They closed quickly and even covered all closing costs!",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          What Our Clients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg transition-transform hover:scale-105 border-b-4 border-primary"
            >
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i}
                      className="h-5 w-5 text-secondary fill-current"
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 