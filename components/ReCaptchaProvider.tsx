'use client';

import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const ReCaptchaProvider = ({ children }: { children: React.ReactNode }) => {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        "reCAPTCHA site key not found. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your .env.local file. reCAPTCHA will not be active."
      );
    }
    // In development, you might want to allow the app to run without reCAPTCHA
    // In production, you might want to throw an error or render a specific message
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: false, // Use 'false' if you need the script to load synchronously
        defer: false, // Use 'false' with async: false
        appendTo: "head",
        nonce: undefined, // You can provide a nonce if you have a CSP
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default ReCaptchaProvider; 