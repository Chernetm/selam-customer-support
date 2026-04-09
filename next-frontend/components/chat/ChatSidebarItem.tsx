// next-frontend/components/chat/ChatSidebarItem.tsx
'use client';

import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronRight, Hash, MessageSquare, Zap } from 'lucide-react';
import { ChatTicket } from '@/types/chat';

interface ChatSidebarItemProps {
  ticket: ChatTicket;
  isSelected: boolean;
  role: 'admin' | 'customer';
  onClick: () => void;
}

import { useLanguage } from '@/contexts/LanguageContext';

export const ChatSidebarItem: React.FC<ChatSidebarItemProps> = ({ ticket, isSelected, role, onClick }) => {
  const { t } = useLanguage();
  const isClosed = ticket.status === 'closed';
  const isAdmin = role === 'admin';
  const lastUpdate = new Date(ticket.updatedAt);
  const customerDisplayName = ticket.customerName || ticket.customer?.name || t('chat.customerDefault');
  const agentDisplayName = ticket.agent 
    ? `${ticket.agent.firstName} ${ticket.agent.lastName.slice(0, 1)}.` 
    : (ticket.agentName || t('chat.agentDefault'));
  const displayName = isAdmin ? customerDisplayName : agentDisplayName;

  return (
    <motion.button
      onClick={onClick}
      className={`relative w-full px-4 py-3.5 flex items-center gap-4 transition-all duration-300 border-b border-gray-50/50 group ${
        isSelected ? 'bg-indigo-50/50 shadow-inner' : 'bg-white hover:bg-gray-50'
      }`}
    >
      {isSelected && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"
        />
      )}

      <div className="relative flex-shrink-0">
        <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center font-black text-lg select-none text-white shadow-md shadow-indigo-100 transition-transform group-hover:scale-105 duration-300 ${
          displayName.startsWith('M') ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}>
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        {!isClosed && ticket.unreadCount && ticket.unreadCount > 0 ? (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-rose-500 rounded-full border-2 border-white flex items-center justify-center px-1 animate-bounce">
            <span className="text-white text-[10px] font-black">{ticket.unreadCount}</span>
          </div>
        ) : null}
        {ticket.status === 'escalated' && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
            <Zap size={10} className="text-white fill-current" />
          </div>
        )}
      </div>
 
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-sm font-black truncate leading-none tracking-tight ${
            isSelected ? 'text-indigo-900' : 'text-gray-900'
          }`}>
             {displayName}
          </h4>
          <span className="text-[10px] tabular-nums whitespace-nowrap opacity-60 font-black text-gray-400 tracking-wider">
             {format(lastUpdate, 'HH:mm')}
          </span>
        </div>
 
        <div className="flex items-center justify-between gap-2 overflow-hidden">
           <p className={`text-[12px] truncate leading-tight font-bold transition-colors ${
             isSelected ? 'text-indigo-400' : 'text-gray-400'
           }`}>
             {ticket.lastMessage || (ticket.chats && ticket.chats.length > 0 ? (ticket.chats[ticket.chats.length-1].message || t('chat.attachment')) : t('chat.linkEstablished'))}
           </p>
           {!isAdmin && ticket.status === 'escalated' && (
             <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-amber-100/50 text-amber-600 tracking-[0.1em] border border-amber-200/50 shrink-0">
               {t('chat.escalatedStatus')}
             </span>
           )}
        </div>
      </div>
    </motion.button>
  );
};
