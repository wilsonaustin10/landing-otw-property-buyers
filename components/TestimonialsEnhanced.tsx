import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah M.",
    location: "Phoenix, AZ",
    rating: 5,
    date: "2 weeks ago",
    title: "Sold my house in just 10 days!",
    content: "I was facing foreclosure and needed to sell fast. OTW Property Buyers gave me a fair cash offer within 24 hours and we closed in just 10 days. They handled everything and were so professional throughout the entire process.",
    verified: true
  },
  {
    name: "Robert K.",
    location: "Las Vegas, NV",
    rating: 5,
    date: "1 month ago",
    title: "No repairs needed - sold as-is!",
    content: "My house needed major repairs that I couldn't afford. Other buyers wanted me to fix everything first, but OTW bought it exactly as it was. They even helped me move out and were flexible with my timeline.",
    verified: true
  },
  {
    name: "Maria G.",
    location: "San Diego, CA",
    rating: 5,
    date: "3 weeks ago",
    title: "Inheritance property sold hassle-free",
    content: "Inherited a property from my parents and didn't know what to do with it. OTW made the process so simple. No real estate agents, no showings, no stress. Just a straightforward cash offer and quick closing.",
    verified: true
  },
  {
    name: "James T.",
    location: "Los Angeles, CA",
    rating: 5,
    date: "2 months ago",
    title: "Avoided foreclosure thanks to OTW",
    content: "I was months behind on payments and facing foreclosure. OTW Property Buyers worked with me to close quickly and even gave me extra time to find a new place. They literally saved my credit.",
    verified: true
  },
  {
    name: "Linda P.",
    location: "Sacramento, CA",
    rating: 5,
    date: "1 month ago",
    title: "Divorce settlement made easy",
    content: "Going through a divorce and needed to sell our house quickly. OTW gave us a fair offer and closed in 2 weeks. No having strangers walk through during showings. It was exactly what we needed during a difficult time.",
    verified: true
  },
  {
    name: "David R.",
    location: "Fresno, CA",
    rating: 5,
    date: "6 weeks ago",
    title: "Best decision I made!",
    content: "Had terrible tenants who destroyed my rental property. OTW bought it without requiring any cleanup or repairs. The whole team was understanding and made everything so easy. Highly recommend!",
    verified: true
  }
];

export default function TestimonialsEnhanced() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold">4.9/5</span>
            <span className="text-gray-600">(500+ Reviews)</span>
          </div>
          <p className="text-xl text-gray-600">
            Join hundreds of satisfied homeowners who sold their houses the easy way
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 relative hover:shadow-xl transition-shadow"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-200" />
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {testimonial.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <h3 className="font-bold text-lg mb-2">{testimonial.title}</h3>
              
              <p className="text-gray-600 mb-4 relative z-10">
                "{testimonial.content}"
              </p>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                  <p className="text-sm text-gray-500">{testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Ready to join our growing list of satisfied customers?
          </p>
          <button 
            onClick={() => {
              const event = new CustomEvent('openFormModal');
              window.dispatchEvent(event);
            }}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
          >
            GET MY CASH OFFER
          </button>
        </div>
      </div>
    </section>
  );
}