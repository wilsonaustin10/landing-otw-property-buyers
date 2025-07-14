'use client';

import React from 'react';
import Script from 'next/script';

export default function GoogleMapsScript() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <Script
      id="google-maps-script"
      strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`}
    />
  );
}