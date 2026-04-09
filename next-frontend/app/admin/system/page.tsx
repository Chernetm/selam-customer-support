// next-frontend/app/admin/system/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Layers, 
  Briefcase, 
  ArrowLeft,
  Zap,
  Shield,
  Activity,
  ChevronRight
} from 'lucide-react';
import { DepartmentManager } from '@/components/admin/system/DepartmentManager';
import { CaseTypeManager } from '@/components/admin/system/CaseTypeManager';
import clsx from 'clsx';

export default function SystemManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'departments' | 'cases'>('departments');

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
      
      <div className="max-w-[1500px] mx-auto px-6 pt-12 md:px-10 md:pt-20">
        
        {/* Navigation Back */}
        <div className="mb-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Command Dashboard
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white rounded-[1.2rem] shadow-2xl flex items-center justify-center border border-indigo-100">
                  <Settings className="w-6 h-6 text-indigo-600" />
               </div>
               <div className="bg-indigo-100/50 border border-indigo-200 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  System Core v3.1
               </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              System <span className="text-indigo-600">Configuration</span>
            </h1>
            <p className="text-gray-400 font-bold max-w-xl text-sm leading-relaxed">
              Synchronize organizational structures, define departmental boundaries, and calibrate support protocol categories.
            </p>
          </div>

          <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-[1.8rem] shadow-2xl shadow-gray-200/20 border border-white">
            <button
               onClick={() => setActiveTab('departments')}
               className={clsx(
                 "flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                 activeTab === 'departments' 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                    : "text-gray-400 hover:text-indigo-600 hover:bg-gray-50/50"
               )}
            >
               <Layers size={14} /> Departments
            </button>
            <button
               onClick={() => setActiveTab('cases')}
               className={clsx(
                 "flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                 activeTab === 'cases' 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                    : "text-gray-400 hover:text-indigo-600 hover:bg-gray-50/50"
               )}
            >
               <Briefcase size={14} /> Case Protocols
            </button>
          </div>
        </div>

        {/* Status Indication */}
        <div className="mb-10 flex items-center justify-between px-6 py-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 backdrop-blur-sm">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Database Synchronized</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                 <Shield className="w-3 h-3 text-indigo-400" />
                 <span className="text-[10px] font-bold text-indigo-500 uppercase">Integrity Verified</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 opacity-60">Context:</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                 {activeTab === 'departments' ? "Organizational Units" : "Case Transmission Protocols"}
              </span>
           </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white overflow-hidden"
            >
              {activeTab === 'departments' ? (
                <DepartmentManager />
              ) : (
                <CaseTypeManager />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Branding */}
        <div className="mt-24 text-center select-none opacity-40">
           <div className="inline-flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-900">System Management Node</span>
           </div>
           <p className="text-[9px] font-bold text-gray-400 mt-4 tracking-widest uppercase">Birhanena Selam Security Operations</p>
        </div>

      </div>
    </div>
  );
}
