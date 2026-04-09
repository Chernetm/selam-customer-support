'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Layers, 
  Search, 
  Settings, 
  Lock,
  Download,
  LayoutGrid,
  Filter,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { AdminTable } from '@/components/admin/dashboard/AdminTable';
import { CustomerTable } from '@/components/admin/dashboard/CustomerTable';
import { systemAdminService } from '@/lib/api/admin';
import { AdminUser, CustomerUser, Department } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'admins' | 'customers'>('admins');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsData, customersData, deptsData] = await Promise.all([
        systemAdminService.getAdmins(),
        systemAdminService.getCustomers(),
        systemAdminService.getDepartments()
      ]);
      setAdmins(adminsData);
      setCustomers(customersData);
      setDepartments(deptsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdate = async (uid: string, data: Partial<AdminUser>) => {
    try {
      await systemAdminService.updateAdmin(uid, data);
      setAdmins(prev => prev.map(a => a.uid === uid ? { ...a, ...data } : a));
    } catch (error) {
      alert('Failed to update administrator settings.');
    }
  };

  const handleCustomerStatusUpdate = async (id: number, status: 'active' | 'inactive') => {
    try {
      await systemAdminService.updateCustomerStatus(id, status);
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (error) {
      alert('Failed to update customer status.');
    }
  };

  // Computed Stats
  const stats = useMemo(() => {
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(a => a.status === 'Active' || !a.status).length;
    const superAdminsCount = admins.filter(a => a.role === 'super-admin').length;
    const totalCustomers = customers.length;

    return [
      { icon: Shield, title: 'Total Administrators', value: totalAdmins, color: 'bg-indigo-600', trend: 12 },
      { icon: Activity, title: 'Active Sessions', value: activeAdmins, color: 'bg-emerald-500', trend: 5 },
      { icon: Lock, title: 'Super Admins', value: superAdminsCount, color: 'bg-purple-600', trend: 0 },
      { icon: Users, title: 'Total Customers', value: totalCustomers, color: 'bg-blue-500', trend: 8 },
    ];
  }, [admins, customers]);

  // Filtering Logic
  const filteredAdmins = admins.filter(a => 
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('role');
    document.cookie = "adminToken=; max-age=0; path=/";
    router.push('/admin-login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">CONSOLE</h1>
                <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">Super Admin</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <Button variant="ghost" className="text-gray-500 font-bold text-sm h-9 px-4 rounded-lg hover:bg-gray-50">Overview</Button>
              <Button variant="ghost" className="text-indigo-600 font-black text-sm h-9 px-4 rounded-lg bg-indigo-50/50">User Management</Button>
              <Button variant="ghost" className="text-gray-500 font-bold text-sm h-9 px-4 rounded-lg hover:bg-gray-50" onClick={() => router.push('/admin/system')}>System Config</Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" className="text-gray-400 font-bold hover:text-red-600" onClick={handleLogout}>
                <LogOut size={18} className="mr-2" />
                Sign Out
             </Button>
             <div className="w-px h-6 bg-gray-100 mx-2" />
             <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-black text-gray-900 uppercase">Super Administrator</div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase flex items-center justify-end gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online Now
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-white shadow-sm flex items-center justify-center font-black text-gray-600">
                  SA
                </div>
             </div>
          </div>
        </div>
      </nav>

      <main className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Super Admin <span className="text-indigo-600">Console</span>
            </h2>
            <p className="text-gray-400 font-bold text-xs flex items-center gap-2 opacity-70">
               Unified system oversight for all secure administrative access and customer accounts.
               <ChevronRight size={12} className="text-gray-300" />
            </p>
          </div>
          
          <div className="flex items-center gap-2">
             <Button variant="outline" className="h-10 px-5 rounded-xl border-white/50 bg-white/50 backdrop-blur-md font-black text-gray-600 shadow-sm hover:bg-white uppercase tracking-widest text-[9px] transition-all">
                <Download size={14} className="mr-2" />
                Export
             </Button>
             <Button onClick={() => router.push('/admin/system')} className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black uppercase tracking-widest text-[9px] transition-all">
                <Settings size={14} className="mr-2" />
                System
             </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} value={loading ? '...' : stat.value} />
          ))}
        </div>

        {/* content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-gray-200/30 border border-white/50 overflow-hidden"
        >
          {/* Internal Toolbar */}
          <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('admins')}
                className={`flex items-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.14em] transition-all ${
                  activeTab === 'admins' 
                    ? "bg-white text-indigo-600 shadow-xl shadow-gray-200/50" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Shield className="w-4 h-4 mr-2.5" />
                Administrators
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-[0.14em] transition-all ${
                  activeTab === 'customers' 
                    ? "bg-white text-indigo-600 shadow-xl shadow-gray-200/50" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4 mr-2.5" />
                Customers
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <Input 
                  placeholder={`Search identities...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white/50 border-transparent rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-black placeholder:text-gray-400 text-xs"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-white/50 bg-white/50 backdrop-blur-md">
                  <Filter className="w-4 h-4 text-gray-600" />
                </Button>
                <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-white/50 bg-white/50 backdrop-blur-md">
                  <LayoutGrid className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in duration-700">
            {activeTab === 'admins' ? (
              <AdminTable 
                admins={filteredAdmins} 
                departments={departments} 
                loading={loading}
                onUpdate={handleAdminUpdate}
              />
            ) : (
              <CustomerTable 
                customers={filteredCustomers} 
                loading={loading}
                onStatusUpdate={handleCustomerStatusUpdate}
              />
            )}
          </div>

          {/* Table Footer */}
          <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-900">{activeTab === 'admins' ? filteredAdmins.length : filteredCustomers.length}</span> entries
            </div>
            <div className="flex gap-2">
               <Button variant="outline" disabled className="h-10 px-4 rounded-xl border-gray-200 text-xs font-black uppercase tracking-widest disabled:opacity-30">Prev</Button>
               <Button variant="outline" disabled className="h-10 px-4 rounded-xl border-gray-200 text-xs font-black uppercase tracking-widest disabled:opacity-30">Next</Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
