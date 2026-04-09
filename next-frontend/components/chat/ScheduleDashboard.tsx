'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    AlertCircle, 
    Calendar,
    TrendingUp,
    CheckCircle2,
    Inbox,
    Zap,
    Timer,
    ArrowUpRight
} from 'lucide-react';
import { ChatTicket } from '@/types/chat';
import clsx from 'clsx';

interface ScheduleDashboardProps {
    tickets: ChatTicket[];
    onSelectTicket: (ticket: ChatTicket) => void;
}

const PRIORITY_SLA: Record<string, number> = {
    'Urgent': 6,    // 6 hours
    'High': 24,    // 24 hours
    'Medium': 48,  // 2 days
    'Low': 120     // 5 days
};

const PRIORITY_WEIGHT: Record<string, number> = {
    'Urgent': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
};

export function ScheduleDashboard({ tickets, onSelectTicket }: ScheduleDashboardProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const processedTickets = tickets
        .filter(t => t.status !== 'closed')
        .map(t => {
            const slaHours = PRIORITY_SLA[t.priority || ''] || 48;
            const created = new Date(t.createdAt);
            const deadline = t.deadlineAt ? new Date(t.deadlineAt) : new Date(created.getTime() + slaHours * 60 * 60 * 1000);
            const diff = currentTime.getTime() - deadline.getTime();
            const isOverdue = diff > 0;
            
            return {
                ...t,
                deadline,
                diff,
                isOverdue,
                priorityWeight: PRIORITY_WEIGHT[t.priority || ''] || 0
            };
        });

    // Sort by Deadline (closest first)
    processedTickets.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    const stats = {
        total: processedTickets.length,
        overdue: processedTickets.filter(t => t.isOverdue).length,
        urgent: processedTickets.filter(t => t.priority === 'Urgent').length,
        nearing: processedTickets.filter(t => !t.isOverdue && Math.abs(t.diff) < 4 * 60 * 60 * 1000).length // < 4 hours
    };

    const StatCard = ({ title, value, icon: Icon, color, delay }: { title: string, value: number, icon: any, color: string, delay: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/40 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-4">
                <div className={clsx("p-3 rounded-2xl shadow-lg", color)}>
                    <Icon size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{value}</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{title}</p>
                </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-50/50 flex items-center justify-center border border-white">
                <TrendingUp size={16} className="text-gray-300" />
            </div>
        </motion.div>
    );

    return (
        <div className="h-full overflow-y-auto px-6 py-10 md:px-12 custom-scrollbar">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Work <span className="text-indigo-600">Schedule</span>
                            <div className="bg-indigo-100 text-indigo-600 text-[10px] uppercase font-black px-2.5 py-1 rounded-full border border-indigo-200 tracking-widest shadow-sm">Live Queue</div>
                        </h1>
                        <p className="text-gray-500 mt-2 font-bold text-sm">Prioritized tasks based on SLA urgency and case importance.</p>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard title="Active Queue" value={stats.total} icon={Inbox} color="bg-indigo-600" delay={0.1} />
                    <StatCard title="Overdue Issues" value={stats.overdue} icon={AlertCircle} color="bg-rose-500" delay={0.2} />
                    <StatCard title="Urgent Priority" value={stats.urgent} icon={Zap} color="bg-amber-500" delay={0.3} />
                    <StatCard title="Nearing SLA" value={stats.nearing} icon={Timer} color="bg-blue-500" delay={0.4} />
                </div>

                {/* Queue List */}
                <div className="space-y-4">
                    {processedTickets.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-24 text-center bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-inner"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Queue is Clear</h3>
                            <p className="text-gray-400 mt-2 font-bold text-sm">All tasks are currently within SLA or resolved.</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {processedTickets.map((ticket, idx) => (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={clsx(
                                        "group bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6",
                                        ticket.isOverdue && "border-l-4 border-l-rose-500"
                                    )}
                                >
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className={clsx(
                                            "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-sm transition-transform group-hover:scale-105",
                                            ticket.priority === 'Urgent' ? "bg-rose-50 text-rose-600" :
                                            ticket.priority === 'High' ? "bg-amber-50 text-amber-600" :
                                            ticket.priority === 'Medium' ? "bg-blue-50 text-blue-600" :
                                            "bg-gray-50 text-gray-400"
                                        )}>
                                            <span className="text-[9px] uppercase leading-none mb-1 opacity-60">Rank</span>
                                            <span className="text-xl leading-none">{idx + 1}</span>
                                        </div>

                                         <div className="min-w-0">
                                            <div className="flex flex-col gap-1 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{ticket.customerName || ticket.customer?.name || 'Customer'}</span>
                                                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{ticket.id}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-[17px] font-black text-gray-900 truncate tracking-tight">{ticket.subject}</h4>
                                                    <span className={clsx(
                                                        "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm",
                                                        ticket.priority === 'Urgent' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                        ticket.priority === 'High' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        ticket.priority === 'Medium' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-gray-50 text-gray-400 border-gray-100"
                                                    )}>
                                                        {ticket.priority || 'Low'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-300" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5"><Zap size={13} className="text-gray-300" /> {ticket.caseName || 'General'}</span>
                                                <span className="flex items-center gap-1.5 text-indigo-500/60 font-black"># {ticket.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 shrink-0 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-6 md:pt-0">
                                        <div className="text-right flex-1 md:flex-none">
                                            <div className={clsx(
                                                "text-[9px] font-black uppercase tracking-[0.15em] flex items-center justify-end gap-1.5 mb-1.5",
                                                ticket.isOverdue ? "text-rose-500" : "text-emerald-500"
                                            )}>
                                                <Clock size={12} />
                                                {ticket.isOverdue ? "Extra Time" : "Remaining Time"}
                                            </div>
                                            <div className={clsx(
                                                "text-xl font-black tracking-tight leading-none",
                                                ticket.isOverdue ? "text-rose-600" : "text-gray-900"
                                            )}>
                                                {formatDuration(ticket.diff)}
                                            </div>
                                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2 translate-y-1">
                                                {new Date(ticket.deadline).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onSelectTicket(ticket)}
                                            className="h-14 px-8 bg-indigo-600 text-white rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2.5 hover:bg-black hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-indigo-100 group/btn"
                                        >
                                            Solve
                                            <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatDuration(ms: number) {
    const abs = Math.abs(ms);
    const totalMinutes = Math.floor(abs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
