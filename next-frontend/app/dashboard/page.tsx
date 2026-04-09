'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Settings, ArrowRight, LogOut, Lock, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardSelectorPage() {
  const router = useRouter();

  const options = [
    {
      title: "Admin Dashboard",
      description: "Monitor team performance, agent activity, and real-time metrics.",
      icon: Users,
      path: "/admin/performance", // We'll implement this next or use existing if any
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-200",
      label: "Performance & Tickets"
    },
    {
      title: "SuperAdmin Console",
      description: "Manage administrators, define roles, and oversee departmental settings.",
      icon: Shield,
      path: "/admin/dashboard",
      color: "from-purple-500 to-fuchsia-600",
      shadow: "shadow-purple-200",
      label: "System & Management"
    },
    {
      title: "Issue Reports",
      description: "Analyze weekly and monthly trends, escalation reasons, and agent performance.",
      icon: Activity,
      path: "/admin/reports",
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-200",
      label: "Analytics & Trends"
    },
    {
      title: "Admin Registration",
      description: "Onboard new administrative staff and manage system access permissions.",
      icon: UserPlus,
      path: "/admin-register",
      color: "from-amber-400 to-orange-600",
      shadow: "shadow-amber-200",
      label: "User Onboarding"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('role');
    document.cookie = "adminToken=; max-age=0; path=/";
    router.push('/admin-login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="flex justify-end mb-8">
           <Button variant="ghost" className="text-gray-400 font-bold hover:text-red-600" onClick={handleLogout}>
              <LogOut size={18} className="mr-2" />
              Sign Out
           </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50/50 backdrop-blur-md rounded-full text-indigo-600 text-[9px] font-black mb-6 border border-indigo-100/50">
            <Lock size={12} />
            Secure Gateway
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter mb-4 px-4">
            Welcome, <span className="text-indigo-600">Administrator</span>
          </h1>
          <p className="text-gray-400 text-base font-bold max-w-xl mx-auto leading-relaxed px-4 opacity-80">
            Select an operational environment to manage organizational assets and monitor real-time system performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {options.map((option, index) => (
            <motion.button
              key={option.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(option.path)}
              className="group relative bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-2xl shadow-gray-200/20 hover:shadow-indigo-100/30 transition-all duration-500 text-left overflow-hidden ring-1 ring-transparent hover:ring-indigo-100/50 active:scale-[0.98]"
            >
              {/* Decorative Background Icon */}
              <option.icon className="absolute -right-8 -bottom-8 w-48 h-48 text-gray-50/30 group-hover:text-indigo-50/40 transition-colors duration-500" />

              <div className="relative z-10 h-full flex flex-col">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${option.color} text-white shadow-xl ${option.shadow} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <option.icon size={24} />
                </div>

                <span className="block text-[8px] font-black text-indigo-500 mb-2">
                  {option.label}
                </span>

                <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                  {option.title}
                </h3>

                <p className="text-gray-400 font-bold leading-relaxed mb-8 text-xs opacity-70">
                  {option.description}
                </p>

                <div className="mt-auto flex items-center text-[9px] font-black text-gray-900 group-hover:text-indigo-600 transition-all">
                  Initialize Access
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${option.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-gray-400 font-black"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Secure
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            v3.0.0 Global Node
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-2">
             <Activity className="w-4 h-4 text-indigo-400" />
             Real-time Analytics Enabled
          </div>
        </motion.div>
      </div>
    </div>
  );
}
