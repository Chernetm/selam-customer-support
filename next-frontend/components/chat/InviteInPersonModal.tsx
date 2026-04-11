'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InviteInPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ticketId: number) => Promise<void>;
  ticketId: number | null;
}

export const InviteInPersonModal = ({ isOpen, onClose, onConfirm, ticketId }: InviteInPersonModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (ticketId === null) return;
    setLoading(true);
    try {
      await onConfirm(ticketId);
      onClose();
    } catch (error) {
      console.error("Failed to invite in-person:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <MapPin size={28} />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                Authorize <span className="text-indigo-600">In-Person</span> Visit?
              </h2>
              <p className="text-gray-500 font-bold text-sm leading-relaxed">
                This action will issue a secure verification pulse (QR Code) to the customer. 
                The invite is strictly limited to <span className="text-gray-900 underline decoration-indigo-300">5 days</span> for operational security.
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4 mb-10 items-center">
               <AlertTriangle className="text-amber-600 shrink-0" size={24} />
               <p className="text-amber-800 text-[11px] font-black uppercase tracking-wider leading-relaxed">
                  System Protocol: Confirm that digital synchronization was insufficient before issuing physical visit clearance.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] border-gray-200 hover:bg-gray-50"
                disabled={loading}
              >
                Sync Postponed
              </Button>
              <Button 
                onClick={handleConfirm}
                className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Issue Clearance"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
