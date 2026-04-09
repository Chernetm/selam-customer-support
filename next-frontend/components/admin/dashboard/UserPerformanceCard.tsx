'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  CheckCircle2, 
  Users, 
  Star, 
  Clock, 
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import { UserPerformance } from '@/types/admin';

interface UserPerformanceCardProps {
  user: UserPerformance;
}

const CardStat = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-100/50 hover:bg-white hover:border-${color}-100 hover:shadow-xl hover:shadow-${color}-100/20 transition-all duration-300 group ring-1 ring-transparent hover:ring-${color}-100`}>
    <div className={`text-xl mb-2 text-gray-400 group-hover:text-${color}-500 group-hover:scale-110 transition-all`}>
      <Icon size={20} />
    </div>
    <span className="text-xl font-black text-gray-900 tracking-tight">{value}</span>
    <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-black mt-1">{label}</span>
  </div>
);

const DurationStat = ({ icon: Icon, label, minutes, color }: { icon: any, label: string, minutes: number, color: string }) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const timeStr = `${hours}h ${mins}m`;

  return (
    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group">
      <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-black text-gray-900">{timeStr}</p>
      </div>
    </div>
  );
};

export function UserPerformanceCard({ user }: UserPerformanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-gray-200/30 border border-white/50 overflow-hidden relative group transition-all"
    >
      {/* Premium Header/Banner */}
      <div className="h-24 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent)]" />
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">
          <div className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-gray-400"}`} />
          {user.isOnline ? "Active" : "Offline"}
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Profile Info Overlay */}
        <div className="relative -mt-10 mb-6 flex justify-between items-end">
          <div className="flex flex-col">
            <div className="w-20 h-20 rounded-[1.75rem] bg-white p-1.5 shadow-xl ring-1 ring-gray-50">
              <div className="w-full h-full rounded-[1.25rem] bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-3xl font-black text-indigo-600 shadow-inner">
                {user.name?.[0]}
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase group-hover:text-indigo-600 transition-colors">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black tracking-widest text-indigo-400 border border-indigo-50 bg-indigo-50/30 px-2.5 py-0.5 rounded-lg uppercase">
                  {user.department || "General Ops"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right pb-1">
            <div className="flex items-center justify-end gap-1.5 text-amber-400 mb-1">
              <Star size={16} fill="currentColor" strokeWidth={0} />
              <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">{user.avgRating || "0.0"}</span>
            </div>
            <p className="text-[8px] font-black text-gray-400 tracking-[0.2em] uppercase opacity-60">Trust Score</p>
          </div>
        </div>

        {/* Actionable Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <CardStat
            icon={Ticket}
            value={user.totalTickets}
            label="Load"
            color="indigo"
          />
          <CardStat
            icon={CheckCircle2}
            value={user.closedTickets}
            label="Closed"
            color="emerald"
          />
          <CardStat
            icon={Users}
            value={user.customersServed}
            label="Help"
            color="blue"
          />
        </div>

        {/* Work Velocity / Duration Section */}
        <div className="bg-gray-50/40 rounded-[2rem] p-5 border border-gray-100/50 relative transition-all duration-500 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={12} className="text-amber-400 fill-amber-400" />
                Velocity Index
             </h3>
             <Award size={14} className="text-indigo-100 group-hover:text-indigo-300 transition-colors" />
          </div>
          
          <div className="grid grid-cols-1 gap-2.5">
            <DurationStat
              icon={Calendar}
              label="Weekly Pulse"
              minutes={user.durationWeekly}
              color="indigo"
            />
            <DurationStat
              icon={Calendar}
              label="Monthly Momentum"
              minutes={user.durationMonthly}
              color="pink"
            />
          </div>
        </div>

        {/* View Profile Call to Action */}
        <button className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.3em] shadow-lg shadow-gray-200 hover:bg-indigo-600 hover:scale-[1.02] transition-all duration-300">
           Full System Profile
        </button>
      </div>
    </motion.div>
  );
}
