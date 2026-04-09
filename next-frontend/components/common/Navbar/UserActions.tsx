'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Lock, LogOut, LogIn, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '@/contexts/LanguageContext';

export function UserActions() {
  const { authStatus, logout } = useAuth();
  const { isLogged, isAdmin, role } = authStatus;
  const { t } = useLanguage();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLogged) {
    return (
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Profile Dropdown Trigger */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-300 border ${isDropdownOpen
            ? 'bg-white/10 border-white/20 shadow-sm shadow-black/20 text-white'
            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-slate-200'
            }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isDropdownOpen ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-400 group-hover:bg-white/20 group-hover:text-white'
            }`}>
            <User size={18} />
          </div>
          <div className="hidden lg:flex flex-col items-start leading-none text-left pr-2">
            <span className="text-[11px] font-black mb-0.5">{t('nav.profile')}</span>
            <span className="text-[8px] font-bold text-gray-400">
              {role?.replace('-', ' ') || 'User'}
            </span>
          </div>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-2xl shadow-gray-200/50 p-2 overflow-hidden z-50 origin-top-right"
            >
              <div className="px-4 py-4 border-b border-gray-50 mb-2">
                <p className="text-[10px] font-black text-gray-400">{t('nav.accountAccess')}</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[1.25rem] text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <span className="text-sm">{t('nav.changePassword')}</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[1.25rem] text-red-600 hover:bg-red-50 transition-all font-bold group mt-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                    <LogOut size={18} />
                  </div>
                  <span className="text-sm">{t('nav.signOut')}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userType={isAdmin ? 'admin' : 'customer'}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login">
        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-slate-200 hover:text-white hover:bg-white/5">
          <LogIn size={16} />
          {t('nav.login')}
        </Button>
      </Link>
      <Link href="/customer-register">
        <Button size="sm" className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 border-none">
          <User size={16} />
          {t('nav.register')}
        </Button>
      </Link>
    </div>
  );
}
