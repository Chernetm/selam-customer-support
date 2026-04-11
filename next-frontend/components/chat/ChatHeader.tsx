// next-frontend/components/chat/ChatHeader.tsx
'use client';

import React from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  ShieldCheck, 
  Clock, 
  Star, 
  XCircle, 
  ChevronRight,
  Shield,
  Zap,
  Search,
  UserPlus,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChatTicket, ChatRating } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { clsx } from 'clsx';

interface ChatHeaderProps {
  ticket: ChatTicket;
  role: 'admin' | 'customer';
  currentAdminId?: number;
  onBack?: () => void;
  onAction?: (action: string) => void;
  rating?: ChatRating | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  ticket, 
  role, 
  currentAdminId,
  onBack, 
  onAction,
  rating 
}) => {
  const isAdmin = role === 'admin';
  const isClosed = ticket.status === 'closed';
  const isEscalated = ticket.status === 'escalated';
  const isOnline = ticket.status === 'open' || ticket.status === 'escalated' || ticket.status === 'pending';
  const { t } = useLanguage();

  // Get current escalation info
  const latestEscalation = isEscalated && ticket.escalations && ticket.escalations.length > 0 
    ? ticket.escalations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  const escalationInfo = React.useMemo(() => {
    if (!latestEscalation || !currentAdminId) return null;
    
    if (String(latestEscalation.escalatedBy) === String(currentAdminId)) {
      const name = latestEscalation.escalatedToAdmin 
        ? `${latestEscalation.escalatedToAdmin.firstName} ${latestEscalation.escalatedToAdmin.lastName.slice(0, 1)}.`
        : 'Manager';
      return { type: 'to', name };
    }
    
    if (String(latestEscalation.escalatedTo) === String(currentAdminId)) {
      const name = latestEscalation.escalatedByAdmin 
        ? `${latestEscalation.escalatedByAdmin.firstName} ${latestEscalation.escalatedByAdmin.lastName.slice(0, 1)}.`
        : 'Agent';
      return { type: 'by', name };
    }
    
    return null;
  }, [latestEscalation, currentAdminId]);

  const customerName = ticket.customerName || ticket.customer?.name || 'Customer';
  const customerInitial = customerName.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 sticky top-0 z-40 h-[72px]">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-50 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Button>
        )}
 
        <div className="relative group">
          <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center font-black text-lg shadow-md shadow-indigo-100 ${
            isAdmin ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            <span className="text-white select-none">
              {(isAdmin ? customerInitial : (ticket.agentName || 'S').slice(0,1)).toUpperCase()}
            </span>
          </div>
        </div>
 
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
               {isAdmin ? customerName : (ticket.agent ? `${ticket.agent.firstName} ${ticket.agent.lastName.slice(0, 1)}.` : (ticket.agentName || 'Support Agent'))}
            </h3>
            {escalationInfo && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                escalationInfo.type === 'to' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {escalationInfo.type === 'to' ? t('chat.escalatedTo') || 'Escalated To' : t('chat.escalatedBy') || 'Escalated By'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
             <span className={clsx(
               "text-[11px] font-medium font-bold",
               isOnline ? "text-emerald-600" : "text-gray-400"
             )}>
                {isOnline ? t('chat.online') : t('chat.offline')}
             </span>
             <span className="text-gray-300 text-[10px]">•</span>
             <span className="text-[11px] font-medium text-gray-400">
                {ticket.subject || 'Receipt Order Cancellation'}
             </span>
          </div>
        </div>
      </div>
 
      <div className="flex items-center gap-1">
        {isAdmin && !isClosed && (
          <div className="flex items-center gap-1 mr-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onAction?.('transfer')}
              className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              title="Transfer / Escalate"
            >
              <UserPlus size={20} />
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onAction?.('invite')}
              className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
              title="Invite In-Person"
            >
              <MapPin size={20} />
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onAction?.('close')}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-100/50"
            >
              <XCircle size={18} />
              <span className="text-xs font-black uppercase tracking-tight">{t('common.resolve') || 'Resolve'}</span>
            </Button>
          </div>
        )}

        {isClosed && rating && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-700">{rating.score}/5</span>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction?.('info')}
          className="h-10 w-10 p-0 rounded-full text-gray-400 hover:text-gray-600"
        >
          <MoreVertical size={20} />
        </Button>
      </div>
    </div>
  );
};
