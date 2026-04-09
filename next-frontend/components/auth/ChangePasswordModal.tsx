'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, CheckCircle, AlertCircle, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { changePasswordAdmin, changePasswordCustomer } from '@/lib/api/auth';
import { evaluatePasswordStrength, PasswordStrengthResult } from '@/lib/utils/passwordStrength';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'admin' | 'customer';
}

export function ChangePasswordModal({ isOpen, onClose, userType }: ChangePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [strength, setStrength] = useState<PasswordStrengthResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (password) {
      setStrength(evaluatePasswordStrength(password));
    } else {
      setStrength(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strength || strength.score < 4) {
      setError('Please fulfill all password strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setStatus('loading');

    try {
      if (userType === 'admin') {
        await changePasswordAdmin(password);
      } else {
        await changePasswordCustomer(password);
      }

      setStatus('success');
      toast.success('Password updated successfully');

      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => {
            setStatus('idle');
            setPassword('');
            setConfirmPassword('');
        }, 300);
      }, 2000);

    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.error || 'Failed to update password. Please try again.');
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 outline-none">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              style={{ pointerEvents: 'auto' }}
            />

            {/* Modal Container to ensure perfect centering */}
            <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 0 }}
                className="pointer-events-auto w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/60"
              >
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-12 text-center"
                    >
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                        <CheckCircle size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Success!</h3>
                      <p className="text-gray-500 font-bold text-sm">Your secure transmission credentials have been updated.</p>
                    </motion.div>
                  ) : (
                    <motion.div key="form">
                      {/* Header */}
                      <div className="p-6 pb-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                <Lock size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">Security</h3>
                                <p className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase mt-1">Credentials Access</p>
                            </div>
                        </div>
                        <button
                          onClick={onClose}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-900 hover:bg-white transition-all border border-transparent hover:border-gray-100"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Form Content */}
                      <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                              New Password
                            </label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                              <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all font-bold text-black"
                                placeholder="Enter robust password..."
                              />
                            </div>
                          </div>

                          {/* Strength Indicators */}
                          {strength && (
                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   {strength.score >= 4 ? <ShieldCheck className="text-emerald-500" size={16} /> : strength.score >= 2 ? <Shield className="text-amber-500" size={16} /> : <ShieldAlert className="text-rose-500" size={16} />}
                                   <span className={clsx(
                                     "text-[10px] font-black uppercase tracking-widest",
                                     strength.score >= 4 ? "text-emerald-600" : strength.score >= 2 ? "text-amber-600" : "text-rose-600"
                                   )}>
                                     Strength: {strength.label}
                                   </span>
                                </div>
                                <div className="flex gap-1">
                                   {[1, 2, 3, 4].map((step) => (
                                     <div 
                                       key={step}
                                       className={clsx(
                                         "h-1.5 w-6 rounded-full transition-all duration-500",
                                         strength.score >= step 
                                            ? (strength.score >= 4 ? "bg-emerald-500" : strength.score >= 2 ? "bg-amber-500" : "bg-rose-500")
                                            : "bg-gray-200"
                                       )}
                                     />
                                   ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-y-2">
                                <Requirement checked={strength.requirements.length} label="8+ Characters" />
                                <Requirement checked={strength.requirements.uppercase} label="Uppercase" />
                                <Requirement checked={strength.requirements.number} label="Numbers" />
                                <Requirement checked={strength.requirements.special} label="Special Char" />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                              Confirm Transmission Key
                            </label>
                            <div className="relative group">
                              <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                              <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-100/50 outline-none transition-all font-bold text-black"
                                placeholder="Re-verify credentials..."
                              />
                            </div>
                          </div>
                        </div>

                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider rounded-2xl flex items-center gap-3 border border-rose-100 shadow-sm"
                          >
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                          </motion.div>
                        )}

                        <div className="flex gap-4 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl border-gray-100 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 active:scale-95 transition-all"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={status === 'loading'}
                            className="flex-1 h-14 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {status === 'loading' ? 'Authenticating...' : 'Update Access'}
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return typeof document !== 'undefined' ? require('react-dom').createPortal(modalContent, document.body) : null;
}

function Requirement({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={clsx(
        "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors shadow-sm",
        checked ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-300"
      )}>
        <CheckCircle size={10} />
      </div>
      <span className={clsx(
        "text-[9px] font-black uppercase tracking-widest",
        checked ? "text-gray-900" : "text-gray-400"
      )}>
        {label}
      </span>
    </div>
  );
}
