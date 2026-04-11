// next-frontend/app/admin/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Building2, 
  Hash, 
  UserPlus, 
  Tag,
  ArrowLeft,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { chatApi } from '@/lib/api/chat';
import clsx from 'clsx';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [tickets, setTickets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await chatApi.getTicketReports(period);
      setTickets(data?.tickets || []);
      setSummary(data?.summary || null);
    } catch (err: any) {
      setError(err.message || 'Failed to sync reports from secure repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period]);

  const stats = {
    total: summary?.totalTickets || 0,
    escalated: summary?.escalatedTickets || 0,
    closed: summary?.closedTickets || 0,
    open: summary?.openTickets || 0,
    servedCustomers: summary?.servedCustomers || 0,
    avgResponse: summary?.avgResponseTime?.toFixed(2) || '0.00'
  };

  const filteredTickets = tickets.filter(t => 
    t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toString().includes(searchTerm) ||
    t.caseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadExcel = async () => {
    if (filteredTickets.length === 0) return;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Issues Report');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Subject', key: 'subject', width: 35 },
      { header: 'Customer', key: 'customerName', width: 25 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Status', key: 'ticketStatus', width: 15 },
      { header: 'Case Type', key: 'caseName', width: 20 },
      { header: 'Agent', key: 'agentName', width: 25 },
      { header: 'Date', key: 'createdAt', width: 15 },
    ];

    // Style the header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }, // indigo-600
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add rows
    filteredTickets.forEach(t => {
      worksheet.addRow({
        id: t.id,
        subject: t.subject,
        customerName: t.customerName || 'Customer',
        company: t.company || 'N/A',
        ticketStatus: t.ticketStatus?.toUpperCase(),
        caseName: t.caseName || 'General',
        agentName: t.agentName || 'Unassigned',
        createdAt: format(new Date(t.createdAt), 'yyyy-MM-dd'),
      });
    });

    // Write to buffer and save
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `selam_issues_${period}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const downloadSummaryPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header & Branding
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('SELAM', 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text('CUSTOMER SUPPORT ANALYTICS', 20, 26);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 32, pageWidth - 20, 32);

    // Report Info
    doc.setFontSize(18);
    doc.setTextColor(17, 24, 39);
    doc.text(`${period.toUpperCase()} PERFORMANCE REPORT`, 20, 45);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, 20, 52);

    // Summary Statistics
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Operational Overview', 20, 65);
    
    autoTable(doc, {
      startY: 70,
      head: [['Metric', 'Value']],
      body: [
        ['Synchronized Issues', stats.total.toString()],
        ['Escalation Frequency', stats.escalated.toString()],
        ['Resolution Success', stats.closed.toString()],
        ['Customer Matrix', stats.servedCustomers.toString()],
        ['Avg Latency', `${stats.avgResponse}h`],
        ['Optimization Rate', `${(stats.closed / (stats.total || 1) * 100).toFixed(1)}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 20, right: 20 },
    });

    // Status Distribution Note
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.text('Executive Summary', 20, finalY + 15);
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const summaryText = `During this ${period} cycle, our system synchronized a total of ${stats.total} issues. ` +
      `We achieved a resolution rate of ${(stats.closed / (stats.total || 1) * 100).toFixed(1)}%, with ` +
      `${stats.escalated} issues requiring advanced synchronization (escalation). ` +
      `The average response latency of ${stats.avgResponse} hours reflects our current operational pulse.`;
    
    const splitText = doc.splitTextToSize(summaryText, pageWidth - 40);
    doc.text(splitText, 20, finalY + 22);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('CONFIDENTIAL - FOR INTERNAL USE ONLY', pageWidth / 2, 285, { align: 'center' });

    doc.save(`selam_summary_${period}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40 relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

      {/* Header Container */}
      <div className="max-w-[1700px] mx-auto px-6 pt-12 md:px-10 md:pt-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
          <div className="space-y-4">
             <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors group"
             >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                Return to Core
             </button>
             <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                Issue <span className="text-indigo-600">Analytics</span>
             </h1>
             <p className="text-gray-400 font-bold max-w-2xl leading-relaxed text-sm">
                Advanced auditing protocols, status distribution, and escalation frequency synchronization.
             </p>
          </div>

          <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl shadow-gray-200/20 border border-white w-full lg:w-auto">
             {['weekly', 'monthly'].map((p) => (
                <button
                   key={p}
                   onClick={() => setPeriod(p as any)}
                   className={clsx(
                      "px-10 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all flex-1 lg:flex-none",
                      period === p 
                         ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                         : "text-gray-400 hover:text-indigo-600 hover:bg-gray-50/50"
                   )}
                >
                   {p} Cycle
                </button>
             ))}
          </div>
        </div>

        {/* Metric Pulse Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <ReportStatCard title="Synchronized Issues" value={stats.total} icon={FileText} color="blue" delay={0.1} />
            <ReportStatCard title="Escalation Frequency" value={stats.escalated} icon={ShieldAlert} color="rose" delay={0.2} />
            <ReportStatCard title="Resolution Success" value={stats.closed} icon={CheckCircle2} color="emerald" delay={0.3} />
            <ReportStatCard title="Customer Matrix" value={stats.servedCustomers} icon={UserPlus} color="indigo" delay={0.4} />
            <ReportStatCard title="Avg Latency" value={`${stats.avgResponse}h`} icon={Clock} color="amber" delay={0.5} />
        </div>

        {/* distribution & Insight Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-2xl shadow-gray-200/20 flex flex-col md:flex-row items-center gap-12">
              <div className="relative w-56 h-56 shrink-0">
                 <StatusPieChart stats={stats} />
              </div>
              <div className="flex-1 w-full space-y-6">
                 <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Status Distribution</h3>
                 <div className="space-y-5">
                    <StatusPulseRow label="Success / Resolved" value={stats.closed} total={stats.total} color="bg-emerald-500" />
                    <StatusPulseRow label="Active Escalations" value={stats.escalated} total={stats.total} color="bg-rose-500" />
                    <StatusPulseRow label="Pending / Active" value={stats.open} total={stats.total} color="bg-blue-500" />
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200/50 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                       <TrendingUp size={28} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Pulse Insight</h3>
                 </div>
                 <p className="text-indigo-100 font-bold leading-relaxed text-lg mb-6">
                    Operational efficiency stabilized at <span className="text-white font-black underline decoration-indigo-400">{(stats.closed / (stats.total || 1) * 100).toFixed(1)}%</span> success rate during the current cycle.
                 </p>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Trend Projection</p>
                    <p className="text-white font-black text-sm uppercase">Positive Expansion Localized</p>
                 </div>
              </div>
              <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                 <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Ecosystem Integrity Secure</span>
                 <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
           </div>
        </div>

        {/* Data Table Area */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
           <div className="p-8 border-b border-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="relative w-full md:w-[450px]">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <Input 
                    placeholder="Search customer, subject, or protocol ID..." 
                    className="h-14 pl-14 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-100/50 font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                 <Button className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border border-indigo-100 shadow-sm" onClick={downloadExcel} disabled={filteredTickets.length === 0}>
                    <Download size={16} className="mr-2" />
                    Export Excel
                 </Button>
                 <Button className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl shadow-indigo-200" onClick={downloadSummaryPDF} disabled={!summary}>
                    <FileText size={16} className="mr-2" />
                    Download PDF Summary
                 </Button>
              </div>
           </div>

           <div className="overflow-x-auto">
              {loading ? (
                <div className="p-32 flex flex-col items-center">
                   <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Reconstructing Dataset...</div>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-32 text-center flex flex-col items-center">
                   <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                      <Hash size={40} className="text-gray-300" />
                   </div>
                   <h3 className="text-xl font-black text-gray-900 uppercase">Records: Undefined</h3>
                   <p className="text-gray-400 font-bold mt-2">Zero datasets localized matching your filter parameters.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[1200px]">
                   <thead>
                      <tr className="bg-gray-50/50">
                         <th className="px-8 py-5 text-[9px] uppercase font-black text-gray-400 tracking-[0.1em] w-[22%]">Protocol / Subject</th>
                         <th className="px-8 py-5 text-[9px] uppercase font-black text-gray-400 tracking-[0.1em] w-[20%]">Entity</th>
                         <th className="px-8 py-5 text-[9px] uppercase font-black text-gray-400 tracking-[0.1em] w-[12%] text-center">Status</th>
                         <th className="px-8 py-5 text-[9px] uppercase font-black text-gray-400 tracking-[0.1em] w-[18%]">Operator</th>
                         <th className="px-8 py-5 text-[9px] uppercase font-black text-gray-400 tracking-[0.1em] w-[18%] text-right">Synchronization Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100/50">
                      {filteredTickets.map((ticket, idx) => (
                        <motion.tr 
                          key={ticket.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="font-black text-gray-900 text-[13px] tracking-tight group-hover:text-indigo-600 transition-colors">{ticket.subject}</span>
                                 <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1 bg-indigo-50/50 px-2 py-0.5 rounded-md"><Hash size={10} /> {ticket.id}</span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md"><Tag size={10} /> {ticket.caseName || "General"}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="font-bold text-gray-800 text-xs">{ticket.customerName || "Customer"}</span>
                                 <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-1"><Building2 size={10} /> {ticket.company || "N/A"}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex justify-center">
                                 <span className={clsx(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    ticket.ticketStatus === 'closed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    ticket.ticketStatus === 'escalated' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    "bg-blue-50 text-blue-600 border-blue-100"
                                 )}>
                                    {ticket.ticketStatus || "Open"}
                                 </span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="font-bold text-gray-700 text-xs">{ticket.agentName || "Unassigned"}</span>
                                 {ticket.escalatedTo && (
                                    <span className="text-[9px] font-black text-rose-500 uppercase mt-1">Escalated to {ticket.escalatedTo}</span>
                                 )}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex flex-col items-end">
                                 <span className="font-black text-gray-900 text-[13px]">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">12:00 PM Pulse</span>
                              </div>
                           </td>
                        </motion.tr>
                      ))}
                   </tbody>
                </table>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function ReportStatCard({ title, value, icon: Icon, color, delay }: any) {
  const colors: any = {
    blue: "bg-blue-500 shadow-blue-100",
    rose: "bg-rose-500 shadow-rose-100",
    emerald: "bg-emerald-500 shadow-emerald-100",
    indigo: "bg-indigo-600 shadow-indigo-100",
    amber: "bg-amber-500 shadow-amber-100"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-gray-200/20 border border-gray-100/50 flex flex-col gap-6 group hover:y-[-4px] transition-all"
    >
       <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110", colors[color])}>
          <Icon size={28} />
       </div>
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
       </div>
    </motion.div>
  );
}

function StatusPieChart({ stats }: any) {
  const total = stats.total || 1;
  const pClosed = (stats.closed / total) * 100;
  const pEscalated = (stats.escalated / total) * 100;

  return (
    <div 
      className="w-full h-full rounded-full shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden"
      style={{
        background: `conic-gradient(
          #10b981 0% ${pClosed}%, 
          #f43f5e ${pClosed}% ${pClosed + pEscalated}%, 
          #3b82f6 ${pClosed + pEscalated}% 100%
        )`
      }}
    >
       <div className="absolute inset-8 bg-white/90 backdrop-blur-md rounded-full flex flex-col items-center justify-center shadow-xl border border-white">
          <span className="text-3xl font-black text-gray-900 leading-none">{Math.round(pClosed)}%</span>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Optimization</span>
       </div>
    </div>
  );
}

function StatusPulseRow({ label, value, total, color }: any) {
  const percentage = total > 0 ? (value / total * 100).toFixed(1) : "0.0";
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
          <span className="text-gray-400 flex items-center gap-2">
             <div className={clsx("w-2.5 h-2.5 rounded-full shadow-sm", color)} /> {label}
          </span>
          <span className="text-gray-900">{value} <span className="text-gray-300 ml-1">({percentage}%)</span></span>
       </div>
       <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={clsx("h-full rounded-full shadow-sm", color)}
          />
       </div>
    </div>
  );
}
