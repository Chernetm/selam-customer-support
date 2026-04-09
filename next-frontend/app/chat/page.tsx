// next-frontend/app/chat/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Search, 
  MessageSquare, 
  Clock, 
  Plus,
  Loader2,
  Shield,
  Star,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatSidebarItem } from '@/components/chat/ChatSidebarItem';
import { ChatMessage, ChatTicket, ChatRating } from '@/types/chat';
import { chatApi } from '@/lib/api/chat';
import socket from '@/lib/socket';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInfoSidebar } from '@/components/chat/ChatInfoSidebar';
import { RatingBlock } from '@/components/chat/RatingBlock';
import { CaseSelectorModal } from '@/components/chat/CaseSelectorModal';
import { useLanguage } from '@/contexts/LanguageContext';
// @ts-ignore
import { jwtDecode } from 'jwt-decode';
import { uploadToCloudinary } from '@/lib/utils/cloudinaryUpload';
import { toast } from 'react-hot-toast';

export default function CustomerChatPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<ChatTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ChatTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [rating, setRating] = useState<ChatRating | null>(null);
  const { t } = useLanguage();

  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [cases, setCases] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const ticketsRef = useRef(tickets);
  const selectedTicketRef = useRef(selectedTicket);

  useEffect(() => { ticketsRef.current = tickets; }, [tickets]);
  useEffect(() => { selectedTicketRef.current = selectedTicket; }, [selectedTicket]);

  // ---------------- RESPONSIVE ----------------
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileView(mobile);
      if (!mobile) setShowChatOnMobile(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------- INIT & AUTH ----------------
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("customerToken");
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        setCustomerInfo(decoded);
        socket.emit("customerLogin", token);

        const [ticketsData, casesData] = await Promise.all([
          chatApi.getCustomerTickets(50, 0),
          chatApi.getCases()
        ]);

        setTickets(ticketsData || []);
        setCases(casesData || []);
        ticketsData.forEach(t => socket.emit("joinTicket", t.id));
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // ---------------- SELECTION ----------------
  const handleSelectTicket = async (ticket: ChatTicket) => {
    setSelectedTicket(ticket);
    setMessages(ticket.chats || []);
    
    // UI unread update
    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, unreadCount: 0 } : t
    ));

    socket.emit("joinTicket", ticket.id);
    await chatApi.markMessagesAsRead(ticket.id, 'customer');

    if (ticket.status === 'closed') {
      const r = await chatApi.getTicketRating(ticket.id);
      setRating(r);
    } else {
      setRating(null);
    }

    if (isMobileView) setShowChatOnMobile(true);
    setIsInfoOpen(false);
  };

  // ---------------- SOCKET ----------------
  useEffect(() => {
    const handleNewMessage = (chat: ChatMessage) => {
      const current = selectedTicketRef.current;

      if (current && current.id === chat.ticketId) {
        setMessages(prev => {
          const exists = prev.find(m => m.id === chat.id || (m.tempId && String(m.tempId) === String(chat.tempId)));
          if (exists) return prev.map(m => (m.id === chat.id || (m.tempId && String(m.tempId) === String(chat.tempId))) ? chat : m);
          return [...prev, chat];
        });

        if (chat.senderType !== 'customer') {
          chatApi.markMessagesAsRead(chat.ticketId, 'customer').catch(console.error);
        }
      }

      setTickets(prev => {
        const idx = prev.findIndex(t => t.id === chat.ticketId);
        const isSelected = current && current.id === chat.ticketId;

        if (idx !== -1) {
          const updated = {
            ...prev[idx],
            lastMessage: chat.message,
            unreadCount: isSelected ? 0 : (prev[idx].unreadCount || 0) + 1,
            updatedAt: chat.createdAt,
            chats: [...(prev[idx].chats || []), chat].filter((m, i, self) => 
              i === self.findIndex((t) => t.id === m.id || (t.tempId && t.tempId === m.tempId))
            )
          };
          const copy = [...prev];
          copy.splice(idx, 1);
          return [updated, ...copy];
        } else {
           chatApi.getTicket(chat.ticketId, 'customer').then(t => {
             if (t) setTickets(curr => [t, ...curr]);
           });
           return prev;
        }
      });
    };

    const handleTicketClosed = (ticketId: number) => {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'closed' } : t));
      if (selectedTicketRef.current?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: 'closed' } : null);
        chatApi.getTicketRating(ticketId).then(setRating);
      }
    };

    const handleMessagesRead = (payload: { ticketId: number, readBy: string }) => {
      if (payload.readBy === 'customer') return;
      const current = selectedTicketRef.current;
      if (current && current.id === payload.ticketId) {
        setMessages(prev => prev.map(m => m.senderType === 'customer' ? { ...m, isRead: true } : m));
      }
    };

    const handleConnect = () => {
      ticketsRef.current.forEach(t => socket.emit("joinTicket", t.id));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("ticketClosed", handleTicketClosed);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("connect", handleConnect);

    return () => { 
      socket.off("newMessage", handleNewMessage);
      socket.off("ticketClosed", handleTicketClosed);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("connect", handleConnect);
    };
  }, []);

  // ---------------- SCROLL ----------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ---------------- SEND ----------------
  const handleSendMessage = async (msgText: string, file?: File) => {
    if (!selectedTicket || !customerInfo) return;

    const tempId = Date.now();
    let mediaUrl = "";
    let mediaType: 'image' | 'audio' | 'file' | undefined;
    let audioDuration = 0;

    // LOCAL PREVIEW FOR OPTIMISTIC UI
    if (file) {
      mediaUrl = URL.createObjectURL(file);
      mediaType = file.type.startsWith("audio") ? "audio" : file.type.startsWith("image") ? "image" : "file";
    }

    const optimistic: ChatMessage = {
      id: null,
      tempId,
      ticketId: selectedTicket.id,
      senderId: customerInfo.userId || customerInfo.id,
      senderType: 'customer',
      message: msgText,
      mediaUrl,
      mediaType,
      audioDuration,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, optimistic]);

    // Update sidebar optimistically
    setTickets(prev => {
      const idx = prev.findIndex(t => t.id === selectedTicket.id);
      if (idx === -1) return prev;
      
      const messagePreview = (msgText || (mediaType === 'image' ? 'Photo 🖼️' : mediaType === 'audio' ? 'Voice message 🎤' : 'Attachment 📎'));
      
      const updated = {
        ...prev[idx],
        lastMessage: messagePreview,
        unreadCount: 0,
        updatedAt: optimistic.createdAt
      };
      
      const copy = [...prev];
      copy.splice(idx, 1);
      return [updated, ...copy];
    });

    // START REAL UPLOAD IN BACKGROUND
    if (file) {
      try {
        const res = await uploadToCloudinary(file);
        const realMediaUrl = res.secure_url;
        const realAudioDuration = res.duration || 0;
        
        setMessages(prev => prev.map(m => 
          (m.tempId && String(m.tempId) === String(tempId)) ? { ...m, mediaUrl: realMediaUrl, audioDuration: realAudioDuration } : m
        ));
        
        mediaUrl = realMediaUrl;
        audioDuration = realAudioDuration;
      } catch (error) {
        console.error("Upload failed:", error);
        setMessages(prev => prev.filter(m => m.tempId !== tempId));
        return;
      }
    }

    try {
      const sentMsg = await chatApi.sendCustomerMessage({
        ticketId: selectedTicket.id,
        message: msgText,
        mediaUrl,
        mediaType,
        audioDuration,
        tempId
      });

      if (sentMsg && sentMsg.id) {
        setMessages(prev => prev.map(m => 
          (m.tempId && String(m.tempId) === String(tempId)) ? { ...m, id: sentMsg.id } : m
        ));
      }
    } catch (error) {
      console.error("Failed to send:", error);
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
    }
  };

  const handleOpenNewTicketModal = () => {
    const hasUnclosed = tickets.some(t => t.status !== 'closed');
    if (hasUnclosed) {
      toast.error(t('chat.toast.activeExists'), {
        style: {
          borderRadius: '16px',
          background: '#1e1b4b',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: '1px solid #312e81'
        },
        icon: '⚠️'
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateTicket = async (ticketData: any) => {
    setIsCreatingTicket(true);
    try {
      const caseItem = cases.find((c: any) => c.id === ticketData.caseId);
      const newTicket = await chatApi.createTicket({
        ...ticketData,
        subject: `Transmission: ${caseItem?.name || 'General Request'}`,
      });
      
      setTickets(prev => [newTicket, ...prev]);
      setIsModalOpen(false);
      handleSelectTicket(newTicket);
    } catch (error) {
      toast.error(t('chat.toast.failure'));
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleRateTicket = async (score: number, comment: string) => {
    if (!selectedTicket) return;
    setIsRatingSubmitting(true);
    try {
      const res = await chatApi.rateTicket(selectedTicket.id, { score, comment });
      setRating(res);
    } catch (error) {
      alert(t('chat.toast.rateFailure'));
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toString().includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <div className={`w-full lg:w-96 flex flex-col bg-white border-r border-gray-100 transition-all ${
        isMobileView && showChatOnMobile ? 'hidden' : 'flex'
      }`}>
        <div className="p-6 border-b border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Zap className="text-white w-5 h-5 fill-current" />
               </div>
               <div>
                  <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase">Nexus</h1>
                  <span className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase">Intelligence</span>
               </div>
            </div>
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={handleOpenNewTicketModal}
               className="h-9 w-9 p-0 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
               <Plus size={18} />
            </Button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-indigo-600" />
            <Input 
              placeholder={t('chat.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-gray-50 border-transparent rounded-xl focus:ring-4 focus:ring-indigo-100/50 transition-all font-bold text-black text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-20 bg-gray-50 rounded-2xl" />
               ))}
            </div>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map(ticket => (
              <ChatSidebarItem 
                key={ticket.id}
                ticket={ticket}
                role="customer"
                isSelected={selectedTicket?.id === ticket.id}
                onClick={() => handleSelectTicket(ticket)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <MessageSquare size={32} />
               </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{t('chat.noTransmissions')}</h3>
                <p className="text-[11px] font-bold text-gray-400 mt-2">{t('chat.noTransmissionsSub')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative transition-all ${
        isMobileView && !showChatOnMobile ? 'hidden' : 'flex'
      }`}>
        {selectedTicket ? (
          <div className="flex flex-col h-full bg-[#E4EBEF] relative">
            <ChatHeader 
              ticket={selectedTicket} 
              role="customer" 
              rating={rating}
              onBack={() => setShowChatOnMobile(false)}
              onAction={(action) => action === 'info' ? setIsInfoOpen(!isInfoOpen) : null}
            />
            
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 custom-scrollbar"
                  style={{ scrollBehavior: 'smooth' }}
                >
                   <AnimatePresence mode="popLayout">
                     {messages.reduce((acc: any[], msg, idx) => {
                       const msgDate = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                       const prevMsgDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : null;

                       if (msgDate !== prevMsgDate) {
                         acc.push(
                           <div key={`date-${msgDate}`} className="flex justify-center my-6">
                             <div className="px-4 py-1.5 bg-gray-100/30 backdrop-blur-md rounded-full text-gray-500 text-[12px] font-bold">
                               {msgDate}
                             </div>
                           </div>
                         );
                       }

                       acc.push(
                         <MessageBubble 
                           key={msg.id || msg.tempId || idx} 
                           message={msg} 
                           isSelf={msg.senderType === 'customer'} 
                           showSenderName={selectedTicket.status === 'escalated'}
                         />
                       );
                       return acc;
                     }, [])}
                   </AnimatePresence>

                   {selectedTicket.status === 'closed' && (
                     <div className="mt-16">
                        <RatingBlock 
                          rating={rating} 
                          onSubmit={handleRateTicket} 
                          isSubmitting={isRatingSubmitting}
                        />
                     </div>
                   )}
                </div>

                <div className="p-6 pt-0">
                  {selectedTicket.status !== 'closed' ? (
                    <MessageInput 
                      onSendMessage={handleSendMessage} 
                      placeholder={t('chat.placeholder')}
                    />
                  ) : (
                    <div className="glass-premium p-4 rounded-[2rem] border-white/60 flex items-center justify-center gap-3 bg-gray-50/50">
                       <div className="w-2 h-2 rounded-full bg-gray-400" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">{t('chat.concluded')}</span>
                    </div>
                  )}
                </div>
              </div>

              {!isMobileView && (
                <ChatInfoSidebar 
                  isOpen={isInfoOpen} 
                  onClose={() => setIsInfoOpen(false)} 
                  ticket={selectedTicket}
                  isMobile={false}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#E4EBEF] p-10 text-center relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md flex flex-col items-center"
            >
               <div className="w-24 h-24 bg-white/50 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-2xl shadow-indigo-100/50 mb-8 border border-white">
                  <MessageSquare size={48} className="animate-bounce" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-4">{t('chat.establishLink')}</h2>
               <p className="text-gray-500 font-bold text-sm leading-relaxed">
                  {t('chat.establishLinkSub')}
               </p>
               <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white text-left">
                     <Shield className="text-indigo-600 mb-2" size={20} />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('chat.encryption')}</p>
                     <p className="text-xs font-black text-gray-900 mt-1">{t('chat.encrypted')}</p>
                  </div>
                  <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white text-left">
                     <Clock className="text-emerald-500 mb-2" size={20} />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('chat.queueStatus')}</p>
                     <p className="text-xs font-black text-gray-900 mt-1">{t('chat.priorityL1')}</p>
                  </div>
               </div>
               <Button 
                  onClick={handleOpenNewTicketModal}
                  className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 transition-all flex items-center gap-3"
               >
                  <Plus size={16} />
                  {t('chat.newSecureRequest')}
               </Button>
            </motion.div>
          </div>
        )}
      </div>

      <CaseSelectorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cases={cases}
        onSelectCase={handleCreateTicket}
        isCreating={isCreatingTicket}
      />

      {/* Mobile Info Overlay */}
      {selectedTicket && isMobileView && (
        <ChatInfoSidebar 
          isOpen={isInfoOpen} 
          onClose={() => setIsInfoOpen(false)} 
          ticket={selectedTicket}
          isMobile={true}
        />
      )}
    </div>
  );
}
