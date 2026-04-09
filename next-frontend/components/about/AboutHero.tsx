'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Particles from '../home/Particles';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutHero() {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-[80vh] bg-white text-slate-900 overflow-hidden flex items-center justify-center">
      {/* Custom Texture Background */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="/about_hero.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Dynamic Mesh Gradient Background */}
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-indigo-50/50 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] bg-violet-50/50 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />

      {/* Background Particles - Premium Configuration */}
      <Particles
        className="absolute inset-0 z-10 opacity-30"
        quantity={80}
        ease={80}
        color="#4f46e5"
        refresh
      />

      {/* Content Container - Glassmorphism */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/40 backdrop-blur-2xl border border-white/60 p-12 md:p-20 rounded-[4rem] shadow-2xl shadow-indigo-100/20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/5 border border-slate-950/10 mb-8">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('about.legacyLabel')}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-8 leading-tight text-slate-950 uppercase italic">
            {t('about.heroTitle')}
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-bold italic"
          >
            {t('about.heroSubtitle')}
          </motion.p>
        </motion.div>
      </div>

      {/* Decorative Floor Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
