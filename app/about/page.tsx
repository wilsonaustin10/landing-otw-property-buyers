import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          About OTW Property Buyers
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div className="flex justify-center mb-8">
            <Image
              src="/"
              alt="OTW Property Buyers"
              width={300}
              height={80}
              className="mb-6"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-primary mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            At COTW Property Buyers, we're more than just property investors – our team has a genuine passion for helping families navigate through difficult situations. We understand that life can throw unexpected challenges your way, and selling your home quickly might be necessary during these times.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Each member of our team brings not only professional expertise in real estate and property renovation but also personal understanding of the importance of home and family. We've dedicated ourselves to creating a compassionate, transparent, and efficient process that puts your needs first.
          </p>
          
          <h2 className="text-2xl font-semibold text-primary mb-4">What We Do</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We specialize in purchasing distressed properties and transforming them into beautiful homes that enhance neighborhoods and communities. Our team takes pride in our craftsmanship and attention to detail, ensuring that each property we touch is given new life and purpose.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Beyond the business aspect, we find fulfillment in helping families move forward from challenging circumstances. Whether you're facing foreclosure, dealing with an inherited property, going through a divorce, or simply need to relocate quickly, we offer a helping hand and a fair cash offer with no strings attached.
          </p>
          
          <h2 className="text-2xl font-semibold text-primary mb-4">Our Values</h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-6 space-y-2">
            <li><span className="font-medium">Integrity:</span> We believe in honest, transparent dealings in every transaction.</li>
            <li><span className="font-medium">Compassion:</span> We approach each situation with empathy and understanding.</li>
            <li><span className="font-medium">Excellence:</span> We strive for the highest quality in both customer service and property renovation.</li>
            <li><span className="font-medium">Community:</span> We're committed to improving neighborhoods and supporting local communities.</li>
          </ul>
          
          <div className="text-center mt-8 space-y-4">
            <Link
              href="/#how-it-works"
              className="inline-block bg-secondary text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium mr-4"
            >
              How It Works
            </Link>
            <Link 
              href="/#property-form"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              Get Your Cash Offer Today
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 