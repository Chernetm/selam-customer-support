// next-frontend/app/admin/chat/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  LayoutGrid,
  Shield,
  Loader2,
  RefreshCcw,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatSidebarItem } from '@/components/chat/ChatSidebarItem';
import { ChatMessage, ChatTicket } from '@/types/chat';
import { chatApi } from '@/lib/api/chat';
import socket from '@/lib/socket';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInfoSidebar } from '@/components/chat/ChatInfoSidebar';
import { ScheduleDashboard } from '@/components/chat/ScheduleDashboard';
import { CloseTicketModal } from '@/components/chat/CloseTicketModal';
import { TransferTicketModal } from '@/components/chat/TransferTicketModal';
import { InviteInPersonModal } from '@/components/chat/InviteInPersonModal';
import { uploadToCloudinary } from '@/lib/utils/cloudinaryUpload';
import { ChatRating } from '@/types/chat';
import { Suspense } from 'react';
import { toast } from 'react-hot-toast';

function AdminChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const ticketIdFromUrl = searchParams.get('ticketId');

  const [tickets, setTickets] = useState<ChatTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ChatTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminId, setAdminId] = useState<number | null>(null);
  const [rating, setRating] = useState<ChatRating | null>(null);

  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'schedule'>('all');

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
      const storedId = localStorage.getItem("adminId");
      if (storedId) {
        const id = parseInt(storedId, 10);
        setAdminId(id);
        socket.emit("join", `admin_${id}`);
        console.log("👤 Admin ID set:", id);
      }
      
      const token = localStorage.getItem("adminToken");
      socket.emit("adminLogin", token || "");

      try {
        const data = await chatApi.getAgentTickets(100, 0);
        setTickets(data || []);
        data.forEach(t => socket.emit("joinTicket", t.id));
      } catch (error) {
        console.error("Failed to load tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ---------------- SELECTION ----------------
  const handleSelectTicket = async (ticket: ChatTicket) => {
    setSelectedTicket(ticket);
    setMessages(ticket.chats || []);
    
    // UI unread update
    setTickets(prev => prev.map(t => 
      t.id === ticket.id ? { ...t, unreadCount: 0 } : t
    ));

    socket.emit("joinTicket", ticket.id);
    await chatApi.markMessagesAsRead(ticket.id, 'admin');

    if (ticket.status === 'closed') {
      const r = await chatApi.getTicketRating(ticket.id).catch(() => null);
      setRating(r);
    } else {
      setRating(null);
    }

    if (isMobileView) setShowChatOnMobile(true);
    setIsInfoOpen(false); // Close info when switching tickets
  };

  // ---------------- SOCKET ----------------
  useEffect(() => {
    if (!adminId) return;

    const playSound = () => {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => { });
    };

    const handleNewMessage = (chat: ChatMessage) => {
      console.log("📨 Received message:", chat);
      const current = selectedTicketRef.current;

      if (chat.senderType === 'customer') playSound();

      if (current && current.id === chat.ticketId) {
        setMessages(prev => {
          const exists = prev.find(m => m.id === chat.id || (m.tempId && String(m.tempId) === String(chat.tempId)));
          if (exists) return prev.map(m => (m.id === chat.id || (m.tempId && String(m.tempId) === String(chat.tempId))) ? chat : m);
          return [...prev, chat];
        });

        if (chat.senderType === 'customer') {
          chatApi.markMessagesAsRead(chat.ticketId, 'admin').catch(console.error);
        }
      }

      setTickets(prev => {
        const idx = prev.findIndex(t => t.id === chat.ticketId);
        const isSelected = current && current.id === chat.ticketId;

        if (idx !== -1) {
          const isMeInSocket = (chat.senderType === 'agent' || chat.senderType === 'manager') && String(chat.senderId) === String(adminId);
          const messagePreview = (isMeInSocket ? 'You: ' : (chat.senderName ? `${chat.senderName}: ` : '')) + (chat.message || (chat.mediaType === 'image' ? 'Photo 🖼️' : chat.mediaType === 'audio' ? 'Voice message 🎤' : 'Attachment 📎'));
          const updated = {
            ...prev[idx],
            lastMessage: messagePreview,
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
           // Fetch and add if not in list
           chatApi.getTicket(chat.ticketId, 'admin').then(t => {
             if (t) setTickets(curr => [t, ...curr]);
           });
           return prev;
        }
      });
    };

    const handleMessagesRead = ({ ticketId, readBy }: { ticketId: number, readBy: string }) => {
       const current = selectedTicketRef.current;
       if (readBy === 'customer' && current && current.id === ticketId) {
         setMessages(prev => prev.map(m => m.senderType === 'agent' ? { ...m, isRead: true } : m));
       }
       if (readBy === 'admin') {
         setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, unreadCount: 0 } : t));
       }
    };

    const handleTicketAssigned = (newTicket: ChatTicket) => {
      console.log("🎫 New ticket assigned:", newTicket);
      setTickets(prev => {
        if (prev.find(t => t.id === newTicket.id)) return prev;
        playSound();
        return [newTicket, ...prev];
      });
      socket.emit("joinTicket", newTicket.id);
    };

    const handleTicketEscalated = (updatedTicket: ChatTicket) => {
      console.log("🎫 Ticket escalated:", updatedTicket);
      setTickets(prev => {
        const idx = prev.findIndex(t => t.id === updatedTicket.id);
        if (idx === -1) {
          playSound();
          return [updatedTicket, ...prev];
        }
        const copy = [...prev];
        copy[idx] = updatedTicket;
        return copy;
      });
      socket.emit("joinTicket", updatedTicket.id);
    };

    const handleTicketUnassigned = (ticketId: number) => {
      console.log("🎫 Ticket unassigned:", ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      if (selectedTicketRef.current?.id === ticketId) {
        setSelectedTicket(null);
        setMessages([]);
        if (isMobileView) setShowChatOnMobile(false);
      }
    };

    const handleConnect = () => {
      console.log("🔁 Admin reconnected");
      const token = localStorage.getItem("adminToken");
      socket.emit("adminLogin", token || "");
      socket.emit("join", `admin_${adminId}`);
      ticketsRef.current.forEach(t => socket.emit("joinTicket", t.id));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("ticketAssigned", handleTicketAssigned);
    socket.on("ticketEscalated", handleTicketEscalated);
    socket.on("ticketUnassigned", handleTicketUnassigned);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("ticketAssigned", handleTicketAssigned);
      socket.off("ticketEscalated", handleTicketEscalated);
      socket.off("ticketUnassigned", handleTicketUnassigned);
      socket.off("connect", handleConnect);
    };
  }, [adminId]);

  // ---------------- SCROLL ----------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ---------------- SEND ----------------
  const handleSendMessage = async (msgText: string, file?: File) => {
    if (!selectedTicket || !adminId) return;

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
      senderId: adminId,
      senderType: 'agent',
      senderName: 'You',
      message: msgText,
      mediaUrl,
      mediaType,
      audioDuration,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, optimistic]);

    // Optimistically update the sidebar list
    setTickets(prev => {
      const idx = prev.findIndex(t => t.id === selectedTicket.id);
      if (idx === -1) return prev;
      
      const messagePreview = 'You: ' + (msgText || (mediaType === 'image' ? 'Photo 🖼️' : mediaType === 'audio' ? 'Voice message 🎤' : 'Attachment 📎'));
      
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

    // NOW START THE REAL UPLOAD IN BACKGROUND
    if (file) {
      try {
        const res = await uploadToCloudinary(file);
        const realMediaUrl = res.secure_url;
        const realAudioDuration = res.duration || 0;
        
        // Update the optimistic message with the real URL
        setMessages(prev => prev.map(m => 
          (m.tempId && String(m.tempId) === String(tempId)) ? { ...m, mediaUrl: realMediaUrl, audioDuration: realAudioDuration } : m
        ));
        
        mediaUrl = realMediaUrl; // use for the final API call
        audioDuration = realAudioDuration;
      } catch (error) {
        console.error("Upload failed:", error);
        setMessages(prev => prev.filter(m => m.tempId !== tempId));
        toast.error("Failed to upload attachment");
        return;
      }
    }

    try {
      const sentMsg = await chatApi.sendAgentMessage({
        ticketId: selectedTicket.id,
        senderId: adminId,
        message: msgText,
        mediaUrl,
        mediaType,
        audioDuration,
        tempId
      });

      // Update the optimistic message with the real ID from the server response
      if (sentMsg && sentMsg.id) {
        setMessages(prev => prev.map(m => 
          (m.tempId && String(m.tempId) === String(tempId)) ? { ...m, id: sentMsg.id } : m
        ));
      }
    } catch (error) {
      console.error("Failed to send:", error);
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
      toast.error("Failed to send message");
    }
  };

  const handleCloseTicket = () => {
    if (!selectedTicket) return;
    setIsCloseModalOpen(true);
  };

  const confirmCloseTicket = async (ticketId: number, summary: string) => {
    await chatApi.closeTicket(ticketId, summary);
    
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'closed' } : t
    ));

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: 'closed' } : null);
    }

    toast.success("Ticket resolved successfully");
  };

  const confirmInviteInPerson = async (ticketId: number) => {
    const data = await chatApi.inviteInPerson(ticketId);
    
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'in-person', inviteCode: data.ticket.inviteCode, inviteExpiresAt: data.ticket.inviteExpiresAt } : t
    ));

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { 
        ...prev, 
        status: 'in-person', 
        inviteCode: data.ticket.inviteCode, 
        inviteExpiresAt: data.ticket.inviteExpiresAt 
      } : null);
    }

    toast.success("In-person pulse issued successfully");
  };

  const handleAction = (action: string) => {
    if (action === 'info') setIsInfoOpen(!isInfoOpen);
    if (action === 'close') handleCloseTicket();
    if (action === 'transfer') setIsTransferModalOpen(true);
    if (action === 'invite') setIsInviteModalOpen(true);
  };

  const handleTransferSuccess = (type: 'reassign' | 'escalate', target: any) => {
    if (selectedTicket) {
      setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
      setSelectedTicket(null);
      setMessages([]);
      if (isMobileView) setShowChatOnMobile(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toString().includes(searchQuery);
    
    if (activeFilter === 'all') return matchesSearch;

    const isAssigned = t.agentId === adminId;
    const isEscalatedToMe = t.escalations?.some(e => e.escalatedTo === adminId && e.status !== 'resolved');
    
    return matchesSearch && t.status !== 'closed' && (isAssigned || isEscalatedToMe);
  });

  const myScheduleCount = tickets.filter(t => 
    t.status !== 'closed' && 
    (t.agentId === adminId || t.escalations?.some(e => e.escalatedTo === adminId && e.status !== 'resolved'))
  ).length;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <div className={`w-full lg:w-96 flex flex-col bg-white border-r border-gray-100 transition-all ${
        (isMobileView && showChatOnMobile) || (activeFilter === 'schedule' && !selectedTicket) ? 'hidden' : 'flex'
      }`}>
        <div className="p-6 border-b border-gray-100/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Zap className="text-white w-5 h-5 fill-current" />
               </div>
               <div>
                  <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none uppercase">{t('common.brand')}</h1>
                  <span className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase">{t('common.enterprise')}</span>
               </div>
            </div>
          </div>

          <div className="relative group mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-indigo-600" />
            <Input 
              placeholder={t('chat.searchCustomerPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-gray-50 border-transparent rounded-xl focus:ring-4 focus:ring-indigo-100/50 transition-all font-bold text-black text-xs"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl relative">
             <button 
               onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
                 activeFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
               }`}
             >
               <LayoutGrid size={13} />
               All
               <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                 activeFilter === 'all' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
               }`}>
                 {tickets.length}
               </span>
             </button>
             <button 
               onClick={() => {
                  setActiveFilter('schedule');
                  setSelectedTicket(null);
                  setSearchQuery('');
                  if (isMobileView) setShowChatOnMobile(true);
                }}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
                 activeFilter === 'schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
               }`}
             >
               <Clock size={13} />
               My Schedule
               <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                 activeFilter === 'schedule' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-100 text-indigo-600'
               }`}>
                 {myScheduleCount}
               </span>
             </button>
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
                role="admin"
                isSelected={selectedTicket?.id === ticket.id}
                onClick={() => handleSelectTicket(ticket)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <MessageSquare size={32} />
               </div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">No Transmissions</h3>
               <p className="text-[11px] font-bold text-gray-400 mt-2">Check your filters or wait for incoming support requests.</p>
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
              role="admin" 
              currentAdminId={adminId || undefined}
              rating={rating}
              onBack={() => setShowChatOnMobile(false)}
              onAction={handleAction}
            />
            
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 md:p-10 space-y-2 custom-scrollbar"
                  style={{ scrollBehavior: 'smooth' }}
                >
                   <AnimatePresence mode="popLayout">
                     {messages.map((msg, idx) => (
                       <MessageBubble 
                         key={msg.id || msg.tempId || idx} 
                         message={msg} 
                         isSelf={(msg.senderType === 'agent' || msg.senderType === 'manager') && (adminId ? String(msg.senderId) === String(adminId) : true)} 
                         showSenderName={selectedTicket.status === 'escalated'}
                       />
                     ))}
                   </AnimatePresence>
                </div>

                <div className="p-6 pt-0">
                   {selectedTicket.status !== 'closed' ? (
                     <MessageInput 
                       onSendMessage={handleSendMessage} 
                     />
                   ) : (
                     <div className="glass-premium p-4 rounded-[2rem] border-white/60 flex items-center justify-center gap-3 bg-gray-50/50">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em]">Transmission Concluded • Read Only Mode</span>
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
        ) : activeFilter === 'schedule' ? (
          <div className="flex-1 overflow-hidden">
            <ScheduleDashboard 
              tickets={filteredTickets} 
              onSelectTicket={handleSelectTicket} 
              onBack={() => {
                setActiveFilter('all');
                if (isMobileView) setShowChatOnMobile(false);
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#E4EBEF] p-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md flex flex-col items-center"
            >
               <div className="w-24 h-24 bg-white/50 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-2xl shadow-indigo-100/50 mb-8 border border-white">
                  <MessageSquare size={48} className="animate-bounce" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-4">Select a Channel</h2>
               <p className="text-gray-500 font-bold text-sm leading-relaxed">
                  Join a secure support session to assist customers and resolve organizational issues in real-time.
               </p>
               <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white text-left">
                     <Shield className="text-indigo-600 mb-2" size={20} />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End-to-End</p>
                     <p className="text-xs font-black text-gray-900 mt-1">Encrypted</p>
                  </div>
                  <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white text-left">
                     <Clock className="text-emerald-500 mb-2" size={20} />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Response Time</p>
                     <p className="text-xs font-black text-gray-900 mt-1">&lt; 2 Minutes</p>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile Info Overlay */}
      {selectedTicket && isMobileView && (
        <ChatInfoSidebar 
          isOpen={isInfoOpen} 
          onClose={() => setIsInfoOpen(false)} 
          ticket={selectedTicket}
          isMobile={true}
        />
      )}

      <CloseTicketModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={confirmCloseTicket}
        ticketId={selectedTicket?.id || null}
      />

      <TransferTicketModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        ticket={selectedTicket}
        onTransferSuccess={handleTransferSuccess}
      />

      <InviteInPersonModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onConfirm={confirmInviteInPerson}
        ticketId={selectedTicket?.id || null}
      />
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-[#F8FAFC]">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Synchronizing Interface...</p>
      </div>
    }>
      <AdminChat />
    </Suspense>
  );
}
