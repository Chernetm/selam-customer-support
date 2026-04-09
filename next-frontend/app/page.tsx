import React from 'react';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import CallToAction from '@/components/home/CallToAction';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 
          We've modularized the Home page into separate components 
          for better maintainability and professional structure.
      */}
      <main>
        <Hero />
        <Features />
        <CallToAction />
      </main>
    </div>
  );
}
