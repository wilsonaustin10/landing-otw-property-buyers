'use client';

import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GoogleTagDebugger from '../components/GoogleTagDebugger';
import GooglePlacesDebugger from '../components/GooglePlacesDebugger';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FormProvider>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <GoogleTagDebugger />
        <GooglePlacesDebugger />
      </FormProvider>
    </>
  );
}