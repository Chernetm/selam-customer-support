'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Zap } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: MapPin,
      title: t('contact.hq'),
      details: t('contact.hqAddr'),
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      icon: Phone,
      title: t('contact.relations'),
      details: "+251 11 123 4567\n+251 11 123 4568",
      color: "text-violet-600 bg-violet-50"
    },
    {
      icon: Mail,
      title: t('contact.strategic'),
      details: "info@bspe.com.et\nsupport@bspe.com.et",
      color: "text-emerald-600 bg-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      {/* Custom Texture Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <img 
          src="/contact_bg.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-48 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/5 border border-slate-950/10 mb-8">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{t('contact.synergyLabel')}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter leading-tight mb-6 uppercase italic">
            {t('contact.getIn')} <span className="text-indigo-600">{t('contact.touch')}</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-bold max-w-xl mx-auto leading-relaxed italic">
            {t('contact.tagline')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Contact Details cards */}
          <div className="space-y-6">
            {contactInfo.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-line font-bold italic">
                      {item.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative h-64 rounded-3xl overflow-hidden bg-slate-100 shadow-inner group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center grayscale opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="text-white w-6 h-6 mb-2" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">{t('contact.hqAddr')}</span>
              </div>
            </motion.div>
          </div>

          {/* Strategic Action Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
