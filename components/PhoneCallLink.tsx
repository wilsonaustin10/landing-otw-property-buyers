'use client';

import React from 'react';

interface PhoneCallLinkProps {
  phoneNumber: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export default function PhoneCallLink({ 
  phoneNumber, 
  children, 
  className = '',
  ariaLabel = 'Call us'
}: PhoneCallLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const phoneUrl = `tel:${phoneNumber.replace(/[^\d]/g, '')}`;
    
    // Track phone call conversion
    if (typeof window !== 'undefined' && (window as any).gtag_report_conversion) {
      (window as any).gtag_report_conversion(phoneUrl);
    } else {
      // Fallback if conversion tracking isn't loaded
      window.location.href = phoneUrl;
    }
    
    // Also track with dataLayer if available
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ 
        event: 'phone_call_click',
        phone_number: phoneNumber
      });
    }
  };

  return (
    <a
      href={`tel:${phoneNumber.replace(/[^\d]/g, '')}`}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}