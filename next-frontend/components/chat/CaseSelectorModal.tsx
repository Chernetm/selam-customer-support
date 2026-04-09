// next-frontend/components/chat/CaseSelectorModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquarePlus, Hash, Layers, FileText, Building2, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface CaseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: any[];
  onSelectCase: (data: any) => void;
  isCreating: boolean;
}

export const CaseSelectorModal: React.FC<CaseSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  cases, 
  onSelectCase, 
  isCreating 
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    caseId: "",
    tinNumber: "",
    numberOfPads: "",
    receiptType: "private",
    company: "",
    complaintDescription: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId) {
      alert("Please select a case type");
      return;
    }
    onSelectCase({
      ...formData,
      caseId: Number(formData.caseId),
      numberOfPads: Number(formData.numberOfPads) || 0
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Backdrop with extra blur */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-[440px] overflow-hidden border border-white relative z-10"
        >
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-100/50 flex justify-between items-center bg-gray-50/20">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-indigo-600 rounded-2xl shadow-[0_8px_16px_-4px_rgba(79,70,229,0.3)] flex items-center justify-center">
                <MessageSquarePlus className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 leading-none tracking-tight">
                  {t('chat.newRequest')}
                </h3>
                <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-[0.2em] opacity-100">{t('chat.secureTransmission')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isCreating}
              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 disabled:opacity-30 active:scale-90"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 relative">
            <AnimatePresence>
              {isCreating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/70 backdrop-blur-xl z-[60] flex flex-col items-center justify-center"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                    <Zap className="absolute inset-0 m-auto text-indigo-600 animate-pulse fill-current" size={32} />
                  </div>
                  <div className="text-indigo-950 font-black text-lg tracking-tight uppercase">{t('chat.initializing')}</div>
                  <div className="text-[9px] text-indigo-400 mt-2 uppercase tracking-[0.3em] font-black animate-pulse">{t('chat.protocols')}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Case Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
                <Layers size={13} className="text-indigo-600 font-bold" /> {t('chat.subjectDomain')}
              </label>
              <select
                name="caseId"
                value={formData.caseId}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all font-black text-gray-900 text-sm appearance-none cursor-pointer"
              >
                <option value="">{t('chat.selectDomain')}</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.department?.name || "Support"})
                  </option>
                ))}
              </select>
            </div>

            {/* Tin Number & Pads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
                  <Hash size={13} className="text-rose-500" /> {t('chat.referenceId')}
                </label>
                <input
                  type="text"
                  name="tinNumber"
                  value={formData.tinNumber}
                  onChange={handleChange}
                  placeholder={t('chat.placeholderRef')}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all font-black text-gray-900 placeholder:text-gray-300 text-sm italic"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
                  <Layers size={13} className="text-emerald-500" /> {t('chat.units')}
                </label>
                <input
                  type="number"
                  name="numberOfPads"
                  value={formData.numberOfPads}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all font-black text-gray-900 text-sm"
                />
              </div>
            </div>

            {/* Receipt Type & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
                  <FileText size={13} className="text-amber-500" /> {t('chat.orgType')}
                </label>
                <select
                  name="receiptType"
                  value={formData.receiptType}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all font-black text-gray-900 text-sm appearance-none cursor-pointer"
                >
                  <option value="private">{t('chat.privateSector')}</option>
                  <option value="gov't">{t('chat.governmental')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
                  <Building2 size={13} className="text-indigo-600" /> {t('chat.entityName')}
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder={t('chat.placeholderEntity')}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all font-black text-gray-900 placeholder:text-gray-300 text-sm italic"
                />
              </div>
            </div>

            {/* Complaint Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
                <FileText size={13} className="text-gray-500" /> {t('chat.payload')}
              </label>
              <textarea
                name="complaintDescription"
                value={formData.complaintDescription}
                onChange={handleChange}
                placeholder={t('chat.placeholderPayload')}
                rows={3}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-8 focus:ring-indigo-100/50 outline-none transition-all font-black text-gray-900 placeholder:text-gray-300 resize-none text-sm italic"
              ></textarea>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full py-5 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base uppercase tracking-[0.25em] shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all"
              >
                {isCreating ? t('chat.connecting') : t('chat.initiate')}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
