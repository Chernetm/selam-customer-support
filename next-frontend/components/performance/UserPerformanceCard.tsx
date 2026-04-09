// next-frontend/components/performance/UserPerformanceCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Clock, 
  Target, 
  CheckCircle2, 
  BarChart3,
  ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

interface UserPerformance {
  id: number;
  name: string;
  role: string;
  email: string;
  department?: string;
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  avgResponseTime: string;
  lastActive?: string;
  isOnline?: boolean;
}

interface UserPerformanceCardProps {
  user: UserPerformance;
}

export const UserPerformanceCard: React.FC<UserPerformanceCardProps> = ({ user }) => {
  const rate = Math.round((user.resolvedTickets / (user.totalTickets || 1)) * 100);

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
      className="group relative bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-gray-200/30 overflow-hidden transition-all hover:shadow-indigo-100/50"
    >
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50/50 rounded-full blur-[80px] group-hover:bg-indigo-100/50 transition-colors" />

      {/* Header: User Info */}
      <div className="relative flex items-center gap-5 mb-8">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <User size={32} />
          </div>
          {/* Status Indicator */}
          <div className={clsx(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
            user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-gray-900 tracking-tighter truncate leading-none uppercase">
            {user.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
              <MapPin size={10} /> {user.department || "General"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-indigo-100 transition-colors group/stat">
          <div className="flex items-center gap-2 mb-1.5">
             <BarChart3 size={14} className="text-gray-400 group-hover/stat:text-indigo-500 transition-colors" />
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-900 leading-none">{rate}%</span>
            <span className="text-[10px] font-black text-emerald-500 mb-0.5 text-xs">↑</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-indigo-100 transition-colors group/stat">
          <div className="flex items-center gap-2 mb-1.5">
             <Clock size={14} className="text-gray-400 group-hover/stat:text-indigo-500 transition-colors" />
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Avg Pulse</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-xl font-black text-gray-900 leading-none truncate">{user.avgResponseTime || '2.4h'}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="relative space-y-4 pt-6 border-t border-gray-100/50">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
           <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Operational Accuracy</span>
           <span className="text-gray-900">{user.resolvedTickets} / {user.totalTickets}</span>
        </div>
        
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${rate}%` }}
             transition={{ duration: 1.5, ease: "circOut" }}
             className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)]"
           />
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative mt-8 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-gray-50 text-gray-400 overflow-hidden group-hover:scale-110 transition-transform">
               <Target size={14} />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">System ID</span>
               <span className="text-[10px] font-black text-gray-900">SELAM-{user.id}</span>
            </div>
         </div>
         
         <Link 
           href={`/admin/reports?agent=${user.id}`}
           className="p-2.5 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all active:scale-95 border border-transparent hover:border-indigo-100"
         >
           <ExternalLink size={18} />
         </Link>
      </div>
    </motion.div>
  );
};
