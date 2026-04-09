'use client';

import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Ticket, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomerUser } from '@/types/admin';

interface CustomerTableProps {
  customers: CustomerUser[];
  loading: boolean;
  onStatusUpdate: (id: number, newStatus: 'active' | 'inactive') => Promise<void>;
}

export function CustomerTable({ customers, loading, onStatusUpdate }: CustomerTableProps) {
  const [isUpdating, setIsUpdating] = React.useState<number | null>(null);

  const handleToggle = async (customer: CustomerUser) => {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    setIsUpdating(customer.id);
    try {
      await onStatusUpdate(customer.id, newStatus);
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400 font-medium font-sans">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        Syncing customer accounts...
      </div>
    );
  }

  if (customers.length === 0) {
    return <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl m-6 font-medium">No results found matching your criteria.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Identity</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Channels</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Log</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Entity Status</th>
            <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Access Control</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50/80 transition-all group">
              <td className="py-5 px-8">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm bg-indigo-600 shadow-lg shadow-indigo-100 ring-4 ring-white">
                    {customer.name?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 uppercase tracking-tight text-sm">
                      {customer.name}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 tracking-widest mt-1 uppercase flex items-center gap-2">
                       <span className="bg-gray-100 px-1.5 py-0.5 rounded leading-none">ID: {customer.id}</span>
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-5 px-8">
                <div className="space-y-1.5">
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {customer.email}
                  </div>
                  <div className="text-xs text-gray-500 font-bold flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {customer.phoneNumber || "No primary phone"}
                  </div>
                </div>
              </td>

              <td className="py-5 px-8">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black tracking-widest ${
                    customer.ticketCount > 0
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "bg-gray-50 text-gray-400 border border-gray-100 opacity-60"
                  }`}>
                    <Ticket size={14} />
                    {customer.ticketCount || 0} TICKETS
                  </div>
                </div>
              </td>

              <td className="py-5 px-8">
                <div className="flex items-center">
                   <div className={`w-2.5 h-2.5 rounded-full mr-3 border-2 border-white ring-2 ${
                    customer.status === 'active' || !customer.status ? 'bg-emerald-500 ring-emerald-100' : 'bg-red-500 ring-red-100'
                  }`} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${
                    customer.status === 'active' || !customer.status ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {customer.status || "active"}
                  </span>
                </div>
              </td>

              <td className="py-5 px-8 text-right">
                <button
                  disabled={isUpdating === customer.id}
                  onClick={() => handleToggle(customer)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                    customer.status === "active"
                      ? "bg-red-50 text-red-700 hover:bg-red-100 shadow-red-100/50"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-emerald-100/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isUpdating === customer.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : customer.status === "active" ? (
                    <>
                      <ShieldX size={14} />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Activate
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
