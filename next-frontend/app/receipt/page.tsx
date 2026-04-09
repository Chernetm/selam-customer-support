'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TINSearch } from '@/components/receipt/TINSearch';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ReceiptSearchPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-mesh-indigo flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[120px] -z-10" />

      <div className="max-w-4xl w-full z-10">

        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <TINSearch />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-tight uppercase italic"
          >
            {t('receipt.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed italic"
          >
            {t('receipt.subtitle')}
          </motion.p>
        </div>

      </div>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl shadow-slate-200/20 hover:shadow-indigo-100/40 transition-all duration-500 hover:-translate-y-2">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 leading-tight underline decoration-indigo-400 decoration-2 underline-offset-4">{title}</h3>
      <p className="text-xs text-slate-500 font-bold leading-relaxed">{desc}</p>
    </div>
  );
}
