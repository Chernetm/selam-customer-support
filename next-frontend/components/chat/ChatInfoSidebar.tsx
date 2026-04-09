import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Layers, FileText, Building2, X, ShieldAlert, Clock, User } from 'lucide-react';
import { ChatTicket, ChatRating } from '@/types/chat';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatInfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ChatTicket;
  isMobile: boolean;
  rating?: ChatRating;
}

export const ChatInfoSidebar: React.FC<ChatInfoSidebarProps> = ({ isOpen, onClose, ticket, isMobile }) => {
  const { t } = useLanguage();

  const details = [
    { label: t('chat.referenceId'), value: (ticket as any).tinNumber || 'N/A', icon: Hash, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: t('chat.volumeUnits'), value: (ticket as any).numberOfPads || '0', icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: t('chat.orgType'), value: (ticket as any).receiptType || 'Private', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: t('chat.entityName'), value: (ticket as any).company || 'N/A', icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-[72px] border-b border-gray-100">
        <h3 className="font-black text-gray-900 tracking-tight">{t('chat.ticketInfo')}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Status indicator */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          ticket.status === 'closed' ? 'bg-gray-50 border-gray-100 text-gray-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            ticket.status === 'closed' ? 'bg-gray-400' : 'bg-emerald-500'
          }`} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {t('chat.channel')}: {ticket.status.toUpperCase()}
          </span>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 gap-4">
          {details.map((detail, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
              <div className={`w-10 h-10 rounded-xl ${detail.bg} flex items-center justify-center ${detail.color} shadow-sm`}>
                <detail.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">{detail.label}</p>
                <p className="text-sm font-black text-gray-900 truncate">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description Section */}
        {(ticket as any).complaintDescription && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-400">
              <FileText size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('chat.proceduralPayload')}</span>
            </div>
            <div className="bg-indigo-50/30 rounded-2xl p-5 border border-indigo-100/50">
              <p className="text-xs font-bold text-gray-600 leading-relaxed whitespace-pre-wrap">
                {(ticket as any).complaintDescription}
              </p>
            </div>
          </div>
        )}

        {/* Escalation History if any */}
        {ticket.status === 'escalated' && ticket.escalations && ticket.escalations.length > 0 && (
           <div className="space-y-4">
             <div className="p-5 bg-rose-50/50 rounded-[2rem] border border-rose-100/50 space-y-4 shadow-sm shadow-rose-100/20">
                <div className="flex items-center gap-2 text-rose-600">
                    <ShieldAlert size={16} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">{t('chat.statusEscalation')}</span>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{t('chat.proceduralReason')}</p>
                  <p className="text-[13px] font-bold text-gray-900 leading-relaxed italic">
                    "{ticket.escalations.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].reason || 'No specific reason provided.'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-rose-100/50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('chat.escalatedBy')}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {ticket.escalations[0].escalatedByAdmin?.firstName?.charAt(0) || 'A'}
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 truncate">
                        {ticket.escalations[0].escalatedByAdmin ? `${ticket.escalations[0].escalatedByAdmin.firstName} ${ticket.escalations[0].escalatedByAdmin.lastName.charAt(0)}.` : 'Agent'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('chat.escalatedTo')}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-600">
                        {ticket.escalations[0].escalatedToAdmin?.firstName?.charAt(0) || 'M'}
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 truncate">
                        {ticket.escalations[0].escalatedToAdmin ? `${ticket.escalations[0].escalatedToAdmin.firstName} ${ticket.escalations[0].escalatedToAdmin.lastName.charAt(0)}.` : 'Manager'}
                      </span>
                    </div>
                  </div>
                </div>
             </div>
           </div>
        )}

        {/* Meta Info */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                <span className="uppercase tracking-widest">{t('chat.established')}</span>
                <span className="text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                <span className="uppercase tracking-widest">{t('chat.lastTransmission')}</span>
                <span className="text-gray-900">{new Date(ticket.updatedAt).toLocaleTimeString()}</span>
            </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full border-l border-gray-100 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-20 overflow-hidden shrink-0"
        >
          {sidebarContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
