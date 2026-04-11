'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, QrCode, AlertCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

interface InPersonInviteCardProps {
  inviteCode: string;
  expiresAt: string;
}

export const InPersonInviteCard = ({ inviteCode, expiresAt }: InPersonInviteCardProps) => {
  const isExpired = new Date(expiresAt) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-indigo-100/50 border border-white mb-8 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
      
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="shrink-0 p-6 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center justify-center">
          {isExpired ? (
            <div className="w-[160px] h-[160px] flex flex-col items-center justify-center text-gray-300">
               <AlertCircle size={48} className="mb-2" />
               <span className="text-[10px] font-black uppercase tracking-widest">Expired</span>
            </div>
          ) : (
            <QRCodeSVG 
              value={inviteCode} 
              size={160}
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
          )}
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-600 mb-2">
               <MapPin size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">In-Person visit authorized</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
               Office Support <span className="text-indigo-600">Sync Clearance</span>
            </h3>
          </div>

          <p className="text-gray-500 font-bold text-[13px] leading-relaxed max-w-sm">
             Our staff has authorized an in-person session to finalize your synchronization. 
             Please present this pulse (QR Code) at our central hub for verification.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                   <Clock size={16} />
                </div>
                <div className="text-left">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Expires In</p>
                   <p className="text-[11px] font-black text-gray-900">
                      {isExpired ? 'Sync Terminal Offline' : format(new Date(expiresAt), 'MMM d, h:mm a')}
                   </p>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                   <QrCode size={16} />
                </div>
                <div className="text-left">
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Clearance ID</p>
                   <p className="text-[11px] font-black text-gray-900 uppercase tracking-tighter">{inviteCode}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {!isExpired && (
        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
           <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">Signal Active • Present Pulse for Authentication</span>
        </div>
      )}
    </motion.div>
  );
};
