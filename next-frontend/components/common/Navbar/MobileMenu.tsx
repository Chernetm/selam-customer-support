'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, User, Inbox, Calendar, Search, TrendingUp, Lock, LogOut, LogIn, Activity, LayoutDashboard, UserPlus, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  navLinks: { name: string; path: string; icon: React.ComponentType<{ size: number }> }[];
}

export function MobileMenu({ isOpen, setIsOpen, navLinks }: MobileMenuProps) {
  const { t, language, setLanguage } = useLanguage();
  const { authStatus, logout } = useAuth();
  const { isLogged, isAdmin, role } = authStatus;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
        >
          <div className="px-4 pt-4 pb-6 space-y-4">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Language</span>
              <div className="flex items-center bg-slate-200 p-1 rounded-xl">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 transition-all duration-300 rounded-lg text-xs font-black ${
                    language === 'en' ? "bg-white text-slate-950 shadow-sm" : "text-slate-400"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={`px-4 py-2 transition-all duration-300 rounded-lg text-xs font-black ${
                    language === 'am' ? "bg-white text-slate-950 shadow-sm" : "text-slate-400"
                  }`}
                >
                  አማ
                </button>
              </div>
            </div>


            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                >
                  <Icon size={18} />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
            <div className="h-px bg-gray-100 my-2" />
            {isLogged ? (
              <>
                {isAdmin && (
                  <div className="space-y-1 mb-2">
                    <p className="px-4 text-[10px] font-black text-gray-400 mb-3">{t('nav.management')}</p>
                    
                    {(role === 'super_admin' || role === 'super-admin') && (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl text-indigo-600 bg-indigo-50 font-bold"
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <LayoutDashboard size={20} />
                        </div>
                        <span>{t('nav.dashboard')}</span>
                      </Link>
                    )}

                    {(role === 'agent' || role === 'manager') && (
                      <Link 
                        href="/admin/chat" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl text-indigo-600 bg-indigo-50 font-bold"
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <MessageSquare size={20} />
                        </div>
                        <span>{t('nav.chat')}</span>
                      </Link>
                    )}
                  </div>
                )}
                <div className="space-y-1 mb-2 pt-2 border-t border-gray-50">
                  <p className="px-4 text-[10px] font-black text-gray-400 mb-3">{t('nav.profile')}</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                      <Lock size={20} />
                    </div>
                    <span>{t('nav.changePassword')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-600">
                      <LogOut size={20} />
                    </div>
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600"
                >
                  <LogIn size={18} />
                  <span className="font-medium">{t('nav.login')}</span>
                </Link>
                <Link
                  href="/customer-register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-indigo-600 font-medium bg-indigo-50 rounded-lg mt-2"
                >
                  <User size={18} />
                  <span>{t('auth.createAccount')}</span>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
