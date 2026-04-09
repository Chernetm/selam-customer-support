'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  CheckCircle2,
  Users,
  Star,
  ShieldCheck,
  ArrowLeft,
  LayoutGrid,
  Zap,
  BarChart3,
  Search,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api/chat';
import { UserPerformance } from '@/types/admin';
import { UserPerformanceCard } from '@/components/admin/dashboard/UserPerformanceCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

export default function PerformancePage() {
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState<UserPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPerformance = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await chatApi.getAgentPerformance();
      setPerformanceData(data || []);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      toast.error('Failed to synchronize performance metrics');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPerformance();

    // Auto-refresh every 2 minutes
    const interval = setInterval(() => loadPerformance(true), 120000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = performanceData.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Global metrics calculation
  const totalHelp = performanceData.reduce((acc, curr) => acc + (curr.totalTickets || 0), 0);
  const totalClosed = performanceData.reduce((acc, curr) => acc + (curr.closedTickets || 0), 0);
  const avgTrust = performanceData.length > 0
    ? (performanceData.reduce((acc, curr) => acc + (curr.avgRating || 0), 0) / performanceData.length).toFixed(1)
    : "0.0";
  const activeNow = performanceData.filter(u => u.isOnline).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-indigo-600 w-6 h-6 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Synchronizing Analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Dynamic Header Part */}
      <div className="relative h-[280px] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-gray-900 to-black opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(79,70,229,0.15),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center pt-10">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-px w-8 bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Operations Control</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                Team <span className="text-indigo-400">Performance</span>
              </h1>
              <p className="text-gray-400 mt-4 font-bold text-sm max-w-lg">
                Real-time visibility into agent efficiency, customer satisfaction, and system load balancing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => loadPerformance(true)}
                disabled={isRefreshing}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2 h-11 px-5 rounded-xl border"
              >
                {isRefreshing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCcw size={16} />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Pulse Statistics */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlobalStatCard
            title="Active Intelligence"
            value={activeNow}
            subtitle="Current Online Assets"
            icon={Activity}
            color="indigo"
          />
          <GlobalStatCard
            title="Resolution Success"
            value={totalClosed}
            subtitle="Total Closed Requests"
            icon={CheckCircle2}
            color="emerald"
          />
          <GlobalStatCard
            title="Mean Satisfaction"
            value={avgTrust}
            subtitle="Average Trust Index"
            icon={Star}
            color="amber"
          />
          <GlobalStatCard
            title="Agents Supervised"
            value={performanceData.length}
            subtitle="Total Registered Staff"
            icon={ShieldCheck}
            color="blue"
          />
        </div>
      </div>

      {/* Filtering & Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Filter by agent name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-transparent rounded-[1.25rem] shadow-sm font-bold text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pr-2">
            <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Syncing Enabled</span>
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <UserPerformanceCard user={user} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white/40 border border-white/60 rounded-[3rem] text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <BarChart3 size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">No Metrics Found</h3>
            <p className="text-gray-500 mt-2 font-bold text-sm max-w-xs">We couldn't find any performance data matching your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalStatCard({ title, value, subtitle, icon: Icon, color }: { title: string, value: string | number, subtitle: string, icon: any, color: string }) {
  const colors: any = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-100',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-100',
    amber: 'from-amber-400 to-amber-500 shadow-amber-100',
    blue: 'from-blue-500 to-blue-600 shadow-blue-100'
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color]} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700`} />

      <div className="flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
            <Icon size={20} />
          </div>
          <TrendingUp size={16} className="text-gray-200 group-hover:text-gray-300 transition-colors" />
        </div>

        <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1.5">{value}</h3>
        <p className="text-[10px] font-black text-gray-900/40 uppercase tracking-widest">{title}</p>
        <div className="h-px w-8 bg-gray-100 my-4" />
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );
}
