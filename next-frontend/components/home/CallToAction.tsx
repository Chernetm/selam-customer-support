'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useLanguage } from '@/contexts/LanguageContext';

export default function CallToAction() {
  const { t } = useLanguage();
  
  const ctaFeatures = [
    t('home.cta.feature1'),
    t('home.cta.feature2'),
    t('home.cta.feature3'),
    t('home.cta.feature4')
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-gray-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-indigo-900/40 border border-indigo-500/10">
          {/* Left Side Content */}
          <div className="flex-1 p-12 md:p-16 lg:p-20 flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-black text-white mb-8 leading-snug"
            >
              {t('home.cta.title')}
            </motion.h2>

            <ul className="space-y-5 mb-12">
              {ctaFeatures.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className="flex items-center gap-4 text-indigo-100 text-lg font-bold"
                >
                  <CheckCircle className="text-indigo-400 shrink-0" size={24} />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link href="/customer-register">
                <Button className="bg-white text-indigo-900 hover:bg-white/95 font-black text-lg px-8 py-7 shadow-xl shadow-white/5 transition-transform hover:scale-105 active:scale-95 border-none">
                  {t('home.cta.button')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side Image/Visual */}
          <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center min-h-[400px] md:min-h-full border-l border-indigo-500/10 grayscale-[20%] hover:grayscale-0 transition-all duration-1000" />
        </div>
      </div>
    </section>
  );
}
