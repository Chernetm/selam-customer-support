'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Globe, BookOpen, Zap, ArrowDown } from 'lucide-react';
import AboutHero from '@/components/about/AboutHero';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  const stats = [
    { icon: BookOpen, label: t('about.stats.years'), value: "100+" },
    { icon: Users, label: t('about.stats.clients'), value: "10k+" },
    { icon: Award, label: t('about.stats.awards'), value: "25+" },
    { icon: Globe, label: t('about.stats.reach'), value: "100%" }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <AboutHero />

      {/* Heritage Section - Luxury Industrial Aesthetic */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/5 border border-slate-950/10 mb-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{t('about.legacyLabel')}</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-slate-950 mb-8 tracking-tighter leading-tight uppercase italic">
                {t('about.heritageTitle')}
              </h2>

              <div className="space-y-6 text-sm md:text-base text-slate-500 leading-relaxed font-bold italic max-w-xl">
                <p>{t('about.heritageP1')}</p>
                <p>{t('about.heritageP2')}</p>
                <p>{t('about.heritageP3')}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden group shadow-2xl bg-slate-100"
            >
              <img
                src="/industrial.png"
                alt="High-End Printing"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-40" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimalist Metrics */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 1 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 text-center"
              >
                <stat.icon className="w-8 h-8 text-indigo-600 mx-auto mb-6 opacity-40" />
                <div className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-slate-900 leading-none">
                  {stat.value}
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
