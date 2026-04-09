'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate API call with high-end delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus('success');
    setForm({ name: '', email: '', message: '' });
    
    setTimeout(() => {
      setStatus('idle');
    }, 8000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative p-1 rounded-[4rem] bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 shadow-2xl"
    >
      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white shadow-xl shadow-indigo-100/20">
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">
            {t('contact.form.title')}
          </h2>
        </div>
        
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-2 tracking-tight">{t('contact.form.successTitle')}</h3>
              <p className="text-slate-500 text-sm font-bold max-w-xs mx-auto italic">
                {t('contact.form.successMsg')}
              </p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('contact.form.labelName')}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm text-slate-950 font-bold italic placeholder:text-slate-300 focus:bg-white focus:border-indigo-600"
                  placeholder={t('contact.form.placeholderName')}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('contact.form.labelEmail')}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm text-slate-950 font-bold italic placeholder:text-slate-300 focus:bg-white focus:border-indigo-600"
                  placeholder={t('contact.form.placeholderEmail')}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{t('contact.form.labelMessage')}</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm text-slate-950 font-bold placeholder:text-slate-300 focus:bg-white resize-none focus:border-indigo-600"
                  placeholder={t('contact.form.placeholderMessage')}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full h-16 text-sm font-black bg-slate-950 text-white hover:bg-slate-900 transition-all duration-500 rounded-2xl shadow-xl border-none group relative overflow-hidden"
              >
                {status === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] tracking-widest uppercase">{t('contact.form.loading')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="relative z-10 text-[10px] tracking-widest uppercase">{t('contact.form.submit')}</span>
                    <Send className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500 relative z-10 text-indigo-400" />
                  </div>
                )}
                {/* Background Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0" />
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
