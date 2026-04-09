'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  color: string;
  trend?: number;
}

export function StatCard({ icon: Icon, title, value, color, trend }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white/50 flex items-start justify-between transition-all h-full group"
    >
      <div className="space-y-4">
        <div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-indigo-500 transition-colors">{title}</p>
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{value}</h3>
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-2 text-[10px] font-black ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            <div className={`p-1.5 rounded-lg ${trend >= 0 ? 'bg-emerald-50' : 'bg-rose-50'} shadow-inner`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            </div>
            <span className="tracking-widest">{trend >= 0 ? '+' : ''}{trend}%</span>
            <span className="text-gray-300 font-bold tracking-normal opacity-60">vs last cycle</span>
          </div>
        )}
      </div>

      <div className={`p-3.5 rounded-2xl shadow-2xl shadow-current/20 ${color} group-hover:rotate-12 transition-transform duration-500`}>
        <Icon size={20} className="text-white" />
      </div>
    </motion.div>
  );
}
