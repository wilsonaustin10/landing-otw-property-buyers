import React from 'react';
import Image from 'next/image';

export default function TrustBadges() {
  const badges = [
    { image: "/bbb.png", alt: "BBB A+ Rating", width: 150, height: 70 },
    { image: "/google.png", alt: "Google Reviews", width: 150, height: 70 },
    { image: "/foxnews.png", alt: "As Seen On Fox News", width: 100, height: 40 }
  ];

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center">
              <Image 
                src={badge.image} 
                alt={badge.alt} 
                width={badge.width}
                height={badge.height}
                className="mr-2"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 