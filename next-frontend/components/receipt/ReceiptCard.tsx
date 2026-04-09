'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  MapPin, 
  User, 
  Hash, 
  Calendar, 
  Package, 
  Layers, 
  Briefcase, 
  Printer, 
  CheckCircle,
  Truck,
  CreditCard
} from 'lucide-react';
import { ReceiptData } from '@/types/receipt';

interface ReceiptCardProps {
  data: ReceiptData;
}

export function ReceiptCard({ data }: ReceiptCardProps) {
  const statusColors = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Approved': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-rose-100 text-rose-700 border-rose-200',
  };

  const printStatusColors = {
    'Ready': 'bg-emerald-500',
    'Processing': 'bg-blue-500 animate-pulse',
    'Not Started': 'bg-slate-300',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/80"
    >
      {/* Top Header Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10">
           <Receipt size={120} strokeWidth={1.5} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Printer className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-black mb-1">Official Document</p>
              <h2 className="text-3xl font-black tracking-tight leading-none">Recognition Receipt</h2>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <span className="text-white/60 text-[10px] font-black mb-2">Sequence Number</span>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-lg font-black tracking-tighter">
              #{data.seqNum}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-8 md:p-12 space-y-12">
        
        {/* Row 1: Identifying Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <DetailItem icon={<User className="text-indigo-500" />} label="Tax Payer Name" value={data.taxPayerName} primary />
          <DetailItem icon={<Hash className="text-indigo-500" />} label="TIN Number" value={data.tin} />
          <DetailItem icon={<Briefcase className="text-indigo-500" />} label="Invoice Type" value={data.invoiceType} />
        </div>

        <hr className="border-slate-100" />

        {/* Row 2: Location & Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <DetailItem icon={<MapPin className="text-indigo-500" />} label="Tax Centre" value={`${data.taxCentreName}, ${data.cityName}`} />
           <DetailItem icon={<Calendar className="text-indigo-500" />} label="Application Date" value={data.applicationDate} />
           <DetailItem icon={<Truck className="text-indigo-500" />} label="Delivery Date" value={data.deliveryDate} />
        </div>

        {/* Status Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Logistics Info Block */}
           <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-indigo-600 w-5 h-5" />
                <h3 className="text-sm font-black text-slate-900">Logistics & Tracking</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 mb-1">Pallet Number</p>
                  <p className="text-sm font-bold text-slate-700">{data.palletNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 mb-1">Total Pads</p>
                  <p className="text-sm font-bold text-slate-700">{data.noOfPad}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 mb-1">Package Shelf</p>
                  <p className="text-sm font-bold text-slate-700">{data.packageShelfNum}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 mb-1">Delivery Shelf</p>
                  <p className="text-sm font-bold text-slate-700">{data.deliveryShelfNum}</p>
                </div>
              </div>
           </div>

           {/* Financial & Status Block */}
           <div className="bg-indigo-50/30 rounded-[2rem] p-8 border border-indigo-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${statusColors[data.summaryStatus]}`}>
                    {data.summaryStatus}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${printStatusColors[data.printStatus]}`} />
                    <span className="text-[10px] font-black text-slate-500">Print {data.printStatus}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-black text-indigo-400 mb-1">Total Amount Payable</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{data.amount.toLocaleString()}</span>
                    <span className="text-sm font-black text-indigo-600">ETB</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-black text-xs transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2">
                  <Printer size={16} />
                  Print Receipt
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-slate-50/80 p-8 border-t border-slate-100 text-center">
        <p className="text-[9px] font-black text-slate-400 mb-2 px-12">
          This is an electronically generated receipt by Birhanena Selam. No physical signature required.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
           <CheckCircle size={14} className="text-emerald-500" />
           <span className="text-[10px] font-black text-slate-600">Authenticated Transaction</span>
        </div>
      </div>
    </motion.div>
  );
}

function DetailItem({ icon, label, value, primary }: { icon: React.ReactNode, label: string, value: string | number, primary?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black text-slate-400">{label}</span>
      </div>
      <p className={`${primary ? 'text-lg text-slate-950 underline decoration-indigo-200 decoration-4 underline-offset-4' : 'text-sm text-slate-600'} font-black leading-tight group-hover:text-indigo-600 transition-colors`}>
        {value}
      </p>
    </div>
  );
}
