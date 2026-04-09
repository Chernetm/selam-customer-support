'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import { useLanguage } from '@/contexts/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const slices = [
    { height: 'h-[300px] md:h-[350px]', delay: 0.1 },
    { height: 'h-[400px] md:h-[450px]', delay: 0.2 },
    { height: 'h-[500px] md:h-[550px]', delay: 0.3 },
    { height: 'h-[400px] md:h-[450px]', delay: 0.4 },
    { height: 'h-[300px] md:h-[350px]', delay: 0.5 },
  ];

  return (
    <section className="relative bg-white pt-24 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 leading-[1.1] tracking-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-bold italic">
            {t('home.heroSubtitle')}
          </p>
        </motion.div>

        {/* Image Slice Gallery */}
        <div className="relative w-full mb-16">
          <div className="flex items-end justify-center gap-3 md:gap-6 w-full max-w-6xl mx-auto">
            {slices.map((slice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: slice.delay }}
                className={`relative flex-1 ${slice.height} rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 group`}
              >
                <img
                  src="/hero-printing.png"
                  alt={`Printing heritage slice ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ objectPosition: `${index * 25}% center` }}
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </motion.div>
            ))}
          </div>

          {/* Overlaid Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10"
          >
            <Link href="/services">
              <Button 
                className="bg-[#C8A98B] hover:bg-[#b8987a] text-slate-950 font-black px-12 py-8 rounded-[1.5rem] border-none shadow-2xl shadow-slate-400/20 text-lg tracking-tight whitespace-nowrap"
              >
                {t('home.heroButton')}
              </Button>
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
