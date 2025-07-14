import React from 'react';
import { MessageSquare, Clock, HandshakeIcon, Banknote } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Tell us about your property',
      description: "It's quick, easy, and free!"
    },
    {
      icon: Clock,
      title: 'If it meets our buying criteria',
      description: 'We will contact you to setup a quick appointment.'
    },
    {
      icon: HandshakeIcon,
      title: 'We present you with a fair all-cash offer',
      description: 'Or discuss the best method to proceed.'
    },
    {
      icon: Banknote,
      title: 'We close at a local reputable title company',
      description: 'Have cash in your hands in as little as 7 days!'
    }
  ];

  return (
    <section className="py-16 bg-gray-50" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          How The Process Works
        </h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="absolute -top-4 left-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <p className="text-center text-gray-700">
            <span className="font-semibold">Timeframe:</span> Once we get your information, we're usually able to make you a fair all-cash offer within 24 hours. From there, we can close as quickly as 7 days… or on your schedule.
          </p>
        </div>
      </div>
    </section>
  );
} 