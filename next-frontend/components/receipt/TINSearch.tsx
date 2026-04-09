'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export function TINSearch() {
  const [tin, setTin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tin.trim()) return;

    setIsLoading(true);
    // Navigate to the dynamic receipt page
    router.push(`/receipt/${tin}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto"
    >
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        
        <input
          type="text"
          value={tin}
          onChange={(e) => setTin(e.target.value)}
          placeholder={t('receipt.placeholder')}
          className="block w-full pl-14 pr-32 py-6 bg-white border border-slate-200 rounded-[2rem] text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/40"
          required
        />

        <div className="absolute inset-y-2 right-2 flex items-center">
          <button
            type="submit"
            disabled={isLoading || !tin.trim()}
            className="h-full px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-xs transition-all flex items-center gap-2 group/btn"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {t('common.submit')}
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
      
      <p className="mt-6 text-[10px] font-black text-slate-400 text-center">
        {t('receipt.helpText')}
      </p>
    </motion.div>
  );
}
