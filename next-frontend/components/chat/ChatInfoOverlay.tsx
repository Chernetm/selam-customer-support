// next-frontend/components/chat/ChatInfoOverlay.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Layers, FileText, Building2, X } from 'lucide-react';
import { ChatTicket } from '@/types/chat';

interface ChatInfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ChatTicket;
}

export const ChatInfoOverlay: React.FC<ChatInfoOverlayProps> = ({ isOpen, onClose, ticket }) => {
  if (!isOpen) return null;

  const details = [
    { label: 'Reference ID', value: (ticket as any).tinNumber || 'N/A', icon: Hash, color: 'text-rose-500' },
    { label: 'Volume Units', value: (ticket as any).numberOfPads || '0', icon: Layers, color: 'text-emerald-500' },
    { label: 'Org Type', value: (ticket as any).receiptType || 'Private', icon: FileText, color: 'text-amber-500' },
    { label: 'Entity Name', value: (ticket as any).company || 'N/A', icon: Building2, color: 'text-indigo-500' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-4 left-4 right-4 z-50 glass-premium rounded-[2.5rem] border-white/60 shadow-2xl p-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Transmission Parameters</h4>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {details.map((detail, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <detail.icon size={12} className={detail.color} />
                  {detail.label}
                </span>
                <p className="text-sm font-black text-gray-900 truncate">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>

          {(ticket as any).complaintDescription && (
            <div className="mt-8 pt-6 border-t border-gray-100/50">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <FileText size={12} />
                Payload Description
              </span>
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                <p className="text-xs font-bold text-gray-600 leading-relaxed">
                  {(ticket as any).complaintDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
