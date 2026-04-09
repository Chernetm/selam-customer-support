'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ReceiptCard } from '@/components/receipt/ReceiptCard';
import { fetchReceiptByTIN } from '@/lib/mockReceipt';
import { ReceiptData } from '@/types/receipt';
import { Loader2, ArrowLeft, SearchX, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptDetailPage() {
  const { tin } = useParams();
  const router = useRouter();
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tin) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchReceiptByTIN(tin as string);
        if (result) {
          setData(result);
        } else {
          setError("No record found for this TIN number.");
        }
      } catch (err) {
        setError("An error occurred while fetching your record.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tin]);

  return (
    <main className="min-h-screen bg-mesh-indigo p-6 md:p-12 lg:p-24 relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto z-10">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <Link href="/receipt" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 px-4 py-2 rounded-full border border-white shadow-sm">
            <ArrowLeft size={16} />
            Search New TIN
          </Link>

          <div className="flex items-center gap-2">
             <ShieldAlert size={14} className="text-amber-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Retrieval Session</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative">
                <Loader2 size={64} className="text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                </div>
              </div>
              <p className="mt-8 text-sm font-black text-slate-500 animate-pulse">Retrieving your secure receipt...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-24 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-2xl p-12"
            >
              <div className="bg-rose-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <SearchX size={40} className="text-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 uppercase">No Record Found</h2>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed italic">
                We couldn't find any printing applications or receipts associated with the TIN: <span className="text-rose-500">{tin}</span>. 
              </p>
              <Link href="/receipt">
                 <button className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-5 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200">
                    Try Another Search
                 </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 px-4 md:px-0">Your Digital <span className="text-indigo-600">Acknowledgement</span></h1>
                <p className="text-slate-500 font-bold">
                  Successfully retrieved record for <span className="text-indigo-600 font-black">TIN: {tin}</span>. You can now download or print your official document below.
                </p>
              </div>

              {data && <ReceiptCard data={data} />}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
